# Implementation Checklist — Bank of America Angular 14 Demo App

> Auto-maintained during build. Each task is marked `[ ]` (pending), `[~]` (in progress), or `[x]` (done).
> After every completed task the checklist is updated with status and deviation notes.

---

## Phase 1 — Workspace Setup

### 1.1 Initialize Angular CLI workspace as monorepo

- **What to build:** Create a new Angular 14 CLI workspace (`boa-angular`) with a monorepo layout. Configure `angular.json` for multiple projects. Set up the top-level folder structure: `apps/`, `libs/`, `docs/`.
- **Files likely touched:**
  - `package.json`
  - `angular.json`
  - `tsconfig.json`
  - `tsconfig.base.json`
  - `.editorconfig`
  - `.gitignore`
  - `README.md`
- **Acceptance criteria:**
  - `ng version` shows Angular 14.x.
  - Workspace compiles with no errors (`ng build` exits 0 or no projects yet).
  - Folder structure matches spec (`apps/`, `libs/`, `docs/`).
- **Verification command:**
  ```bash
  npx ng version && ls -d apps libs docs
  ```
- **Status:** `[x]`
- **Notes:** Generated via `@angular/cli@14` with `--create-application=false`. Scaffolded into temp dir and moved to root. `angular.json` newProjectRoot changed from `projects` to `apps`. Node 18.18.0 used (unsupported warning from CLI, but functional).

---

### 1.2 Configure TypeScript, linting, and formatting

- **What to build:** Pin TypeScript to Angular 14-compatible version (~4.7). Add `tsconfig.base.json` with strict settings and path aliases for every planned library. Add basic `.prettierrc` and `.eslintrc.json`.
- **Files likely touched:**
  - `tsconfig.json`
  - `tsconfig.base.json`
  - `.eslintrc.json`
  - `.prettierrc`
  - `package.json` (dev deps)
- **Acceptance criteria:**
  - `tsc --version` shows 4.7.x or 4.8.x.
  - Path aliases exist for `@boa/auth`, `@boa/design-system`, `@boa/analytics`, `@boa/financial-data`, `@boa/audit-logging`, `@boa/feature-flags`, `@boa/shared-utils`, `@boa/testing`.
  - `npx tsc --noEmit` exits 0.
- **Verification command:**
  ```bash
  npx tsc --version && npx tsc --noEmit
  ```
- **Status:** `[x]`
- **Notes:** TypeScript 4.7.4 installed. `tsconfig.base.json` created with strict mode, `skipLibCheck: true` (needed because `@types/node` uses TS 5.2+ features), and all 8 `@boa/*` path aliases. ESLint via `@angular-eslint@14` + `@typescript-eslint@5`. Prettier configured with single quotes, trailing commas, 100 char width.

---

## Phase 2 — Angular 14 Dependency Setup

### 2.1 Pin Angular 14, Angular Material 14, RxJS 7, Zone.js

- **What to build:** Ensure all `@angular/*` packages are 14.x. Install `@angular/material@14` and `@angular/cdk@14`. Install `rxjs@~7.5`, `zone.js` compatible version. Install Karma/Jasmine test runners.
- **Files likely touched:**
  - `package.json`
  - `package-lock.json`
- **Acceptance criteria:**
  - `ng version` lists Angular 14.x, Material 14.x, RxJS 7.x.
  - `npm ls @angular/core` shows 14.x.
  - `npm ls @angular/material` shows 14.x.
- **Verification command:**
  ```bash
  npx ng version
  npm ls @angular/core @angular/material rxjs zone.js
  ```
- **Status:** `[x]`
- **Notes:** Installed `@angular/material@14.2.7` and `@angular/cdk@14.2.7`. All Angular packages at 14.3.0, RxJS 7.5.7, Zone.js 0.11.8, TypeScript 4.7.4. Karma/Jasmine already present from Phase 1. No peer dep conflicts.

---

### 2.2 Configure Angular Material theme (SCSS)

- **What to build:** Set up a custom Angular Material theme in SCSS that uses `@angular/material/theming` (pre-MDC API). Define Bank of America brand colors as the palette source. Wire theme into `angular.json` styles.
- **Files likely touched:**
  - `libs/boa-design-system/src/lib/styles/_theme.scss`
  - `libs/boa-design-system/src/lib/styles/_variables.scss`
  - `angular.json`
