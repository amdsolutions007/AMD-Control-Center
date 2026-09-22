import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { publicStatus } from "./config.mjs";
import {
  cancelTask,
  getOrganization,
  getTask,
  getUsage,
  listRouters,
  routerDryRun,
  routerGenerate,
} from "./runway.mjs";

function jsonContent(value) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function toolError(error) {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            error: error instanceof Error ? error.message : String(error),
            status: error?.status ?? null,
          },
          null,
          2
        ),
      },
    ],
  };
}

function safe(handler) {
  return async (args) => {
    try {
      return await handler(args);
    } catch (error) {
      return toolError(error);
    }
  };
}

export const mcpHandler = createMcpHandler(() => {
  const server = new McpServer(
    {
      name: "amd-runway-control",
      version: "0.1.0",
    },
    {
      instructions:
        "AMD Runway Control. Never reveal RUNWAYML_API_SECRET. Read actions are allowed when configured. Live generation and task cancellation are fail-closed unless AMD_RUNWAY_WRITES_ENABLED=true. Every routed live generation must first perform a Runway dry-run and must not exceed AMD_RUNWAY_MAX_CREDITS_PER_JOB.",
    }
  );

  server.registerTool(
    "runway_control_status",
    {
      description:
        "Return AMD Runway Control readiness, write-gate state, API version, and per-job credit cap. Does not expose secrets.",
      inputSchema: z.object({}),
    },
    safe(async () => jsonContent(publicStatus()))
  );

  server.registerTool(
    "runway_get_organization",
    {
      description:
        "Read the Runway Developer organization information for the configured API credential.",
      inputSchema: z.object({}),
    },
    safe(async () => jsonContent(await getOrganization()))
  );

  server.registerTool(
    "runway_get_usage",
    {
      description:
        "Read Runway Developer API credit usage for this API project. Optional date/cursor parameters are passed through to the official usage endpoint.",
      inputSchema: z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
        cursor: z.string().optional(),
      }),
    },
    safe(async (args) => jsonContent(await getUsage(args)))
  );

  server.registerTool(
    "runway_list_routers",
    {
      description:
        "List Runway Model Router configurations available to the configured Developer API project.",
      inputSchema: z.object({}),
    },
    safe(async () => jsonContent(await listRouters()))
  );

  server.registerTool(
    "runway_get_task",
    {
      description:
        "Read the current state and output metadata for one Runway Developer API task.",
      inputSchema: z.object({
        id: z.string().min(1),
      }),
    },
    safe(async ({ id }) => jsonContent(await getTask(id)))
  );

  server.registerTool(
    "runway_router_dry_run",
    {
      description:
        "Perform a no-charge Runway Model Router dry-run for image, video, or audio. Use this before any live generation to inspect routing and estimated credit cost.",
      inputSchema: z.object({
        modality: z.enum(["image", "video", "audio"]),
        configId: z.string().min(1),
        input: z.record(z.string(), z.unknown()),
      }),
    },
    safe(async (args) => jsonContent(await routerDryRun(args)))
  );

  server.registerTool(
    "runway_router_generate",
    {
      description:
        "Create a live Runway image, video, or audio generation through Model Router. AMD governance automatically performs a dry-run first and blocks the request if the estimated cost exceeds the server-side per-job cap. Requires write mode to be enabled.",
      inputSchema: z.object({
        modality: z.enum(["image", "video", "audio"]),
        configId: z.string().min(1),
        input: z.record(z.string(), z.unknown()),
        confirm: z.literal(true),
      }),
    },
    safe(async ({ confirm: _confirm, ...args }) =>
      jsonContent(await routerGenerate(args))
    )
  );

  server.registerTool(
    "runway_cancel_task",
    {
      description:
        "Cancel/delete a Runway Developer API task. Requires AMD write mode and explicit confirmation.",
      inputSchema: z.object({
        id: z.string().min(1),
        confirm: z.literal(true),
      }),
    },
    safe(async ({ id }) => jsonContent(await cancelTask(id)))
  );

  return server;
});
