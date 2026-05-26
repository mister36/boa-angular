# Migration Risk Register

This document catalogs the risks associated with upgrading this codebase from Angular 14 to a newer Angular version (e.g., Angular 18). Each risk is mapped to specific files and components in the repository, rated by likelihood and impact, and paired with a mitigation strategy.

---

## Risk Summary

| # | Risk | Likelihood | Impact |
|---|------|-----------|--------|
| 1 | Auth/MFA regression | Medium | Critical |
| 2 | HTTP interceptor breakage | High | Critical |
| 3 | Angular Material visual drift (MDC migration) | High | High |
| 4 | Shared design system downstream breakage | High | Critical |
| 5 | Analytics event loss | Medium | High |
| 6 | Third-party financial provider contract breakage | Low | High |
| 7 | Inadequate test coverage gaps | Medium | High |
| 8 | Accessibility regression | Medium | High |
| 9 | Build tooling and configuration changes | High | Medium |
| 10 | Rollback complexity in monorepo | Medium | High |
| 11 | Class-based guard deprecation | High | Medium |
| 12 | SCSS theming API removal | High | High |
| 13 | Structural directive template compatibility | Low | Medium |

---

## 1. Auth/MFA Regression

**Description:** The authentication flow (login, MFA challenge, session management, logout) is the most security-sensitive surface in the application. Changes to Angular's router, dependency injection, or observable behavior during an upgrade could silently break auth state transitions, session timers, or token storage.

**Affected Files:**
- `libs/auth/src/lib/services/auth.service.ts`
- `libs/auth/src/lib/services/mock-sso.provider.ts`
- `apps/digital-banking-app/src/app/public/login/login.component.ts`
- `apps/digital-banking-app/src/app/public/mfa-challenge/mfa-challenge.component.ts`

**Likelihood:** Medium -- Auth code primarily uses RxJS observables and Angular services, which are stable across versions, but session timer and routing interactions are upgrade-sensitive.

**Impact:** Critical -- A broken auth flow locks all customers out of the application or, worse, allows unauthorized access.

**Mitigation:**
- Run the login/MFA/dashboard E2E smoke test (`cypress/e2e/login-mfa-dashboard.cy.ts`) before and after migration.
- Verify `AuthService` unit tests pass (login, MFA, logout, session expiration scenarios).
- Manual QA of the full login -> MFA -> dashboard -> logout flow.
- Security team sign-off on auth-related changes before merge.

---

## 2. HTTP Interceptor Breakage

**Description:** The application registers four HTTP interceptors via the `HTTP_INTERCEPTORS` multi-provider token. Angular 15+ deprecates the `HttpInterceptor` class interface in favor of functional interceptors with `withInterceptors()`. While class-based interceptors continue to work, the migration path requires changes to how interceptors are registered and may alter execution order.

**Affected Files:**
- `libs/auth/src/lib/interceptors/auth-token.interceptor.ts`
- `libs/auth/src/lib/interceptors/correlation-id.interceptor.ts`
- `libs/auth/src/lib/interceptors/error-handling.interceptor.ts`
- `libs/auth/src/lib/interceptors/session-timeout.interceptor.ts`
- `apps/digital-banking-app/src/app/app.module.ts` (interceptor registration)

**Likelihood:** High -- The deprecation is well-documented and the class-based API will eventually be removed.

**Impact:** Critical -- Interceptors handle auth tokens, correlation IDs, error handling (401/403/503 redirects), and session refresh. A broken interceptor can cause silent auth failures, missing audit trails, or unhandled errors.

**Mitigation:**
- Unit test for `AuthTokenInterceptor` validates Bearer header attachment and public endpoint skipping.
- Integration test for error handling interceptor validates 401->logout and 503->maintenance redirects.
- If converting to functional interceptors, migrate one at a time and validate with existing tests.
- Preserve interceptor execution order during migration.

---

## 3. Angular Material Visual Drift (MDC Migration)

