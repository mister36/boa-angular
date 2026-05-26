# Human Approval Checklist

This document defines the approval gates required before the Angular migration can be merged to the main branch and deployed to production. Each gate specifies who approves, what they review, and what criteria must be met.

No migration PR should be merged without all five gates passing.

---

## Gate 1: Architect Approval for Migration Plan

**Approver Role:** Chief Architect / Engineering Lead

**Review Scope:**
- `docs/ARCHITECTURE.md` -- confirm all libraries and dependency relationships are documented
- `docs/DEPENDENCY_REPORT.md` -- confirm all version changes are cataloged
- `docs/MIGRATION_RISK_REGISTER.md` -- confirm risks are identified and mitigated
- `angular.json` -- confirm builder and project configuration changes
- `tsconfig.base.json` -- confirm path aliases and compiler options
- `package.json` -- confirm dependency version bumps

**Acceptance Criteria:**
- [ ] All `@angular/*` packages are updated to the target version consistently
- [ ] Angular Material and CDK are updated to the corresponding version
- [ ] TypeScript version is compatible with the target Angular version
- [ ] No unplanned dependency additions or removals
- [ ] Shared library public APIs (`libs/*/src/index.ts`) have no unintended breaking changes
- [ ] Build configuration changes are documented and justified
- [ ] Monorepo structure is preserved (all 3 apps, all 8 libs)
- [ ] Architecture document is updated to reflect any structural changes

**Sign-off:**
> I have reviewed the migration plan, dependency changes, and shared library impact. The architecture is sound and the migration approach is appropriate for our enterprise requirements.
>
> Signed: _________________________ Date: _____________

---

## Gate 2: Security Approval for Auth-Sensitive Changes

**Approver Role:** Security Engineer / Application Security Lead

**Review Scope:**
- `libs/auth/src/lib/services/auth.service.ts` -- session management, token storage, auth state machine
- `libs/auth/src/lib/services/mock-sso.provider.ts` -- SSO/MFA simulation logic
- `libs/auth/src/lib/guards/` -- all three route guards (AuthGuard, MfaGuard, RoleGuard)
- `libs/auth/src/lib/interceptors/` -- all four HTTP interceptors
- `libs/audit-logging/src/lib/services/audit-log.service.ts` -- audit event emission
- `libs/shared-utils/src/lib/masking/pii-redaction.util.ts` -- PII redaction logic
- `apps/digital-banking-app/src/app/public/login/` -- login form and flow
- `apps/digital-banking-app/src/app/public/mfa-challenge/` -- MFA challenge flow

**Acceptance Criteria:**
- [ ] Login -> MFA -> dashboard flow works end-to-end (verified via E2E test and manual QA)
- [ ] Invalid credentials show error state without leaking internal details
- [ ] MFA lockout after 3 failed attempts still functions
- [ ] Session expiration redirects to `/session-expired`
- [ ] `AuthTokenInterceptor` attaches Bearer token to authenticated requests only
- [ ] `CorrelationIdInterceptor` generates unique `X-Correlation-ID` headers
- [ ] `ErrorHandlingInterceptor` handles 401 (logout), 403 (redirect), 503 (maintenance) correctly
- [ ] PII redaction (`redactPii`) masks email, phone, SSN in all analytics and audit log payloads
- [ ] Audit log events include correlationId, userId, and timestamp
- [ ] No auth tokens, credentials, or PII appear in console output or analytics events
- [ ] No new dependencies introduce known CVEs (run `npm audit`)

**Sign-off:**
> I have reviewed all authentication, authorization, session management, and PII handling code. The security posture is maintained after migration and no new vulnerabilities have been introduced.
>
> Signed: _________________________ Date: _____________

---

## Gate 3: QA Approval for Critical Customer Journeys

**Approver Role:** QA Lead / Quality Engineer

**Review Scope:**
- E2E test results: `cypress/e2e/login-mfa-dashboard.cy.ts`
- E2E test results: `cypress/e2e/account-transactions.cy.ts`
- E2E test results: `cypress/e2e/transfer-flow.cy.ts`
- Unit test results: `ng test --watch=false --browsers=ChromeHeadless`
- Integration test results (same command, integration spec files)
- Manual QA of all feature pages

