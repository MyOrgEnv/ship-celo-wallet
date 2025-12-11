// Global ambient types for documentation generation and feature flags
interface ImportMetaEnv {
  readonly ENABLE_GPT_5_1_CODEX_MAX?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const process: {
  env: {
    ENABLE_GPT_5_1_CODEX_MAX?: string;
  };
};
