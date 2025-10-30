-- Update admin menu order to include usage management
UPDATE menu_order 
SET menu_items = '[
  {"id":"dashboard","icon":"LayoutDashboard","label":"대시보드","path":"/admin","enabled":true},
  {"id":"users","icon":"Users","label":"사용자 관리","path":"/admin/users","enabled":true},
  {"id":"courses","icon":"BookOpen","label":"강좌 관리","path":"/admin/courses","enabled":true},
  {"id":"content","icon":"FolderOpen","label":"콘텐츠 관리","path":"/admin/content","enabled":true},
  {"id":"learning","icon":"BarChart3","label":"학습 관리","path":"/admin/learning","enabled":true},
  {"id":"tenants","icon":"Building2","label":"고객사 관리","path":"/admin/tenants","enabled":true},
  {"id":"revenue","icon":"DollarSign","label":"매출 관리","path":"/admin/revenue","enabled":true},
  {"id":"usage","icon":"BarChart3","label":"사용량 관리","path":"/admin/usage","enabled":true},
  {"id":"ai-logs","icon":"Brain","label":"AI 로그","path":"/admin/ai-logs","enabled":true},
  {"id":"monitoring","icon":"Shield","label":"시스템 모니터링","path":"/admin/monitoring","enabled":true},
  {"id":"settings","icon":"Settings","label":"시스템 설정","path":"/admin/settings","enabled":true}
]'::jsonb,
updated_at = now()
WHERE user_role = 'admin';