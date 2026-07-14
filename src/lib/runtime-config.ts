const REQUIRED_RUNTIME_KEYS = ["DATABASE_URL", "AUTH_SECRET"] as const;

type RuntimeConfigValues = Partial<Record<(typeof REQUIRED_RUNTIME_KEYS)[number], string | undefined>>;

/** Returns missing configuration names only; never return secret values to callers. */
export function getMissingRuntimeConfig(env?: RuntimeConfigValues): string[] {
  const values = env ?? process.env;
  return REQUIRED_RUNTIME_KEYS.filter((key) => !values[key]?.trim());
}