**Description:** Angular Material 15 replaced the legacy component rendering with MDC (Material Design Components) Web. This changes DOM structure, CSS class names, component dimensions, spacing, and theming behavior for every Material component. The design system wraps 17+ Material modules and all three applications depend on them.

**Affected Files:**
- `libs/boa-design-system/src/lib/styles/_theme.scss` (uses `mat-palette`, `mat-light-theme`, `angular-material-theme`)
- `libs/boa-design-system/src/lib/styles/_variables.scss`
- `libs/boa-design-system/src/lib/boa-design-system.module.ts` (imports MatTableModule, MatDialogModule, MatFormFieldModule, etc.)
- All 12 component SCSS files in `libs/boa-design-system/src/lib/components/`

**Likelihood:** High -- Every application using Angular Material will encounter MDC migration changes.

**Impact:** High -- Visual regressions affect all pages, all three applications, and customer trust. Financial data display, form inputs, and navigation layout may shift or break.

**Mitigation:**
- Take visual snapshots of key pages before migration.
- Test each design system component in isolation after Material upgrade.
- Run downstream app builds (`npm run validate:builds`) to confirm compilation.
- Review Material migration guide for component-by-component changes.
- Consider using Angular Material's legacy compatibility packages during transition.

---

## 4. Shared Design System Downstream Breakage

**Description:** `BoaDesignSystemModule` is consumed by all three applications. Changes to component inputs/outputs, module imports, or SCSS variables can break downstream apps even if the main app compiles successfully.

**Affected Files:**
- `libs/boa-design-system/src/index.ts` (12 component exports)
- `libs/boa-design-system/src/lib/boa-design-system.module.ts`
- `apps/downstream-credit-card-app/src/app/app.module.ts`
- `apps/downstream-credit-card-app/src/app/app.component.html`
- `apps/downstream-loans-app/src/app/app.module.ts`
- `apps/downstream-loans-app/src/app/app.component.html`

**Likelihood:** High -- Any Material migration will cascade through the design system to downstream consumers.

**Impact:** Critical -- Downstream teams represent other business units. A broken shared library blocks multiple team releases.

**Mitigation:**
- Run `npm run validate:builds` after every design system change.
- Downstream apps should be built and tested as part of the migration PR validation.
- Version the design system library and communicate breaking changes to downstream teams.
- Downstream team approval gate before shared library release.

---

## 5. Analytics Event Loss

**Description:** The analytics library tracks page views, button clicks, form steps, and completed transfers. If route change subscriptions, directive lifecycle hooks, or service injection break during migration, analytics events may silently stop firing.

**Affected Files:**
- `libs/analytics/src/lib/services/analytics.service.ts`
- `libs/analytics/src/lib/services/route-analytics.service.ts`
- `libs/analytics/src/lib/directives/analytics.directive.ts`

**Likelihood:** Medium -- The analytics directive uses `HostListener` and the route service subscribes to `Router.events`, both of which are stable but could be affected by Angular's router refactoring.

**Impact:** High -- Lost analytics data affects business metrics, A/B testing, and product decisions. May not be noticed until well after deployment.

**Mitigation:**
- Integration test validates `RouteAnalyticsService` fires `trackPageView` on `NavigationEnd`.
- Verify `AnalyticsDirective` click tracking after migration.
- Add console logging in development mode to make analytics events visible.
- Monitor analytics event volume in staging before production rollout.

---

## 6. Third-Party Financial Provider Contract Breakage

**Description:** The financial data library wraps API clients (`AccountApiClient`, `TransactionApiClient`, `TransferApiClient`, `BillPayApiClient`) that simulate third-party financial data provider calls. While these are mock implementations, their interfaces, error handling patterns, and Observable signatures represent real integration contracts.

**Affected Files:**
- `libs/financial-data/src/lib/services/account-api.client.ts`
- `libs/financial-data/src/lib/services/transaction-api.client.ts`
- `libs/financial-data/src/lib/services/transfer-api.client.ts`
- `libs/financial-data/src/lib/services/bill-pay-api.client.ts`
- `libs/financial-data/src/lib/services/provider-error-mapper.ts`

