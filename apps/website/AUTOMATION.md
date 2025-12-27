# AUTOMATION GUIDE

Purpose
- Provide a single-command deployment workflow for non-technical executives.

To update the live site
- Run:

```
npm run deploy
```

What this does
- Runs the `npx vercel --prod` command from the project root and pushes the current code to the production environment configured in Vercel.

Architecture
- Domain: `www.amdsolutions007.com` is managed via Namecheap DNS.
- Hosting/Engine: Vercel hosts the application and serves the production build.
- Linkage: The Namecheap DNS records are pointed at Vercel and the domain is aliased in the Vercel project; DNS is already propagated.

Credentials & Tokens
- Authentication: The Vercel CLI uses a login token during the deployment session.
- Current state: The Vercel token was cached in the terminal during the initial authentication; subsequent `npx vercel` or `npm run deploy` commands will use that cached session (or prompt for authentication if expired).
- Best practice: Keep the machine used for CEO deployments secure and avoid sharing terminal access. If automation is desired across CI, set the `VERCEL_TOKEN` secret in your CI environment instead of relying on a cached interactive token.

Notes for Stability & Mobile Performance (Live Traffic)
- Prioritize monitoring and light-weight assets: reduce heavy animations on mobile and lazy-load large images.
- If you want, we can add a CI workflow to run a Lighthouse mobile audit and a smoke test after each `npm run deploy`.

Support
- If deployment prompts for login again, run `npx vercel login` and follow the device-code or email flow.

