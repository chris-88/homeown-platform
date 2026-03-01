function requiredEnv(name: string): string {
  const value = import.meta.env[name];
  if (typeof value === "string" && value.length > 0) return value;
  return "";
}

const defaultDirectusUrl = import.meta.env.DEV ? "http://localhost:8055" : "";

export const config = {
  directusUrl: requiredEnv("VITE_DIRECTUS_URL") || defaultDirectusUrl,
  appEnv: requiredEnv("VITE_APP_ENV") || (import.meta.env.DEV ? "dev" : "prod"),
  appVersion: requiredEnv("VITE_APP_VERSION") || "dev",
};
