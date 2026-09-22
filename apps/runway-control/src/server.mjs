import express from "express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { mcpHandler } from "./mcp.mjs";
import { config, publicStatus } from "./config.mjs";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    ...publicStatus(),
  });
});

app.get("/ready", (_req, res) => {
  const status = publicStatus();
  res.status(200).json({
    ok: true,
    controlPlaneReady: true,
    runwayDeveloperApiReady: status.runwayDeveloperApiConfigured,
    writesReady:
      status.runwayDeveloperApiConfigured && status.writesEnabled,
    ...status,
  });
});

const nodeHandler = toNodeHandler(mcpHandler);
app.all("/mcp", (req, res) => {
  void nodeHandler(req, res, req.body);
});

app.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});

app.listen(config.port, "0.0.0.0", () => {
  const status = publicStatus();
  console.log(
    JSON.stringify({
      event: "amd_runway_control_started",
      port: config.port,
      ...status,
    })
  );
});
