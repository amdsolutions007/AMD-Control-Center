# Signal Beacon Analytics — Security Status

Status: PUBLIC CLIENT-SIDE ADMIN GATE RETIRED

The historical Signal Beacon analytics screen used a browser-visible password and localStorage/sessionStorage data. That design is not treated as a secure administrative boundary.

Current rule:
- Do not publish admin credentials in source, documentation, client bundles or screenshots.
- Do not use NEXT_PUBLIC_* variables for administrative secrets.
- Administrative analytics must use server-side authentication or a provider-managed protected surface.
- Historical localStorage analytics may be treated as local browser telemetry only; they are not central production analytics.
- Rotate any credential that was previously committed or shared.

The public /admin-analytics route is intentionally non-operational until a secure replacement is implemented.