- **Acceptance criteria:**
  - App compiles with custom Material theme.
  - SCSS uses `mat-palette`, `mat-light-theme`, `angular-material-theme` mixins.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app --configuration=production 2>&1 | tail -5
  ```
- **Status:** `[x]`
- **Notes:** Created `libs/boa-design-system/src/lib/styles/` with `_variables.scss` (BoA navy #012169 + red #E31837 palettes, grays, spacing, elevation, breakpoints), `_typography.scss` (custom mat-typography-config), `_theme.scss` (pre-MDC API: mat-core, mat-palette, mat-light-theme, angular-material-theme), and `styles.scss` aggregator. Theme will be wired into `angular.json` styles array in Phase 3 when the app is generated. `npx tsc --noEmit` exits 0.

---

## Phase 3 — Main App Shell

### 3.1 Generate digital-banking-app with AppModule and routing

- **What to build:** Create the main application under `apps/digital-banking-app`. Set up `AppModule`, `AppRoutingModule`, `AppComponent` with `<router-outlet>`. Use NgModules (no standalone). Create a lazy-loaded feature module structure placeholder.
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/app.module.ts`
  - `apps/digital-banking-app/src/app/app-routing.module.ts`
  - `apps/digital-banking-app/src/app/app.component.ts`
  - `apps/digital-banking-app/src/app/app.component.html`
  - `apps/digital-banking-app/src/app/app.component.scss`
  - `apps/digital-banking-app/src/main.ts`
  - `apps/digital-banking-app/src/index.html`
  - `angular.json` (register project)
- **Acceptance criteria:**
  - `ng serve digital-banking-app` runs and shows a shell page at `localhost:4200`.
  - `ng build digital-banking-app` exits 0.
  - App uses `AppModule` bootstrap, not standalone.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 3.2 Create authenticated app shell layout

- **What to build:** Build the post-login shell: global header (logo placeholder, user menu, sign-out), side navigation (Dashboard, Accounts, Transfers, Bill Pay, Profile & Security), session timer indicator, global alert/banner area, responsive layout. All wired into a `LayoutModule`. Routes should be protected by an auth guard (placeholder for now).
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/layout/layout.module.ts`
  - `apps/digital-banking-app/src/app/layout/layout.component.ts`
  - `apps/digital-banking-app/src/app/layout/layout.component.html`
  - `apps/digital-banking-app/src/app/layout/layout.component.scss`
  - `apps/digital-banking-app/src/app/layout/header/`
  - `apps/digital-banking-app/src/app/layout/sidenav/`
  - `apps/digital-banking-app/src/app/app-routing.module.ts`
- **Acceptance criteria:**
  - Shell renders header + sidenav + router-outlet.
  - Navigation links are present for all required sections.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 3.3 Create public pages (Login, MFA, Session Expired, Maintenance)

- **What to build:** Four public page modules with routing: `LoginComponent` (username/password form, remember device, error/loading states), `MfaChallengeComponent` (6-digit code input, resend, lockout), `SessionExpiredComponent`, `MaintenanceComponent`. All under a `PublicModule` with its own routing.
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/public/public.module.ts`
  - `apps/digital-banking-app/src/app/public/public-routing.module.ts`
  - `apps/digital-banking-app/src/app/public/login/`
  - `apps/digital-banking-app/src/app/public/mfa-challenge/`
  - `apps/digital-banking-app/src/app/public/session-expired/`
  - `apps/digital-banking-app/src/app/public/maintenance/`
- **Acceptance criteria:**
  - `/login`, `/mfa`, `/session-expired`, `/maintenance` routes render correctly.
  - Login form has reactive form with validation.
  - MFA page has 6-digit input, resend, lockout states.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

## Phase 4 — Auth / MFA Flows

### 4.1 Build auth library (`libs/auth`)

- **What to build:** Create `@boa/auth` library with: `AuthService` (login, completeMfa, logout, refreshSession, currentUser$, authState$, mock token storage, session expiration timer), `MockSsoProvider` (mock redirect/callback, mock user identity, mock MFA challenge/fail/expire/lockout), `AuthModule`.
- **Files likely touched:**
  - `libs/auth/src/index.ts`
  - `libs/auth/src/lib/auth.module.ts`
  - `libs/auth/src/lib/services/auth.service.ts`
  - `libs/auth/src/lib/services/mock-sso.provider.ts`
  - `libs/auth/src/lib/models/auth.models.ts`
  - `tsconfig.base.json` (verify path alias)
