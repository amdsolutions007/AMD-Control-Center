import { config } from "./config.mjs";

const ALLOWED_MODALITIES = new Set(["image", "video", "audio"]);

function assertConfigured() {
  if (!config.runwaySecret) {
    throw new Error("RUNWAYML_API_SECRET is not configured in this deployment.");
  }
}

function assertWritesEnabled() {
  if (!config.writesEnabled) {
    throw new Error("Runway write actions are disabled by AMD governance. Set AMD_RUNWAY_WRITES_ENABLED=true only after authentication and certification.");
  }
}

function normalizePath(path) {
  if (!path.startsWith("/v1/")) {
    throw new Error("Only Runway Developer API /v1 paths are allowed.");
  }
  return path;
}

export async function runwayRequest(path, { method = "GET", query = {}, body } = {}) {
  assertConfigured();
  const safePath = normalizePath(path);
  const url = new URL(config.runwayApiBase + safePath);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${config.runwaySecret}`,
      "X-Runway-Version": config.runwayApiVersion,
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const raw = await response.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { raw };
    }
  }

  if (!response.ok) {
    const detail =
      payload?.error ||
      payload?.message ||
      payload?.raw ||
      `HTTP ${response.status}`;
    const error = new Error(`Runway API request failed: ${detail}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload ?? { ok: true, status: response.status };
}

export function getOrganization() {
  return runwayRequest("/v1/organization");
}

export function getUsage({ from, to, limit, cursor } = {}) {
  return runwayRequest("/v1/organization/usage", {
    query: { from, to, limit, cursor },
  });
}

export function listRouters() {
  return runwayRequest("/v1/routers");
}

export function getTask(id) {
  return runwayRequest(`/v1/tasks/${encodeURIComponent(id)}`);
}

export function cancelTask(id) {
  assertWritesEnabled();
  return runwayRequest(`/v1/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

function assertModality(modality) {
  if (!ALLOWED_MODALITIES.has(modality)) {
    throw new Error("modality must be one of: image, video, audio");
  }
}

export function routerDryRun({ modality, configId, input }) {
  assertModality(modality);
  return runwayRequest(`/v1/generate/${modality}`, {
    method: "POST",
    body: {
      configId,
      input,
      dryRun: true,
    },
  });
}

function extractEstimatedCredits(result) {
  const candidates = [
    result?.routing?.estimatedCost,
    result?.routing?.estimatedCredits,
    result?.estimatedCost,
    result?.estimatedCredits,
  ];

  for (const value of candidates) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return null;
}

export async function routerGenerate({ modality, configId, input }) {
  assertWritesEnabled();

  const dryRun = await routerDryRun({ modality, configId, input });
  const estimatedCredits = extractEstimatedCredits(dryRun);

  if (estimatedCredits === null) {
    throw new Error(
      "Generation blocked: Runway dry-run did not return a usable credit estimate, so AMD cost governance failed closed."
    );
  }

  if (estimatedCredits > config.maxCreditsPerJob) {
    throw new Error(
      `Generation blocked: estimated cost ${estimatedCredits} credits exceeds AMD per-job cap of ${config.maxCreditsPerJob} credits.`
    );
  }

  const generation = await runwayRequest(`/v1/generate/${modality}`, {
    method: "POST",
    body: { configId, input },
  });

  return {
    governance: {
      dryRunRequired: true,
      estimatedCredits,
      maxCreditsPerJob: config.maxCreditsPerJob,
      decision: "allowed",
    },
    routing: dryRun?.routing ?? null,
    generation,
  };
}
