# Deploy — about.rmgtx.dev

Public FDE landing page. Kept **separate** from `portfolio.rmgtx.dev` (older shelf) and from apex `rmgtx.dev` (Access-gated “rgdox”).

## Target

| | |
|---|---|
| **Hostname** | `https://about.rmgtx.dev` |
| **CF Pages project** | `about-rmgtx` (already created) |
| **Preview** | `https://about-rmgtx.pages.dev` (after first deploy) |
| **Source** | this repo / local folder |

If you prefer `aboutme.rmgtx.dev` or `me.rmgtx.dev`, say so and we’ll swap the CNAME + custom domain.

## One-command deploy (from this folder)

```bash
cd "/Users/rmg/RG Local/FP/portfolio"
rm -rf /tmp/about-rmgtx-deploy && mkdir -p /tmp/about-rmgtx-deploy
cp index.html CNAME PUBLIC_BOUNDARY.md /tmp/about-rmgtx-deploy/
cp -R assets /tmp/about-rmgtx-deploy/
npx wrangler pages deploy /tmp/about-rmgtx-deploy --project-name=about-rmgtx --branch=main
```

Then in Cloudflare Dashboard:

1. **Pages → about-rmgtx → Custom domains →** add `about.rmgtx.dev`
2. **Zero Trust → Access →** bypass / exclude `about.rmgtx.dev` from the app that covers `*.rmgtx.dev` / apex (recruiters must not hit “Log in to rgdox”)

DNS is already on Cloudflare for `rmgtx.dev`, so the custom domain should mint the record automatically.

## Why not GitHub Pages

`rmgtx` account Actions are disabled, so `rmgtx.github.io/reed-garrett` never publishes. Cloudflare Pages is the source of truth for this site.