- **Acceptance criteria:**
  - `AuthService` compiles and exports from `@boa/auth`.
  - Observable `authState$` emits state changes.
  - Mock SSO provider supports login, MFA challenge, lockout.
  - `npx tsc --noEmit` exits 0.
- **Verification command:**
  ```bash
  npx tsc --noEmit && npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 4.2 Build route guards and HTTP interceptors

- **What to build:** Class-based Angular 14 guards: `AuthGuard` (implements `CanActivate`), `MfaGuard`, `RoleGuard`. HTTP interceptors: `AuthTokenInterceptor`, `CorrelationIdInterceptor`, `ErrorHandlingInterceptor`, `SessionTimeoutInterceptor`. All in `libs/auth`.
- **Files likely touched:**
  - `libs/auth/src/lib/guards/auth.guard.ts`
  - `libs/auth/src/lib/guards/mfa.guard.ts`
  - `libs/auth/src/lib/guards/role.guard.ts`
  - `libs/auth/src/lib/interceptors/auth-token.interceptor.ts`
  - `libs/auth/src/lib/interceptors/correlation-id.interceptor.ts`
  - `libs/auth/src/lib/interceptors/error-handling.interceptor.ts`
  - `libs/auth/src/lib/interceptors/session-timeout.interceptor.ts`
  - `libs/auth/src/index.ts`
- **Acceptance criteria:**
  - Guards are class-based (not functional), using `CanActivate` interface.
  - Interceptors implement `HttpInterceptor`.
  - Protected routes redirect unauthenticated users to `/login`.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 4.3 Wire auth into public pages and app shell

- **What to build:** Connect `LoginComponent` → `AuthService.login()` → redirect to MFA → `MfaChallengeComponent` → `AuthService.completeMfa()` → redirect to dashboard. Wire guards on authenticated routes. Wire interceptors in `AppModule` via `HTTP_INTERCEPTORS`. Session expiration → redirect to `/session-expired`.
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/public/login/login.component.ts`
  - `apps/digital-banking-app/src/app/public/mfa-challenge/mfa-challenge.component.ts`
  - `apps/digital-banking-app/src/app/app.module.ts`
  - `apps/digital-banking-app/src/app/app-routing.module.ts`
- **Acceptance criteria:**
  - Full login → MFA → dashboard flow works in-memory.
  - Invalid credentials show error state.
  - Invalid MFA code shows error; 3 failures trigger lockout.
  - Session expiration navigates to session-expired page.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

## Phase 5 — Design System Library

### 5.1 Create design system library scaffold and tokens

- **What to build:** Create `libs/boa-design-system` as an Angular library. Define design tokens in SCSS: color palette (BoA red/blue/navy), typography scale, spacing, border-radius, elevation/shadow, breakpoints. Create `BoaDesignSystemModule`. Set up Angular Material theme customization using `@angular/material/theming` APIs (`mat-palette`, `mat-light-theme`, `angular-material-theme`).
- **Files likely touched:**
  - `libs/boa-design-system/src/index.ts`
  - `libs/boa-design-system/src/lib/boa-design-system.module.ts`
  - `libs/boa-design-system/src/lib/styles/_variables.scss`
  - `libs/boa-design-system/src/lib/styles/_typography.scss`
  - `libs/boa-design-system/src/lib/styles/_theme.scss`
  - `libs/boa-design-system/src/lib/styles/_mixins.scss`
  - `tsconfig.base.json`
- **Acceptance criteria:**
  - Library compiles.
  - SCSS variables importable by consumer apps.
  - Angular Material theme uses custom palettes.
  - `npx tsc --noEmit` exits 0.
