# AtomLMS 멀티테넌트 아키텍처 가이드

## 🏗️ 아키텍처 개요

AtomLMS는 **단일 코드베이스**로 **수백 개의 고객사**가 동시에 사용할 수 있는 **프로덕션급 멀티테넌트 LMS**입니다.

### 핵심 원칙
1. **완전한 데이터 격리**: 테넌트 A는 절대 테넌트 B의 데이터에 접근 불가
2. **Row Level Security (RLS)**: 모든 테이블에 RLS 정책 적용
3. **단일 스키마 + tenant_id**: 모든 핵심 테이블에 tenant_id 컬럼
4. **도메인 기반 라우팅**: 커스텀 도메인 또는 서브도메인으로 테넌트 식별
5. **감사 로그**: 모든 중요 액션 추적 및 기록

## 📊 데이터베이스 스키마

### 테넌트 관리 테이블

#### `tenants`
테넌트(고객사) 메인 테이블
```sql
- id (UUID, PK)
- name (TEXT) - 테넌트 이름
- slug (TEXT, UNIQUE) - URL 슬러그 (예: acme)
- subdomain (TEXT, UNIQUE) - 서브도메인 (예: acme.atomlms.kr)
- plan_id (UUID, FK → plans)
- status (tenant_status) - trial, active, suspended, terminated
- is_active (BOOLEAN)
- branding (JSONB) - 로고, 색상, 파비콘 등
- settings (JSONB) - 언어, 타임존 등
- trial_end_date, contract_start_date, contract_end_date (DATE)
```

#### `plans`
플랫폼 전체 요금제
```sql
- id (UUID, PK)
- name (TEXT) - Free, Basic, Pro, Enterprise
- tier (plan_tier)
- price_monthly (NUMERIC)
- limits (JSONB) - max_users, max_courses, max_storage_gb 등
- features (JSONB) - 사용 가능한 기능 목록
```

#### `tenant_domains`
커스텀 도메인 매핑
```sql
- id (UUID, PK)
- tenant_id (UUID, FK → tenants)
- domain (TEXT, UNIQUE) - 예: acme.com
- is_primary (BOOLEAN)
- is_verified (BOOLEAN)
- ssl_status (TEXT)
```

#### `memberships`
테넌트 범위 사용자 역할
```sql
- id (UUID, PK)
- tenant_id (UUID, FK → tenants)
- user_id (UUID) - Supabase auth.users
- role (membership_role) - student, instructor, admin, operator
- is_active (BOOLEAN)
- joined_at (TIMESTAMPTZ)
```

#### `audit_logs_v2`
모든 액션 감사 로그
```sql
- id (UUID, PK)
- tenant_id (UUID, FK → tenants, NULLABLE)
- actor_user_id (UUID) - 행위자
- impersonated_by (UUID, NULLABLE) - 임퍼스네이션 시 운영자 ID
- action (TEXT) - user.login, course.create 등
- entity_type, entity_id (TEXT, UUID)
- changes (JSONB) - 변경 전후 데이터
- ip_address, user_agent
```

#### `usage_counters`
테넌트별 사용량 집계
```sql
- id (UUID, PK)
- tenant_id (UUID, FK → tenants)
- metric (TEXT) - active_users, storage_bytes, api_calls 등
- value (BIGINT)
- period_start, period_end (TIMESTAMPTZ)
```

### 기존 테이블 수정

모든 테넌트 소유 데이터 테이블에 `tenant_id` 컬럼 추가:
- courses
- enrollments
- assignments
- assignment_submissions
- course_contents
- content_progress
- attendance

## 🔐 보안: RLS 정책

### Security Definer 함수

**무한 재귀 방지**를 위해 SECURITY DEFINER 함수 사용:

```sql
-- 사용자의 특정 테넌트 내 역할 확인
CREATE FUNCTION has_membership_role(_user_id UUID, _tenant_id UUID, _role membership_role)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public;

-- 플랫폼 운영자 여부 확인
CREATE FUNCTION is_operator(_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER;

-- 사용자가 속한 모든 테넌트 ID 반환
CREATE FUNCTION get_user_tenant_ids(_user_id UUID)
RETURNS SETOF UUID
SECURITY DEFINER;
```

### RLS 정책 예시

#### courses 테이블
```sql
-- 조회: 테넌트 멤버이고 published 상태인 강좌만
CREATE POLICY "Tenant members can view published courses"
  ON courses FOR SELECT
  USING (
    status = 'published'
    AND tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
  );

-- 생성/수정: instructor 또는 admin만
CREATE POLICY "Instructors can manage their courses"
  ON courses FOR ALL
  USING (
    instructor_id = auth.uid()
    AND tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
    OR has_membership_role(auth.uid(), tenant_id, 'admin')
    OR is_operator(auth.uid())
  );
```

