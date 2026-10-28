# Final Website Version: public waitlist preview access

Task: tsk_3a32ca0a-d2c1-4211-9ef8-b6b1d1135891
Repository: finesseay/tracelayer-website
Status: implemented and locally verified; undeployed.

## Change

`infra/waitlist.mjs` owns the zero-dependency public email capture service.
Previously its CORS response always selected one of the two production website
origins, so the saved standalone preview could not read a signup response.

Allow only `https://preview-785bbe1afdedafc265db7c.tracelayer.com` on exact
`POST /waitlist` and its POST preflight. Keep both production origins. Unknown
origins receive no CORS grant. Include Vary for origin and requested method.
No credentials, arbitrary preview wildcard, or authenticated endpoint grants.
Signup payload `{email, ref}` and numeric `number` response remain unchanged.
Production storage and port defaults remain unchanged; environment overrides
permit isolated integration testing.

## Evidence

On 2026-10-28, Node v22.23.4:

- `node --check infra/waitlist.mjs`: passed.
- `node --test infra/waitlist.test.mjs`: passed (one integration suite).
- Actual local HTTP preflight and POST responses tested, including production
  origins, exact preview, unrelated/spoofed/null origins, other routes, and GET.
- Invalid email returns 400 with the permitted CORS header. A synthetic valid
  address receives a numeric number, persists in isolated storage, and repeated
  submission returns the same result without another row.
- No production submissions, service restarts, or deployments performed.
- No page markup or visuals changed; existing standalone website preserved.

## Related saved results and remaining activation

The application repository's saved checkpoint
`2b22240c1ae293e8992a95d70dd50bf55d1159af` contains the narrowly scoped preview
hosting fix. Its preceding account logo fix is
`4bdf5bd88ec1dbd5778a0972f5837892816af6d1`. Prior platform verification passed
for the application checkpoint; this turn did not retest those separate files.
The standalone website, including arrow removal, remains at snapshot
`d897c9f4fcf6d8e198e415ffcddf03591c7deab33f47ac70e1a680b18a26dc88`.

Application changes and the separately running waitlist service must be deployed
through their authorized delivery before a real hosted end-to-end check can pass.
No deployment is authorized by this turn. Updating the static GitHub Pages site
alone does not install the waitlist service code. No newsletter mailing-provider
integration is claimed: capture uses the existing waitlist JSON store.