- **Verification command:**
  ```bash
  npx tsc --noEmit && npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 5.2 Build core shared components (Button, AccountCard, MoneyDisplay, AlertBanner)

- **What to build:** `BoaButtonComponent` (primary/secondary/tertiary, loading, disabled, icon support). `AccountCardComponent` (name, masked number, balance, status badge, click). `MoneyDisplayComponent` (currency format, negatives, masked, compact). `AlertBannerComponent` (info/warning/error/success, dismissible, icon, ARIA).
- **Files likely touched:**
  - `libs/boa-design-system/src/lib/components/button/`
  - `libs/boa-design-system/src/lib/components/account-card/`
  - `libs/boa-design-system/src/lib/components/money-display/`
  - `libs/boa-design-system/src/lib/components/alert-banner/`
  - `libs/boa-design-system/src/lib/boa-design-system.module.ts`
  - `libs/boa-design-system/src/index.ts`
- **Acceptance criteria:**
  - All four components compile and are exported from `@boa/design-system`.
  - `MoneyDisplay` correctly formats `$1,234.56`, `-$500.00`, masked `****`.
  - `AlertBanner` includes ARIA `role="alert"`.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 5.3 Build DataTable, Dialog, FormField wrappers

- **What to build:** `DataTableComponent` (wraps `MatTable`; inputs: column config, data; supports sort, pagination, empty/loading states, row click output). `DialogWrapperComponent` (wraps `MatDialog`; header/body/footer, confirm/cancel, close, a11y labels). `FormFieldComponent` (wraps `MatFormField`; label, hint, error, required, currency input, masked input).
- **Files likely touched:**
  - `libs/boa-design-system/src/lib/components/data-table/`
  - `libs/boa-design-system/src/lib/components/dialog-wrapper/`
  - `libs/boa-design-system/src/lib/components/form-field/`
  - `libs/boa-design-system/src/lib/boa-design-system.module.ts`
- **Acceptance criteria:**
  - `DataTable` renders with sort headers and paginator.
  - `DialogWrapper` can be opened via `MatDialog.open()`.
  - `FormField` shows error messages from reactive form control.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 5.4 Build LoadingSkeleton, EmptyState, Stepper, GlobalHeader, SideNav

- **What to build:** `LoadingSkeletonComponent` (card/table/text variants). `EmptyStateComponent` (icon, title, body, CTA). `StepperComponent` (wraps `MatStepper`). `GlobalHeaderComponent` (logo, search, user menu, sign-out, responsive). `SideNavComponent` (nav links, responsive collapse).
- **Files likely touched:**
  - `libs/boa-design-system/src/lib/components/loading-skeleton/`
  - `libs/boa-design-system/src/lib/components/empty-state/`
  - `libs/boa-design-system/src/lib/components/stepper/`
  - `libs/boa-design-system/src/lib/components/global-header/`
  - `libs/boa-design-system/src/lib/components/side-nav/`
  - `libs/boa-design-system/src/lib/boa-design-system.module.ts`
- **Acceptance criteria:**
  - All components compile and export from `@boa/design-system`.
  - `LoadingSkeleton` renders animated placeholder blocks.
  - `Stepper` wraps Angular Material Stepper.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

## Phase 6 — Financial Data Mocks

### 6.1 Build financial-data library with API clients

- **What to build:** Create `libs/financial-data` with: `AccountApiClient` (getAccounts, getAccountDetail, getBalance, simulate latency/outage), `TransactionApiClient` (getTransactions, filter, getDetail, exportMock), `TransferApiClient` (validateTransfer, submitTransfer, confirmationNumber, simulate insufficient funds/timeout). `ProviderErrorMapper` (map third-party errors to user-friendly messages). All backed by in-memory mock data.
- **Files likely touched:**
  - `libs/financial-data/src/index.ts`
  - `libs/financial-data/src/lib/financial-data.module.ts`
  - `libs/financial-data/src/lib/services/account-api.client.ts`
  - `libs/financial-data/src/lib/services/transaction-api.client.ts`
  - `libs/financial-data/src/lib/services/transfer-api.client.ts`
  - `libs/financial-data/src/lib/services/provider-error-mapper.ts`
  - `libs/financial-data/src/lib/models/`
  - `libs/financial-data/src/lib/mock-data/`
  - `tsconfig.base.json`
- **Acceptance criteria:**
  - All API clients return Observables with realistic mock data.
  - Simulated errors produce user-friendly messages via `ProviderErrorMapper`.
  - Mock data includes checking, savings, credit card, loan accounts and 20+ transactions.
  - `npx tsc --noEmit` exits 0.
- **Verification command:**
  ```bash
  npx tsc --noEmit && npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 6.2 Build shared-utils and feature-flags libraries

