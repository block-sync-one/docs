/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_CLIENT_RPC?: string;
  readonly VITE_DYNAMIC_ENVIRONMENT_ID?: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