**Acceptance Criteria:**
- [ ] All 3 E2E smoke tests pass: login/MFA/dashboard, account/transactions, transfer flow
- [ ] All 58 unit and integration tests pass (36 unit + 22 integration)
- [ ] No new test failures introduced by migration
- [ ] Manual verification of these critical journeys:
  - [ ] Login with valid credentials -> MFA challenge -> dashboard
  - [ ] Login with invalid credentials -> error message displayed
  - [ ] MFA with wrong code -> error; 3 failures -> lockout
  - [ ] Dashboard shows account cards with correct balances
  - [ ] Account detail page shows transaction table with sort/filter/pagination
  - [ ] Transfer flow: select accounts -> enter amount -> review -> confirm -> success receipt
  - [ ] Bill pay: select payee -> enter amount -> select date -> confirm -> success
  - [ ] Profile page shows masked PII, login activity, trusted devices
  - [ ] Session timeout -> redirect to session expired page
- [ ] No visual regressions on key pages (dashboard, transfer flow, login)
- [ ] Responsive layout functions on mobile viewport (sidenav collapses, layout adjusts)

**Sign-off:**
> I have verified all critical customer journeys through automated and manual testing. The user experience is preserved after migration and no regressions have been found.
>
> Signed: _________________________ Date: _____________

---

## Gate 4: Downstream Team Approval for Shared Library Release

**Approver Role:** Downstream Team Lead(s) (Credit Card team, Loans team)

**Review Scope:**
- `libs/boa-design-system/src/index.ts` -- public API (12 components, module, types)
- `libs/boa-design-system/src/lib/boa-design-system.module.ts` -- module imports/exports
- `libs/boa-design-system/src/lib/styles/` -- SCSS theme, variables, mixins
- `apps/downstream-credit-card-app/` -- full build and render
- `apps/downstream-loans-app/` -- full build and render
- Build validation output: `npm run validate:builds`

**Acceptance Criteria:**
- [ ] `ng build downstream-credit-card-app` exits 0 (production build)
- [ ] `ng build downstream-loans-app` exits 0 (production build)
- [ ] `npm run validate:builds` passes all 3 apps
- [ ] No breaking changes to `BoaDesignSystemModule` public API:
  - [ ] `AccountCardComponent` inputs/outputs unchanged
  - [ ] `MoneyDisplayComponent` formatting behavior unchanged
  - [ ] `DataTableComponent` column config, sort, pagination unchanged
  - [ ] `AlertBannerComponent` variants and ARIA attributes unchanged
  - [ ] `LoadingSkeletonComponent` variants unchanged
  - [ ] `EmptyStateComponent` inputs unchanged
- [ ] SCSS variables and mixins are still importable by downstream apps
- [ ] No visual regressions in downstream app rendering
- [ ] Component selector prefixes (`boa-*`) are unchanged

**Sign-off:**
> I have verified that the shared design system library changes do not break our downstream application. Our build compiles successfully and our components render correctly.
>
> Team: _________________________ Signed: _________________________ Date: _____________

---

## Gate 5: Release Manager Approval for Production Rollout

**Approver Role:** Release Manager / Engineering Manager

**Review Scope:**
- All four preceding gate sign-offs (Architect, Security, QA, Downstream)
- `libs/feature-flags/src/lib/models/feature-flag.models.ts` -- flag configuration
- `scripts/validate-all-builds.sh` -- build validation script
- `package.json` -- version and scripts
- Deployment pipeline configuration
- Rollback procedure documentation

**Acceptance Criteria:**
- [ ] Gates 1-4 are all signed off
- [ ] Feature flags are configured for gradual rollout:
  - [ ] `angular18-migrated-behavior` flag exists and can be toggled
  - [ ] Critical flows function correctly with flag both enabled and disabled
- [ ] Rollback plan is documented and tested:
  - [ ] Pre-migration branch is preserved and tagged
  - [ ] Rollback deployment procedure is documented
  - [ ] Rollback has been tested in staging environment
- [ ] `npm run validate:builds` passes in CI environment
- [ ] No `npm audit` critical or high severity vulnerabilities
- [ ] Production deployment window is scheduled with on-call support
- [ ] Monitoring and alerting is configured for post-deployment observation
- [ ] Communication sent to downstream teams about deployment timeline

**Sign-off:**
> I have confirmed that all approval gates are satisfied, the rollback plan is in place, and the migration is ready for production deployment.
>
> Signed: _________________________ Date: _____________

---

## Summary

| Gate | Approver | Status |
|------|----------|--------|
| 1. Migration Plan | Chief Architect | [ ] Pending |
| 2. Auth/Security | Security Engineer | [ ] Pending |
| 3. Customer Journeys | QA Lead | [ ] Pending |
| 4. Shared Library | Downstream Teams | [ ] Pending |
| 5. Production Rollout | Release Manager | [ ] Pending |

All five gates must show **Approved** before the migration PR is merged to main.