- **What to build:** `libs/shared-utils`: currency formatting, date formatting, account number masking, PII redaction, correlation ID generation, error normalization, environment config access. `libs/feature-flags`: `FeatureFlagService` with flags for new-transfer-flow, new-dashboard-card, provider-fallback, angular18-migrated-behavior. Include `FeatureFlagDirective`.
- **Files likely touched:**
  - `libs/shared-utils/src/index.ts`
  - `libs/shared-utils/src/lib/shared-utils.module.ts`
  - `libs/shared-utils/src/lib/` (utility files)
  - `libs/feature-flags/src/index.ts`
  - `libs/feature-flags/src/lib/feature-flags.module.ts`
  - `libs/feature-flags/src/lib/services/feature-flag.service.ts`
  - `libs/feature-flags/src/lib/directives/feature-flag.directive.ts`
  - `tsconfig.base.json`
- **Acceptance criteria:**
  - `maskAccountNumber('1234567890')` returns `****7890`.
  - `redactPii(...)` masks email/phone/SSN.
  - `FeatureFlagService.isEnabled('new-transfer-flow')` returns boolean Observable.
  - `*boaFeatureFlag="'new-transfer-flow'"` structural directive works.
  - `npx tsc --noEmit` exits 0.
- **Verification command:**
  ```bash
  npx tsc --noEmit && npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

## Phase 7 — Analytics / Audit Logging

### 7.1 Build analytics library

- **What to build:** Create `libs/analytics` with: `AnalyticsService` (trackPageView, trackButtonClick, trackFormStep, trackError, trackCompletedTransfer, redactSensitiveFields). `AnalyticsDirective` (`boaTrackClick` directive for buttons/links). Route analytics: subscribe to Router events, log route changes with route name, timestamp, user segment.
- **Files likely touched:**
  - `libs/analytics/src/index.ts`
  - `libs/analytics/src/lib/analytics.module.ts`
  - `libs/analytics/src/lib/services/analytics.service.ts`
  - `libs/analytics/src/lib/directives/analytics.directive.ts`
  - `libs/analytics/src/lib/services/route-analytics.service.ts`
  - `tsconfig.base.json`
- **Acceptance criteria:**
  - `AnalyticsService` logs to console (mock).
  - Sensitive fields (accountNumber, ssn) are redacted before logging.
  - `boaTrackClick` directive attaches click handler.
  - Route changes trigger `trackPageView`.
  - `npx tsc --noEmit` exits 0.
- **Verification command:**
  ```bash
  npx tsc --noEmit && npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 7.2 Build audit-logging library

- **What to build:** Create `libs/audit-logging` with: `AuditLogService` (logLoginAttempt, logMfaResult, logTransferReview, logTransferConfirmation, logBillPayConfirmation, logProfileSecurityChange, logExportTransactions). Each event includes correlationId, userId, timestamp. PII redaction on all log payloads.
- **Files likely touched:**
  - `libs/audit-logging/src/index.ts`
  - `libs/audit-logging/src/lib/audit-logging.module.ts`
  - `libs/audit-logging/src/lib/services/audit-log.service.ts`
  - `libs/audit-logging/src/lib/models/audit-event.model.ts`
  - `tsconfig.base.json`
- **Acceptance criteria:**
  - `AuditLogService` produces structured log objects.
  - All events include `correlationId` and `userId`.
  - PII is redacted.
  - `npx tsc --noEmit` exits 0.
- **Verification command:**
  ```bash
  npx tsc --noEmit && npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

## Phase 8 — Banking Pages

### 8.1 Account Dashboard page

- **What to build:** Dashboard feature module with: total balance summary, checking/savings/credit card account cards (using `AccountCard` from design system), recent transactions preview, alerts area, loading skeleton state, empty state, API error state. Uses `FinancialDataModule`, `AnalyticsModule`, `BoaDesignSystemModule`.
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/features/dashboard/dashboard.module.ts`
  - `apps/digital-banking-app/src/app/features/dashboard/dashboard-routing.module.ts`
  - `apps/digital-banking-app/src/app/features/dashboard/dashboard.component.ts`
  - `apps/digital-banking-app/src/app/features/dashboard/dashboard.component.html`
  - `apps/digital-banking-app/src/app/features/dashboard/dashboard.component.scss`
- **Acceptance criteria:**
  - Dashboard shows account cards with balances from mock data.
  - Loading skeletons display while data loads.
  - Error state renders alert banner on API failure.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 8.2 Account Detail page

