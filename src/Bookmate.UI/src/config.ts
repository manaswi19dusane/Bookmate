const viteEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env;

const DEFAULT_API_URL = "http://localhost:8000";

export const API_ROOT = (
  viteEnv?.VITE_API_URL ||
  viteEnv?.VITE_API_BASE_URL ||
  DEFAULT_API_URL
).replace(/\/$/, "");

