/**
 * Multi-tenant Resolver
 * 
 * Resolves tenant from:
 * 1. Custom domain (e.g., acme.com -> tenant_domains lookup)
 * 2. Subdomain (e.g., acme.atomlms.kr -> slug=acme)
 * 3. Query parameter (e.g., ?tenant=acme, for development)
 */

import { supabase } from "@/integrations/supabase/client";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  branding: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    favicon_url?: string;
  };
  settings: {
    language?: string;
    timezone?: string;
    allow_public_courses?: boolean;
  };
}

let cachedTenant: Tenant | null = null;
let tenantResolvePromise: Promise<Tenant | null> | null = null;

/**
 * Resolve tenant from hostname or query params
 */
export async function resolveTenant(): Promise<Tenant | null> {
  // Return cached tenant if available
  if (cachedTenant) {
    return cachedTenant;
  }

  // Return existing promise if resolution is in progress
  if (tenantResolvePromise) {
    return tenantResolvePromise;
  }

  tenantResolvePromise = (async () => {
    try {
      const hostname = window.location.hostname;
      const searchParams = new URLSearchParams(window.location.search);
      const queryTenant = searchParams.get('tenant');

      let tenant: Tenant | null = null;

      // 🔧 DEBUG MODE: localhost에서 테스트용 테넌트 자동 로드
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        console.log('🔧 [DEBUG] Localhost detected - Loading demo tenant');
        
        // URL에서 subdomain 파라미터를 먼저 확인
        const urlPath = window.location.pathname;
        const tenantMatch = urlPath.match(/^\/tenant\/([^/]+)/);
        
        if (tenantMatch) {
          const subdomainFromUrl = tenantMatch[1];
          console.log('🔧 [DEBUG] Found subdomain in URL:', subdomainFromUrl);
          
          const { data } = await supabase
            .from('tenants')
            .select('*')
            .eq('slug', subdomainFromUrl)
            .eq('is_active', true)
            .single();
          
          if (data) {
            tenant = data as Tenant;
            console.log('🔧 [DEBUG] Loaded tenant from URL:', tenant.name);
          }
        }
        
        // URL에서 못 찾으면 첫 번째 active tenant 사용
        if (!tenant) {
          const { data } = await supabase
            .from('tenants')
            .select('*')
            .eq('is_active', true)
            .limit(1)
            .single();
          
          if (data) {
            tenant = data as Tenant;
            console.log('🔧 [DEBUG] Loaded first available tenant:', tenant.name);
          }
        }
        
        if (tenant) {
          cachedTenant = tenant;
          return tenant;
        }
      }

      // Priority 1: Query parameter (for development)
      if (queryTenant) {
        const { data } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', queryTenant)
          .eq('is_active', true)
          .single();
        
        if (data) {
          tenant = data as Tenant;
        }
      }

      // Priority 2: Custom domain lookup (skip for main domain atomlms.kr)
      if (!tenant && 
          !hostname.includes('localhost') && 
          !hostname.includes('127.0.0.1') &&
          hostname !== 'atomlms.kr') {
        const { data: domainData } = await supabase
          .from('tenant_domains')
          .select('tenant_id, tenants(*)')
          .eq('domain', hostname)
          .eq('is_verified', true)
          .single();

        if (domainData && domainData.tenants) {
          tenant = domainData.tenants as unknown as Tenant;
        }
      }

      // Priority 3: Subdomain extraction (e.g., acme.atomlms.kr)
      if (!tenant) {
        const subdomain = extractSubdomain(hostname);
        if (subdomain && subdomain !== 'www') {
          const { data } = await supabase
            .from('tenants')
            .select('*')
            .eq('slug', subdomain)
            .eq('is_active', true)
            .single();

          if (data) {
            tenant = data as Tenant;
          }
        }
      }

      // Cache the result
      if (tenant) {
        cachedTenant = tenant;
      }

      return tenant;
    } catch (error) {
      console.error('Error resolving tenant:', error);
      return null;
    } finally {
      tenantResolvePromise = null;
    }
  })();

  return tenantResolvePromise;
}

/**
 * Extract subdomain from hostname
 * Examples:
 *   acme.atomlms.kr -> acme
 *   www.atomlms.kr -> www
 *   localhost:5173 -> null
 */
function extractSubdomain(hostname: string): string | null {
  // Skip localhost and IP addresses
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return null;
  }

  const parts = hostname.split('.');
  
  // Need at least 3 parts for subdomain (e.g., acme.atomlms.kr)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

/**
 * Get current tenant (from cache or resolve)
 */
export function getCurrentTenant(): Tenant | null {
  return cachedTenant;
}

/**
 * Clear tenant cache (useful for testing or tenant switching)
 */
export function clearTenantCache(): void {
  cachedTenant = null;
  tenantResolvePromise = null;
}

/**
 * Apply tenant branding to DOM
 */
export function applyTenantBranding(tenant: Tenant): void {
  const root = document.documentElement;
  
  if (tenant.branding?.primary_color) {
    root.style.setProperty('--primary', tenant.branding.primary_color);
  }
  
  if (tenant.branding?.secondary_color) {
    root.style.setProperty('--secondary', tenant.branding.secondary_color);
  }

  if (tenant.branding?.favicon_url) {
    updateFavicon(tenant.branding.favicon_url);
  }

  // Update page title if tenant name is available
  if (tenant.name) {
    document.title = `${tenant.name} - LMS`;
  }
}

/**
 * Update favicon dynamically
 */
function updateFavicon(faviconUrl: string): void {
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = faviconUrl;
  document.getElementsByTagName('head')[0].appendChild(link);
}