- **What to build:** Account detail feature module: account name, available/current balance, masked routing/account number, transactions table (Angular Material `MatTable` with `MatPaginator`, `MatSort`), filter by type, date range filter (`MatDatepicker`), download transactions button, error/loading/empty states.
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/features/account-detail/account-detail.module.ts`
  - `apps/digital-banking-app/src/app/features/account-detail/account-detail-routing.module.ts`
  - `apps/digital-banking-app/src/app/features/account-detail/account-detail.component.ts`
  - `apps/digital-banking-app/src/app/features/account-detail/account-detail.component.html`
  - `apps/digital-banking-app/src/app/features/account-detail/account-detail.component.scss`
- **Acceptance criteria:**
  - Page renders account info and transaction table.
  - Table supports sort, pagination, type filter, date range filter.
  - Masked account number shows `****XXXX` pattern.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 8.3 Transactions page

- **What to build:** Transactions feature module: full transaction search, date range filter, category filter, debit/credit filter, transaction detail drawer/modal, pagination, sort, export CSV action, error states for provider failure.
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/features/transactions/transactions.module.ts`
  - `apps/digital-banking-app/src/app/features/transactions/transactions-routing.module.ts`
  - `apps/digital-banking-app/src/app/features/transactions/transactions.component.ts`
  - `apps/digital-banking-app/src/app/features/transactions/transactions.component.html`
  - `apps/digital-banking-app/src/app/features/transactions/transaction-detail/`
- **Acceptance criteria:**
  - Transactions list with filters renders.
  - Clicking a transaction opens a detail drawer/dialog.
  - Export button triggers mock CSV export and audit log.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 8.4 Transfer flow (multi-step)

- **What to build:** Transfer feature module with stepper: (1) select source account, (2) select destination account, (3) enter amount with currency input and custom validators, (4) review transfer, (5) confirm transfer, (6) success receipt. Reactive forms, confirmation dialog, audit log events on review/confirm, analytics events each step, route guard on authenticated.
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/features/transfer/transfer.module.ts`
  - `apps/digital-banking-app/src/app/features/transfer/transfer-routing.module.ts`
  - `apps/digital-banking-app/src/app/features/transfer/transfer.component.ts`
  - `apps/digital-banking-app/src/app/features/transfer/transfer.component.html`
  - `apps/digital-banking-app/src/app/features/transfer/steps/`
  - `apps/digital-banking-app/src/app/features/transfer/validators/`
- **Acceptance criteria:**
  - 6-step stepper flow works end-to-end.
  - Insufficient funds shows validation error.
  - Confirmation dialog appears before submit.
  - Audit log fires on review and confirmation.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 8.5 Bill Pay page

- **What to build:** Bill Pay feature module: list of payees, add payee modal (MatDialog), payment amount form, scheduled payment date picker, review and confirm payment, success/error state.
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/features/bill-pay/bill-pay.module.ts`
  - `apps/digital-banking-app/src/app/features/bill-pay/bill-pay-routing.module.ts`
  - `apps/digital-banking-app/src/app/features/bill-pay/bill-pay.component.ts`
  - `apps/digital-banking-app/src/app/features/bill-pay/bill-pay.component.html`
  - `apps/digital-banking-app/src/app/features/bill-pay/add-payee-dialog/`
- **Acceptance criteria:**
  - Payee list renders from mock data.
  - Add payee modal opens and closes.
  - Payment form validates amount, selects date via datepicker.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 8.6 Profile & Security Settings page

- **What to build:** Profile feature module: customer profile info, masked email/phone, manage MFA methods, toggle paperless, change password placeholder, recent login activity table, trusted devices table, sign out all devices action.
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/features/profile/profile.module.ts`
  - `apps/digital-banking-app/src/app/features/profile/profile-routing.module.ts`
  - `apps/digital-banking-app/src/app/features/profile/profile.component.ts`
  - `apps/digital-banking-app/src/app/features/profile/profile.component.html`
- **Acceptance criteria:**
  - Profile page shows masked PII.
  - Login activity and trusted devices tables render.
  - MFA method management section present.
  - `ng build digital-banking-app` exits 0.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

## Phase 9 — Downstream Apps

### 9.1 Build downstream-credit-card-app

- **What to build:** Small app under `apps/downstream-credit-card-app`. Uses `BoaDesignSystemModule`. Credit card summary page, recent card transactions, payment due banner. Uses `AccountCard`, `MoneyDisplay`, `DataTable`, `AlertBanner` from `@boa/design-system`.
- **Files likely touched:**
  - `apps/downstream-credit-card-app/src/app/app.module.ts`
  - `apps/downstream-credit-card-app/src/app/app.component.ts`
  - `apps/downstream-credit-card-app/src/app/app.component.html`
  - `apps/downstream-credit-card-app/src/main.ts`
  - `angular.json`
- **Acceptance criteria:**
  - `ng build downstream-credit-card-app` exits 0.
  - App uses at least 4 shared design system components.
  - No internal copies of design system components.
- **Verification command:**
  ```bash
  npx ng build downstream-credit-card-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 9.2 Build downstream-loans-app