**Likelihood:** Low -- The provider clients use standard `HttpClient` and RxJS operators, which are stable across Angular versions.

**Impact:** High -- Provider contract breakage could cause incorrect balance displays, failed transfers, or misleading error messages in a real production environment.

**Mitigation:**
- Unit test for `ProviderErrorMapper` covers all 13 error codes.
- Integration tests validate dashboard account loading and transaction filtering with provider errors.
- Maintain Observable return type signatures across migration.

---

## 7. Inadequate Test Coverage Gaps

**Description:** The codebase has 58 automated tests (36 unit + 22 integration) and 3 E2E smoke tests. However, downstream apps have no dedicated test targets in `angular.json`, and some feature modules (bill pay, profile) lack direct test coverage.

**Affected Files:**
- `apps/downstream-credit-card-app/` (no test target)
- `apps/downstream-loans-app/` (no test target)
- `apps/digital-banking-app/src/app/features/bill-pay/` (no spec files)
- `apps/digital-banking-app/src/app/features/profile/` (no spec files)

**Likelihood:** Medium -- Migration often exposes untested code paths.

**Impact:** High -- Untested code is the primary source of post-migration regressions.

**Mitigation:**
- Prioritize adding tests for bill pay and profile modules before or during migration.
- Add Karma test targets for downstream apps.
- Use build validation (`npm run validate:builds`) as a minimum downstream safety net.
- Consider adding visual regression tests for design system components.

---

## 8. Accessibility Regression

**Description:** The design system includes ARIA roles (`role="alert"` on `AlertBannerComponent`), keyboard navigation, focus management, and screen reader support. Angular Material's MDC migration changes DOM structure and ARIA attribute placement, which can silently break assistive technology compatibility.

**Affected Files:**
- `libs/boa-design-system/src/lib/components/alert-banner/alert-banner.component.html`
- `libs/boa-design-system/src/lib/components/stepper/stepper.component.ts`
- `libs/boa-design-system/src/lib/components/side-nav/side-nav.component.ts`
- `libs/boa-design-system/src/lib/components/global-header/global-header.component.ts`
- `libs/boa-design-system/src/lib/styles/_mixins.scss` (`focus-ring`, `visually-hidden`)

**Likelihood:** Medium -- MDC components generally improve accessibility, but custom ARIA overrides and focus management may conflict.

**Impact:** High -- Accessibility regressions can violate ADA/WCAG compliance requirements and expose the organization to legal risk.

**Mitigation:**
- Run automated accessibility audit (axe-core or Lighthouse) before and after migration.
- Manually test keyboard navigation through the transfer flow and sidenav.
- Verify `AlertBannerComponent` retains `role="alert"` and `aria-live="polite"` after Material upgrade.
- Include accessibility review in QA approval gate.

---

## 9. Build Tooling and Configuration Changes

**Description:** The workspace uses `@angular-devkit/build-angular:browser` (Webpack-based) for all three applications. Angular 17+ introduces the `application` builder (esbuild-based) with different configuration options, polyfill handling, and output structure.

**Affected Files:**
- `angular.json` (builder configuration for all 3 apps)
- `package.json` (build scripts)
- `tsconfig.json`, `tsconfig.base.json`
- `scripts/validate-all-builds.sh`

**Likelihood:** High -- The builder migration is a documented part of Angular's upgrade path.

**Impact:** Medium -- Build failures are immediately visible and block deployment, but they do not silently corrupt runtime behavior.

**Mitigation:**
- Follow Angular CLI migration schematics (`ng update`).
- Test all three app builds after each incremental Angular version bump.
- Verify production build budgets still pass (currently 2MB warn / 5MB error).
- Update `scripts/validate-all-builds.sh` if build commands change.

---

## 10. Rollback Complexity in Monorepo

