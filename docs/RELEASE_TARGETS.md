# Altora Release Targets

This document is the release map for every agent. Read it before changing code
or deploying.

## Current production application

| Field | Current value |
| --- | --- |
| Repository | `Cat-tj/ShadyERP` |
| Release branch | `claude/umkm-saas-pos-tv4asg` |
| Current release SHA | `20a5a77` |
| Runtime | Altora VPS |
| Product scope | Altora web application and its verticals |

The branch name above is currently the production branch even though its name
contains `claude`. Treat it as the only release branch until the planned branch
migration to `master` is completed together with the VPS deployment
configuration.

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

## Planned migration to `master`

The desired end state is a branch literally named `master` as the GitHub
default and VPS deployment branch. This is a production configuration change:
create `master` from the current release SHA, update the VPS pull target,
verify build and health checks, then retire the old release branch. Do not
perform a partial rename.
