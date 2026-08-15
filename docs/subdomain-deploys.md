# Subdomain deploys

Project pages live on their own subdomains, each on a Cloudflare Pages project with a Porkbun
CNAME in front of it. `scripts/subdomain/` converges all of that from one command.

It is a **convergence loop, not a step runner**. There is deliberately no state file: every phase
asks the real system whether it is already satisfied. So the tool is safe to interrupt, safe to
re-run, and cannot go stale when something changes outside it — a deleted CNAME, a removed
project, an expired certificate. Resuming is just running the command again.

## Before you start

**Run from the main checkout, not a linked worktree.** The `checkout` phase blocks this on
purpose. A worktree carries a different branch and its own `.env`, so deploying from one ships
branch state under a config that was never meant to leave the branch, and nothing downstream
would say so. `--allow-worktree` exists for the deliberate exception.

`.env` in the repository root needs five values. Copy `.env.example` and fill it in.

| Variable | Where it comes from |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | dashboard → My Profile → API Tokens. Permission: Account → Cloudflare Pages → Edit |
| `CLOUDFLARE_ACCOUNT_ID` | dashboard → Workers & Pages → Account ID in the right-hand pane |
| `PORKBUN_API_KEY` | https://porkbun.com/account/api |
| `PORKBUN_SECRET_API_KEY` | https://porkbun.com/account/api |
| `PUBLIC_GTAG_MEASUREMENT_ID` | read at **build** time, not deploy time (see the `analytics` phase) |

Wrangler is not a dependency. `npx` fetches it when the deploy and local-verify phases need it.

## Commands

```
npm run subdomain:status <target>    # inspect every phase, change nothing
npm run subdomain:setup  <target>    # one-time: Cloudflare project, domain, DNS
npm run subdomain:deploy <target>    # the everyday one: build, verify, deploy, verify live
npm run subdomain:up     <target>    # setup then deploy
npm run subdomain:down   <target>    # remove the Porkbun CNAME, leave Cloudflare alone
```

Options are passed after `--`, for example
`npm run subdomain -- deploy joeinz-ds --dry-run`.

| Option | Effect |
| --- | --- |
| `--dry-run` | show what would run without doing it |
| `--from=<phase>` | skip phases before this one |
| `--until=<phase>` | stop after this one |
| `--wait=<minutes>` | certificate-issuance poll budget, default 5 |
| `--port=<n>` | local verification port, default 8788 |
| `--allow-worktree` | deploy from a linked worktree, the deliberate exception |

`deploy --until=verify-local` needs **no credentials at all**: it builds, generates `_redirects`
and proves the redirect rules against the real Pages runtime. That is the most useful part of the
tool and the part worth being able to run on any machine.

## The phases

### Setup, once per subdomain

1. **preflight** — proves both APIs answer before anything gets created.
2. **cf-project** — creates the Pages project. Its production branch must match `branch` in the
   target, or deploys land as previews and the custom domain serves nothing. This is the
   silent-preview trap, and it is why the phase refuses to adopt a project whose branch differs.
3. **cf-domain** — registers the custom domain on the project. **Must happen before the CNAME
   exists**, or you get a 522 that reads as a DNS fault.
4. **dns-cname** — creates the Porkbun CNAME pointing at `<project>.pages.dev`.
5. **dns-active** — polls until the certificate is issued. **Never delete and re-add the domain to
   nudge it.** Repeated add/remove cycles get the domain rate-limited by the certificate authority
   and stuck on "initializing", which needs Cloudflare staff to clear. Waiting is always the right
   move. A timeout is not a failure: it exits zero saying "re-run later" and resumes where it
   stopped. Escalate only after about 24 hours.

### Deploy, every time

6. **build** — `npm run build`.
7. **checkout** — refuses to run from a linked worktree (see above).
8. **analytics** — reads the **built page** for a `G-…` tag rather than checking the environment.
   A build made without `PUBLIC_GTAG_MEASUREMENT_ID` produces a page that looks perfect and
   measures nothing, and nothing downstream would notice. Deploy without it deliberately with
   `--from=redirects`.
9. **redirects** — generates `dist/_redirects` from the target's `slug` and `mainSite`, so the
   rules are never hand-copied per project. Four rules, and **their order is load-bearing**: only
   the first match applies, and Pages follows redirects regardless of whether an asset matches, so
   the asset rules must outrank the catch-all.

   ```
   /_astro/*        /_astro/:splat                200
   /favicon.png     /favicon.png                  200
   /                /<slug>/                      200
   /<slug>/*        https://<host>/               301
   /*               <mainSite>/:splat             301
   ```

   Dropping the two asset rules fails nastily rather than obviously: both hosts deploy the same
   `dist`, so every asset redirect still *resolves* and the page renders correctly, right up until
   the two deploys drift and the content hashes stop matching.
10. **verify-local** — boots the real Pages runtime on `127.0.0.1:8788` and probes the redirect
    matrix. It refuses to start if the port is taken, because probes would otherwise silently test
    whatever else is listening and report a pass about the wrong build entirely.
11. **deploy** — `wrangler pages deploy` with an explicit `--branch`. Explicit because inside a
    git worktree wrangler auto-detects the current branch, which will not match the production
    branch, and the deploy lands as a preview while the custom domain serves nothing.
12. **verify-remote** — runs the same probe matrix against the live host.

## Adding another subdomain

One entry in `scripts/subdomain/targets.mjs`. Nothing else in that tree is project-specific:
`_redirects` is generated from `slug` and `mainSite`, and the verification matrix is derived from
the built page, so the rules cannot drift or be mis-ordered per project.

Two things live outside the tool and are easy to forget:

- **The main site's redirect.** `firebase.json` needs a rule sending `/<slug>{,/**}` to the
  subdomain. It only takes effect on the next `firebase deploy` of the main site.
- **`RESERVED_SLUGS`.** A project page slug may not collide with a top-level file route.

## When it stops

- **⏳ pending** — nothing is half-done. Re-run the same command later.
- **✗ terminal** — read the hint on the error; it names the variable, the record or the phase.
- `npm run subdomain:status <target>` is always safe and always true, because it asks the real
  system rather than a stored file.