**Description:** Because all three applications and eight libraries share a single `package.json` and `angular.json`, a partial rollback (e.g., reverting the main app but keeping design system changes) is not possible. Any rollback must revert the entire monorepo.

**Affected Files:**
- `package.json` (single dependency tree)
- `angular.json` (all projects in one file)
- `tsconfig.base.json` (shared path aliases)

**Likelihood:** Medium -- Rollback is needed if migration introduces production-blocking issues.

**Impact:** High -- A full monorepo rollback may revert unrelated improvements and require downstream teams to re-sync.

**Mitigation:**
- Use feature flags (`@boa/feature-flags`) to gate new behavior behind flags that can be toggled without code rollback.
- Perform migration in small, incremental PRs (one Angular major version at a time).
- Maintain a stable pre-migration branch as a rollback target.
- Test rollback procedure in staging before production deployment.

---

## 11. Class-Based Guard Deprecation

**Description:** The codebase uses three class-based route guards (`AuthGuard`, `MfaGuard`, `RoleGuard`) implementing the `CanActivate` interface. Angular 15.2 deprecated class-based guards in favor of functional guards. While class-based guards continue to work through Angular 18, they will eventually be removed.

**Affected Files:**
- `libs/auth/src/lib/guards/auth.guard.ts`
- `libs/auth/src/lib/guards/mfa.guard.ts`
- `libs/auth/src/lib/guards/role.guard.ts`
- `apps/digital-banking-app/src/app/layout/layout-routing.module.ts` (guard usage)

**Likelihood:** High -- The deprecation warnings will appear during compilation.

**Impact:** Medium -- Guards still function; the risk is deferred removal in a future Angular version and increasing deprecation noise.

**Mitigation:**
- Convert to functional guards using `inject()` during or after migration.
- Unit test for `AuthGuard` validates redirect behavior; re-run after conversion.
- Migration can be deferred but should be tracked.

---

## 12. SCSS Theming API Removal

**Description:** The design system theme file uses Angular Material 14's `@angular/material/theming` SCSS API: `mat-core()`, `mat-palette()`, `mat-light-theme()`, and `angular-material-theme()`. These mixins were removed in Material 15+ and replaced with `@use '@angular/material' as mat` and the `mat.define-light-theme()` / `mat.all-component-themes()` API.

**Affected Files:**
- `libs/boa-design-system/src/lib/styles/_theme.scss`
- `libs/boa-design-system/src/lib/styles/_variables.scss`
- `libs/boa-design-system/src/lib/styles/_typography.scss`
- `libs/boa-design-system/src/lib/styles/styles.scss`

**Likelihood:** High -- The old theming API is completely removed in Material 15+.

**Impact:** High -- The SCSS build will fail until the theme is rewritten. All three applications depend on the global theme.

**Mitigation:**
- Rewrite `_theme.scss` to use the new `@use`-based theming API as part of the Material migration.
- Preserve the same BoA color palette values (#012169, #E31837) in the new theme definition.
- Compare rendered colors and typography before and after migration.
- Test all three apps after theme migration.

---

## 13. Structural Directive Template Compatibility

**Description:** The `*boaFeatureFlag` structural directive uses Angular's template microsyntax. Angular 17 introduced a new control flow syntax (`@if`, `@for`, `@switch`) that coexists with structural directives but may interact differently with template compilation in edge cases.

**Affected Files:**
- `libs/feature-flags/src/lib/directives/feature-flag.directive.ts`
- Templates using `*boaFeatureFlag` throughout the application

**Likelihood:** Low -- Custom structural directives are well-supported and the new control flow is additive, not a replacement.

**Impact:** Medium -- If the directive stops rendering, feature-flagged content would disappear or always appear.

**Mitigation:**
- Verify `*boaFeatureFlag` still works after migration by toggling a flag and confirming content visibility.
- No conversion to the new control flow syntax is required for custom structural directives.
- Add a unit test for the directive if one does not exist.
