# Altora Release Targets

This document is the release map for every agent. Read it before changing code
or deploying.

## Current production application

| Field | Current value |
| --- | --- |
| Repository | `Cat-tj/ShadyERP` |
| Release branch | `master` |
| Last deployed application SHA | `3ee5f69` |
| Runtime | Altora VPS |
| Product scope | Altora web application and its verticals |

`master` is now the GitHub default branch and the only release branch. The
former `claude/umkm-saas-pos-tv4asg` branch is retained temporarily only as a
read-only compatibility reference while VPS deployment is migrated.

## Explicit boundaries

- A commit in another repository never deploys to Altora VPS automatically.
- `Cat-tj/svt-kpi-monitor` is a separate HRIS codebase. Do not claim its
  commits affect `altora.my.id` or Altora VPS unless this release map is
  intentionally updated.
- `apps/altora-teams-landing` belongs to this repository, but its runtime
  service and domain must be verified before deployment.

## Mandatory agent pre-flight

Before coding or pushing, an agent must state in its handover:

1. repository and local checkout;
2. target branch;
3. intended domain/service;
4. whether a database migration is involved;
5. validation evidence required before deployment.

## Delivery rule

1. Fetch the release branch.
2. Use an isolated local worktree only when necessary.
3. Test and update a dated note under `docs/codex-updates/` or
   `docs/changelogs/`.
4. Integrate the verified result directly into the release branch.
5. Push that branch, then deploy the same SHA to the mapped VPS service.
6. Record the deployed SHA and public verification result.

## Migration record — 2026-07-23

- `master` was created from release SHA `be75e72` and set as the GitHub default.
- `ops/deploy.sh` now pulls `origin master`.
- VPS deployment must pull this commit, build, migrate, restart
  `altora-main`, and pass public health verification before the old branch can
  be retired.

## VPS deployment record — 2026-07-23

- Database backup completed before the branch migration.
- Pending migration `20260722140000_cash_out_receipt_photo` was applied.
- `altora-main` is running from `/home/altora/ShadyERP` on branch `master` at
  application SHA `93a7b6a`.
- Local health endpoint plus `https://altora.my.id` and
  `https://teams.altora.my.id` returned HTTP 200 after restart.

## VPS deployment record — HRIS KPI scopes

- Application commit `3ee5f69` was deployed to `/home/altora/ShadyERP`.
- A PostgreSQL backup was completed before migration
  `20260723093000_hris_kpi_scopes` was applied.
- `altora-main` was built from the deployed checkout and restarted only after
  `.next/BUILD_ID` existed.
- Local `/api/health`, `https://altora.my.id`, and
  `https://teams.altora.my.id` each returned HTTP 200 after restart.
