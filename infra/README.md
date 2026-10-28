# tracelayer.com infrastructure notes

- **Site**: GitHub Pages serves branch `main` at `/`, with `CNAME` set to tracelayer.com (GitHub Pages configuration verified 2026-10-28). Production changes go through TraceLayer's governed Task deployment command. Its verified integration push triggers the existing Pages build. Confirm the build's commit and live pages before reporting a deployment. Do not push directly to the production branch.
- **Waitlist API**: `waitlist.mjs` (zero-dependency Node) runs on the Hetzner VPS as pm2 process `tracelayer-waitlist`, listening on `127.0.0.1:4890`, data in `/var/lib/tracelayer-waitlist/waitlist.json`. Deployed copy: `/opt/tracelayer-waitlist/waitlist.mjs`.
- **Caddy**: `http://api.tracelayer.com { reverse_proxy 127.0.0.1:4890 }` in `/etc/caddy/Caddyfile` — the VPS firewall only admits Cloudflare IPs on port 80, so the API is reachable exclusively through a **Cloudflare-proxied** DNS record.
- **DNS required**: tracelayer.com zone on Cloudflare with:
  - apex + `www` → GitHub Pages (A 185.199.108–111.153 / CNAME finesseay.github.io), DNS-only is fine
  - `api` → A `89.167.76.77`, **proxied (orange cloud)**
- The site degrades gracefully while `api.tracelayer.com` is unreachable: joins are stored locally in the visitor's browser as provisional numbers and re-sync automatically on their next visit after the API is live.

## Saved website preview access

The public `POST /waitlist` endpoint also permits the exact origin
`https://preview-785bbe1afdedafc265db7c.tracelayer.com` for the Final Website Version
Task. Its `OPTIONS` preflight must request `POST`. This exception does not apply
to `/health`, other paths, other preview hosts, or authenticated APIs. Responses
vary by Origin and preflight method and do not enable credentials. Unknown origins
receive no Access-Control-Allow-Origin header. CORS is a browser response-access
policy, not authentication or protection against direct HTTP clients.

Run the isolated service integration check with Node 22:

```sh
node --check infra/waitlist.mjs
node --test infra/waitlist.test.mjs
```

The test starts the actual HTTP service on an ephemeral loopback port and stores
synthetic registrations in a temporary workspace directory, which it removes.
`WAITLIST_PORT` and `WAITLIST_DATA_DIR` support this isolation; production defaults
remain port 4890 and `/var/lib/tracelayer-waitlist`.

This code change is not a live service deployment. Updating the static website
alone does not update the separately running waitlist process described above.
