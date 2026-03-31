/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly NEXT_PUBLIC_GEMINI_API_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_TAX_RATE: string
  readonly VITE_LOYALTY_CASHBACK_RATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}