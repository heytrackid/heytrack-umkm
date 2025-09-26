/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_FORCE_LOGS: string;
  readonly VITE_ANALYZE: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_ENABLE_REALTIME: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_OFFLINE_MODE: string;
  readonly VITE_BUILD_ID: string;
  readonly VITE_COMMIT_HASH: string;
  readonly VITE_BUILD_TIME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}