#### enrollments 테이블
```sql
-- 수강 신청: 해당 테넌트 멤버만
CREATE POLICY "Tenant students can enroll"
  ON enrollments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
  );
```

## 📚 핵심 라이브러리 사용법

### 1. Tenant Resolver

테넌트 식별 및 브랜딩 적용:

```typescript
import { resolveTenant, applyTenantBranding, getCurrentTenant } from '@/lib/tenant-resolver';

// 앱 초기화 시
const tenant = await resolveTenant();
if (tenant) {
  applyTenantBranding(tenant);
  console.log(`현재 테넌트: ${tenant.name} (${tenant.slug})`);
}

// 이후 어디서든 캐시된 테넌트 사용
const currentTenant = getCurrentTenant();
```

**테넌트 식별 우선순위:**
1. 쿼리 파라미터: `?tenant=acme` (개발용)
2. 커스텀 도메인: `acme.com` → tenant_domains 조회
3. 서브도메인: `acme.atomlms.kr` → slug로 조회

### 2. Membership & Roles

역할 확인 및 권한 체크:

```typescript
import {
  getUserRoleInTenant,
  isTenantAdmin,
  isTenantInstructor,
  isOperator,
  hasRole
} from '@/lib/auth/membership';

// 사용자 역할 조회
const role = await getUserRoleInTenant(userId, tenantId);
// role: 'student' | 'instructor' | 'admin' | 'operator'

// 권한 확인
const isAdmin = await isTenantAdmin(userId, tenantId);
const canTeach = await isTenantInstructor(userId, tenantId); // admin도 true
const isPlatformOperator = await isOperator(userId);

// 특정 역할 체크
if (await hasRole(userId, tenantId, 'instructor')) {
  // 강사만 접근 가능
}

// 멤버십 추가
await addMembership(tenantId, newUserId, 'student', invitedByUserId);
```

### 3. Audit Logger

모든 중요 액션 로깅:

```typescript
import {
  logCreate,
  logUpdate,
  logDelete,
  logLogin,
  logImpersonation
} from '@/lib/audit/audit-logger';

// 리소스 생성 시
await logCreate(userId, tenantId, 'course', courseId, courseData);

// 리소스 수정 시
await logUpdate(userId, tenantId, 'course', courseId, beforeData, afterData);

// 리소스 삭제 시
await logDelete(userId, tenantId, 'course', courseId, courseData);

// 로그인/로그아웃
await logLogin(userId, tenantId);
await logLogout(userId, tenantId);

// 운영자 임퍼스네이션
await logImpersonation(operatorId, targetUserId, tenantId);

// 감사 로그 조회
const logs = await getTenantAuditLogs(tenantId, 100, 0);
```

## 🚀 로컬 개발 가이드

### 1. 환경 설정

`.env` 파일은 이미 설정되어 있습니다:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

### 2. 시드 데이터 생성

#### 플랜 확인
```sql
SELECT * FROM plans ORDER BY price_monthly;
```

이미 4개 플랜이 생성되어 있습니다:
- Free (₩0/월)
- Basic (₩29,000/월)
- Pro (₩99,000/월)
- Enterprise (₩299,000/월)

#### 테스트 테넌트 생성
```sql
-- 1. 테넌트 생성
INSERT INTO tenants (name, slug, subdomain, status, is_active) 
VALUES ('ACME Corporation', 'acme', 'acme', 'active', true)
RETURNING id;

-- 2. 테스트 사용자에게 admin 권한 부여
INSERT INTO memberships (tenant_id, user_id, role)
VALUES ('[tenant_id]', '[your_user_id]', 'admin');
```

#### 접속 방법
```
개발: http://localhost:5173?tenant=acme
프로덕션 (서브도메인): https://acme.atomlms.kr
프로덕션 (커스텀 도메인): https://acme.com
```

## 📋 Phase 별 구현 로드맵

### ✅ Phase 1: 데이터베이스 & 보안 (완료)
- [x] 멀티테넌트 스키마 설계
- [x] RLS 정책 적용
- [x] Security Definer 함수
- [x] 핵심 유틸리티 라이브러리
- [x] 시드 데이터 (플랜, 기능)

### 🔄 Phase 2: Operator Console (다음)
- [ ] 테넌트 목록 및 상세 페이지
- [ ] 테넌트 생성/수정/중지 UI
- [ ] 플랜 변경 및 한도 설정
- [ ] 임퍼스네이션 기능
- [ ] 전체 감사 로그 조회
- [ ] 사용량 대시보드

