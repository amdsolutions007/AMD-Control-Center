function parseBoolean(value, fallback = false) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function parsePositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = Object.freeze({
  serviceName: "AMD Runway Control",
  version: "0.1.0",
  port: Number(process.env.PORT || 3000),
  runwaySecret: process.env.RUNWAYML_API_SECRET?.trim() || "",
  runwayApiBase: (process.env.RUNWAY_API_BASE || "https://api.dev.runwayml.com").replace(/\/$/, ""),
  runwayApiVersion: process.env.RUNWAY_API_VERSION || "2024-11-06",
  writesEnabled: parseBoolean(process.env.AMD_RUNWAY_WRITES_ENABLED, false),
  maxCreditsPerJob: parsePositiveNumber(process.env.AMD_RUNWAY_MAX_CREDITS_PER_JOB, 250),
});

export function publicStatus() {
  return {
    service: config.serviceName,
    version: config.version,
    runwayDeveloperApiConfigured: Boolean(config.runwaySecret),
    writesEnabled: config.writesEnabled,
    maxCreditsPerJob: config.maxCreditsPerJob,
    apiVersion: config.runwayApiVersion,
    mode: config.writesEnabled ? "controlled-write" : "read-only",
  };
}
