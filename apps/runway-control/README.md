# AMD Runway Control

Governed control plane for the Runway Developer API.

## Mission

Provide one MCP-compatible service that can be used by ChatGPT and coding agents to:

- inspect Runway Developer organization state and API usage,
- inspect Model Router configurations,
- estimate image/video/audio generation cost without charging credits,
- create governed live generations,
- inspect and cancel tasks,
- enforce AMD cost and write-safety gates.

## Security law

1. **Never commit `RUNWAYML_API_SECRET`.**
2. The service starts safely without a Runway secret.
3. `AMD_RUNWAY_WRITES_ENABLED=false` is the default and fail-closed state.
4. Live generation performs a no-charge Model Router dry-run first.
5. A live job is blocked when its estimate exceeds `AMD_RUNWAY_MAX_CREDITS_PER_JOB`.
6. Do not expose `/mcp` publicly until a trusted authentication path is attached (private tunnel or OAuth).
7. The MCP tools never return the Runway secret.

## Environment

Copy `.env.example` locally and set values only in your environment/secrets manager.

- `RUNWAYML_API_SECRET` — Runway Developer API secret.
- `RUNWAY_API_BASE` — defaults to `https://api.dev.runwayml.com`.
- `RUNWAY_API_VERSION` — defaults to `2024-11-06`.
- `AMD_RUNWAY_WRITES_ENABLED` — defaults to `false`.
- `AMD_RUNWAY_MAX_CREDITS_PER_JOB` — defaults to `250`.
- `PORT` — defaults to `3000`.

## MCP tools

- `runway_control_status`
- `runway_get_organization`
- `runway_get_usage`
- `runway_list_routers`
- `runway_get_task`
- `runway_router_dry_run`
- `runway_router_generate`
- `runway_cancel_task`

## Local verification

```bash
npm install
npm run check:syntax
npm start
```

Health:

```bash
curl http://127.0.0.1:3000/health
```

MCP tool discovery:

```bash
curl -s -X POST http://127.0.0.1:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Deployment state

Initial cloud deployment should remain:

```text
RUNWAYML_API_SECRET          = NOT SET
AMD_RUNWAY_WRITES_ENABLED   = false
AMD_RUNWAY_MAX_CREDITS_PER_JOB = 250
```

After private connectivity/authentication is certified, add the Runway secret in the cloud secret store, validate read-only tools, then explicitly enable writes.