### Phase 3: Tenant Admin Settings
- [ ] 브랜딩 설정 (로고, 색상, 파비콘)
- [ ] 도메인 연결 UI
- [ ] 기능 플래그 토글
- [ ] 사용자 초대 및 역할 관리
- [ ] SSO 설정 (Google, Kakao)
- [ ] 플랜 업그레이드/다운그레이드

### Phase 4: 기존 기능 멀티테넌시 적용
- [ ] 강좌 생성 시 tenant_id 자동 설정
- [ ] 파일 업로드 테넌트 prefix 격리
- [ ] 테넌트별 알림 발송
- [ ] 성적표/수료증 테넌트 템플릿
- [ ] 대량 등록 (엑셀/CSV) 테넌트 격리

### Phase 5: Usage & Billing
- [ ] 사용량 카운터 자동 집계
- [ ] 한도 초과 UI 가드
- [ ] Stripe 연동 (구독/결제)
- [ ] 청구서 자동 생성
- [ ] 사용량 리포트

### Phase 6: 테스트 & 문서
- [ ] 테넌트 격리 테스트
- [ ] 보안 테스트 (RLS 우회 시도)
- [ ] 성능 테스트 (대량 테넌트)
- [ ] 운영 매뉴얼 작성
- [ ] API 문서화

## 🧪 테스트 시나리오

### 필수 보안 테스트

#### 1. 테넌트 데이터 격리
```typescript
// Tenant A 사용자로 로그인
// Tenant B의 course_id로 접근 시도
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('id', tenantB_courseId);

// 예상 결과: data = [] (RLS에 의해 차단)
```

#### 2. 크로스 테넌트 수강 신청 차단
```typescript
// Tenant A 사용자로 로그인
// Tenant B의 강좌에 수강 신청 시도
const { error } = await supabase
  .from('enrollments')
  .insert({
    user_id: userA_id,
    course_id: tenantB_courseId,
    tenant_id: tenantB_id // 다른 테넌트
  });

// 예상 결과: error (RLS WITH CHECK 실패)
```

#### 3. 임퍼스네이션 감사 로그
```typescript
// Operator가 임퍼스네이션 실행
await logImpersonation(operatorId, targetUserId, tenantId);

// 이후 모든 액션은 impersonated_by 필드에 operator ID 기록
// 감사 로그에서 원 행위자와 대상 사용자 모두 추적 가능
```

## 🔧 운영 도구

### 데이터베이스 헬스 체크

```sql
-- RLS가 비활성화된 테이블 찾기
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT IN (
    SELECT tablename FROM pg_policies WHERE schemaname = 'public'
  );

-- tenant_id 없는 테넌트 소유 데이터
SELECT 'courses' as table_name, COUNT(*) as count FROM courses WHERE tenant_id IS NULL
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments WHERE tenant_id IS NULL;
```

### 사용량 모니터링

```sql
-- 테넌트별 활성 사용자 수
SELECT tenant_id, COUNT(DISTINCT user_id) as active_users
FROM memberships
WHERE is_active = true
GROUP BY tenant_id;

-- 테넌트별 스토리지 사용량
SELECT tenant_id, SUM(value) as storage_bytes
FROM usage_counters
WHERE metric = 'storage_bytes'
GROUP BY tenant_id;
```

## 📖 참고 자료

- [Supabase Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Multi-tenant 아키텍처 패턴](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
- [Phase 1 완료 보고서](./docs/multi-tenant-phase1-summary.md)

## 🆘 문제 해결

### Q: RLS 정책이 작동하지 않아요
A: 
1. 테이블에 RLS가 활성화되어 있는지 확인: `ALTER TABLE xxx ENABLE ROW LEVEL SECURITY;`
2. 정책이 올바르게 생성되었는지 확인: `SELECT * FROM pg_policies WHERE tablename = 'xxx';`
3. Security Definer 함수의 search_path 확인

### Q: tenant_id가 NULL입니다
A: 기존 데이터는 수동 마이그레이션이 필요합니다:
```sql
UPDATE courses SET tenant_id = '[default_tenant_id]' WHERE tenant_id IS NULL;
```

### Q: 커스텀 도메인이 연결되지 않아요
A:
1. DNS CNAME 레코드 확인
2. `tenant_domains` 테이블에서 `is_verified = true` 확인
3. SSL 인증서 상태 확인

## 👥 팀 연락처

- 프로젝트: AtomLMS (atomlms.kr)
- 아키텍처 문의: [contact email]
- 긴급 이슈: [support channel]

---

**마지막 업데이트**: Phase 1 완료 (2025-01-06)