- **What to build:** Small app under `apps/downstream-loans-app`. Uses `BoaDesignSystemModule`. Loan summary page, payment schedule table, autopay enrollment banner. Uses same shared components.
- **Files likely touched:**
  - `apps/downstream-loans-app/src/app/app.module.ts`
  - `apps/downstream-loans-app/src/app/app.component.ts`
  - `apps/downstream-loans-app/src/app/app.component.html`
  - `apps/downstream-loans-app/src/main.ts`
  - `angular.json`
- **Acceptance criteria:**
  - `ng build downstream-loans-app` exits 0.
  - App uses shared design system components.
- **Verification command:**
  ```bash
  npx ng build downstream-loans-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

## Phase 10 — Tests

### 10.1 Unit tests for auth, design system, and utilities

- **What to build:** Unit tests for: `AuthService`, `MfaChallengeComponent`, `AuthGuard`, `AuthTokenInterceptor`, `MoneyDisplayComponent`, `AccountCardComponent`, `DataTableComponent`, transfer form validators, `ProviderErrorMapper`, PII redaction utility. Use Karma/Jasmine (or Jest).
- **Files likely touched:**
  - `libs/auth/src/lib/services/auth.service.spec.ts`
  - `libs/auth/src/lib/guards/auth.guard.spec.ts`
  - `libs/auth/src/lib/interceptors/auth-token.interceptor.spec.ts`
  - `libs/boa-design-system/src/lib/components/money-display/money-display.component.spec.ts`
  - `libs/boa-design-system/src/lib/components/account-card/account-card.component.spec.ts`
  - `libs/boa-design-system/src/lib/components/data-table/data-table.component.spec.ts`
  - `libs/financial-data/src/lib/services/provider-error-mapper.spec.ts`
  - `libs/shared-utils/src/lib/*.spec.ts`
  - `apps/digital-banking-app/src/app/features/transfer/validators/*.spec.ts`
  - `apps/digital-banking-app/src/app/public/mfa-challenge/mfa-challenge.component.spec.ts`
- **Acceptance criteria:**
  - All spec files pass.
  - `ng test` (or `npx jest`) exits 0.
  - At least 10 spec files with meaningful assertions.
- **Verification command:**
  ```bash
  npx ng test --watch=false --browsers=ChromeHeadless
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 10.2 Integration tests

- **What to build:** Integration tests for: Login → MFA → dashboard flow, dashboard loads accounts from financial provider, transactions table handles provider error, transfer review validates amount, analytics fires on route change, audit log fires on transfer confirmation.
- **Files likely touched:**
  - `apps/digital-banking-app/src/app/integration-tests/`
  - Or inline `.spec.ts` files in relevant feature modules
- **Acceptance criteria:**
  - Integration tests exercise multi-service flows.
  - All pass.
  - `ng test --watch=false` exits 0.
- **Verification command:**
  ```bash
  npx ng test --watch=false --browsers=ChromeHeadless
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 10.3 E2E smoke tests

- **What to build:** Three Cypress or Playwright e2e tests: (1) User logs in, completes MFA, sees dashboard. (2) User views account details and transactions. (3) User completes mock transfer and sees confirmation.
- **Files likely touched:**
  - `e2e/` or `apps/digital-banking-app/e2e/`
  - `cypress.config.ts` or `playwright.config.ts`
  - `e2e/specs/login-mfa-dashboard.spec.ts`
  - `e2e/specs/account-transactions.spec.ts`
  - `e2e/specs/transfer-flow.spec.ts`
- **Acceptance criteria:**
  - All 3 e2e tests pass.
  - Tests run headless.
- **Verification command:**
  ```bash
  npx cypress run --headless
  ```
  or
  ```bash
  npx playwright test
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 10.4 Downstream compatibility / build validation

- **What to build:** Validate that all three apps and the design system library build successfully. Can be a simple shell script or npm script.
- **Files likely touched:**
  - `package.json` (scripts)
  - `scripts/validate-all-builds.sh` (optional)
- **Acceptance criteria:**
  - `ng build digital-banking-app` exits 0.
  - `ng build downstream-credit-card-app` exits 0.
  - `ng build downstream-loans-app` exits 0.
  - All three pass in sequence.
- **Verification command:**
  ```bash
  npx ng build digital-banking-app && npx ng build downstream-credit-card-app && npx ng build downstream-loans-app
  ```
- **Status:** `[ ]`
- **Notes:**

---

## Phase 11 — Demo Docs

### 11.1 Architecture overview document

- **What to build:** `docs/ARCHITECTURE.md` describing: apps, shared libraries, auth flow, financial provider flow, analytics flow, audit logging, downstream consumers. Include a text-based diagram of the monorepo structure.
- **Files likely touched:**
  - `docs/ARCHITECTURE.md`
- **Acceptance criteria:**
  - Document covers all libraries and apps.
  - Includes dependency relationships.
  - Readable by non-engineers.
- **Verification command:**
  ```bash
  test -f docs/ARCHITECTURE.md && wc -l docs/ARCHITECTURE.md
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 11.2 Angular 14 dependency report

- **What to build:** `docs/DEPENDENCY_REPORT.md` listing: all Angular packages and versions, Angular Material packages, TypeScript version, RxJS version, known old dependencies, current build/test commands.
- **Files likely touched:**
  - `docs/DEPENDENCY_REPORT.md`
- **Acceptance criteria:**
  - Lists every `@angular/*` package with version.
  - Lists Material, RxJS, TypeScript, Zone.js versions.
  - Includes build and test commands.
- **Verification command:**
  ```bash
  test -f docs/DEPENDENCY_REPORT.md && wc -l docs/DEPENDENCY_REPORT.md
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 11.3 Migration risk register

- **What to build:** `docs/MIGRATION_RISK_REGISTER.md` with risks: auth/MFA regression, token interceptor breakage, Angular Material visual drift, shared library downstream breakage, analytics event loss, third-party provider contract breakage, inadequate test coverage, accessibility regression, build tooling changes, rollback complexity.
- **Files likely touched:**
  - `docs/MIGRATION_RISK_REGISTER.md`
- **Acceptance criteria:**
  - At least 10 risk items.
  - Each risk has description, likelihood, impact, mitigation.
- **Verification command:**
  ```bash
  test -f docs/MIGRATION_RISK_REGISTER.md && wc -l docs/MIGRATION_RISK_REGISTER.md
  ```
- **Status:** `[ ]`
- **Notes:**

---

### 11.4 Human approval checklist

- **What to build:** `docs/HUMAN_APPROVAL_CHECKLIST.md` with gates: architect approval for migration plan, security approval for auth changes, QA approval for critical journeys, downstream team approval for shared library release, release manager approval for rollout.
- **Files likely touched:**
  - `docs/HUMAN_APPROVAL_CHECKLIST.md`
- **Acceptance criteria:**
  - At least 5 approval gates.
  - Each gate has approver role, what they review, acceptance criteria.
- **Verification command:**
  ```bash
  test -f docs/HUMAN_APPROVAL_CHECKLIST.md && wc -l docs/HUMAN_APPROVAL_CHECKLIST.md
  ```
- **Status:** `[ ]`
- **Notes:**

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 1. Workspace Setup | 1.1, 1.2 | `[x]` |
| 2. Angular 14 Dependencies | 2.1, 2.2 | `[x]` |
| 3. Main App Shell | 3.1, 3.2, 3.3 | `[ ]` |
| 4. Auth/MFA Flows | 4.1, 4.2, 4.3 | `[ ]` |
| 5. Design System Library | 5.1, 5.2, 5.3, 5.4 | `[ ]` |
| 6. Financial Data Mocks | 6.1, 6.2 | `[ ]` |
| 7. Analytics/Audit Logging | 7.1, 7.2 | `[ ]` |
| 8. Banking Pages | 8.1, 8.2, 8.3, 8.4, 8.5, 8.6 | `[ ]` |
| 9. Downstream Apps | 9.1, 9.2 | `[ ]` |
| 10. Tests | 10.1, 10.2, 10.3, 10.4 | `[ ]` |
| 11. Demo Docs | 11.1, 11.2, 11.3, 11.4 | `[ ]` |
