# Build Plan: Pre-Migration Angular 14 Banking App for Devin Demo

## Core Objective

Build a realistic Angular 14 monorepo that represents a Bank of America-style digital banking frontend before a major framework upgrade.

The repo should not be a massive production banking app. It should be a **representative enterprise migration target** with enough complexity for Devin to:

1. Audit the repo.
2. Identify Angular 14 dependencies and risky migration surfaces.
3. Upgrade to Angular 18.
4. Fix breaking changes.
5. Validate auth, customer flows, shared component compatibility, analytics, and downstream consumers.
6. Produce migration notes, risk reports, tests, and reviewable PRs.

The pre-migration app should intentionally include the kinds of surfaces that would make an Angular upgrade risky in a regulated enterprise.

---

# 1. Workspace Shape

Use an Angular 14 monorepo with multiple apps and shared libraries.

Could use either Angular CLI workspace or Nx. Nx is fine, but avoid making the tooling complexity the star of the demo. The important part is that the repo clearly has:

```txt
apps/
  digital-banking-app
  downstream-credit-card-app
  downstream-loans-app

libs/
  boa-design-system
  auth
  analytics
  financial-data
  audit-logging
  feature-flags
  shared-utils
  testing
```

The main app is `digital-banking-app`.

The downstream apps should be small, but they must consume the shared design system library. Their purpose is to prove that the shared component library upgrade does not break downstream teams.

---

# 2. Angular 14-Specific Requirements

The app should clearly look like an Angular 14 codebase, not a modern Angular 18 app.

Use:

-   Angular 14
-   Angular Material 14
-   TypeScript version compatible with Angular 14
-   RxJS 7
-   Zone.js
-   NgModules, not standalone components
-   Class-based route guards
-   Traditional `AppModule`, feature modules, routing modules
-   Angular Material theming via SCSS
-   Some legacy Angular Material patterns
-   Karma/Jasmine unit tests, or Jest if easier, but include test infrastructure
-   Cypress or Playwright-style e2e tests if feasible

Avoid:

-   Standalone components
-   Signals
-   New Angular control flow syntax
-   Modern Angular 17/18 patterns
-   New application builder
-   Overly clean architecture that makes migration too easy

The repo should feel like something a large enterprise team has maintained for years.

---

# 3. Main App: Digital Banking App

## 3.1 Public Routes

The public area should include:

### Login Page

Features:

-   Mock SSO login form
-   Username input
-   Password input
-   “Remember this device” checkbox
-   Submit button
-   Error state for invalid login
-   Loading state
-   Redirects to MFA challenge after successful credential validation

Purpose for demo:

-   Shows authentication is a critical migration surface.
-   Lets Devin identify auth-related code.
-   Lets you demonstrate that login still works after upgrade.

---

### MFA Challenge Page

Features:

-   Displays masked phone/email destination
-   Input for 6-digit verification code
-   “Resend code” action
-   “Use another method” link
-   Error state for wrong/expired code
-   Lockout state after too many failed attempts
-   Successful MFA redirects to account dashboard

Purpose for demo:

-   Directly maps to SSO/MFA concerns.
-   Gives Security Engineer something concrete.
-   Good place for e2e smoke test.

---

### Session Expired Page

Features:

-   Message explaining session timeout
-   Button to return to login
-   Optional “You were signed out for your security” copy

Purpose for demo:

-   Shows session handling and security UX.
-   Good test target after Angular/router/auth changes.

---

### Maintenance / Outage Page

Features:

-   Generic maintenance message
-   Retry button
-   Contact support link

Purpose for demo:

-   Shows customer-facing fallback state.
-   Useful for testing routing and global error handling.

---

## 3.2 Authenticated App Shell

After login/MFA, the app should render a secure banking shell.

Features:

-   Top nav
-   Side nav or mobile nav
-   User profile menu
-   Sign out button
-   Session timer indicator
-   Global alert/banner area
-   Responsive layout
-   Protected routes
-   Route-level analytics tracking
-   Accessibility-friendly navigation

Purpose for demo:

-   Shows app-wide dependencies.
-   Exercises design system layout components.
-   Exercises route guards, analytics, and shared UI.

---

# 4. Authenticated Banking Features

## 4.1 Account Dashboard

Features:

-   Total balance summary
-   Checking account card
-   Savings account card
-   Credit card summary card
-   Recent transactions preview
-   Alerts area
-   “View details” links
-   Loading skeleton state
-   Empty state
-   API error state

Use shared design system components for:

-   Account cards
-   Money display
-   Buttons
-   Alert banners
-   Loading skeletons

Purpose for demo:

-   This should be the main page you show.
-   It touches financial data provider, analytics, auth, and design system.
-   Good representative “millions of customers see this” flow.

---

## 4.2 Account Detail Page

Features:

-   Account name
-   Available balance
-   Current balance
-   Routing/account number display with masking
-   Recent transactions table
-   Filter by transaction type
-   Date range filter
-   “Download transactions” button
-   Error/loading/empty states

Purpose for demo:

-   Shows table-heavy Angular Material usage.
-   Good migration surface for Angular Material table, paginator, sort, forms, and date picker.

Use Angular Material components:

-   Table
-   Paginator
-   Sort
-   Datepicker
-   Select
-   Form field
-   Dialog or tooltip

---

## 4.3 Transactions Page

Features:

-   Full transaction search
-   Date range filter
-   Category filter
-   Debit/credit filter
-   Transaction detail drawer or modal
-   Pagination
-   Sort
-   Export CSV action
-   Error states for third-party provider failure

Purpose for demo:

-   Strong financial-data-provider surface.
-   Shows contract tests and mock provider behavior.
-   Shows UI complexity likely affected by Angular Material upgrade.

---

## 4.4 Transfer Flow

This should be the most important customer journey.

Screens or steps:

1. Select source account
2. Select destination account
3. Enter amount
4. Review transfer
5. Confirm transfer
6. Success receipt

Features:

-   Reactive forms
-   Custom validators
-   Currency input
-   Insufficient funds validation
-   Confirmation dialog
-   Success page
-   Audit log event on transfer review and confirmation
-   Analytics events for each step
-   Route guard preventing access unless authenticated
-   Mock API call to create transfer

Purpose for demo:

-   This is the best “critical flow” for e2e testing.
-   Good way to show Devin preserving customer experience.
-   Good way to show compliance/audit logging.

Important: Do not actually build real payment logic. Mock everything.

---

## 4.5 Bill Pay Page

Features:

-   List of payees
-   Add payee modal
-   Payment amount form
-   Scheduled payment date picker
-   Review and confirm payment
-   Success/error state

Purpose for demo:

-   Adds another compliance-sensitive flow.
-   Good Angular Material dialog/date-picker/forms migration surface.
-   Can be smaller than transfer flow.

---

## 4.6 Profile and Security Settings

Features:

-   Display customer profile info
-   Masked email/phone
-   Manage MFA methods
-   Toggle paperless statements
-   Change password placeholder
-   Recent login activity table
-   Trusted devices table
-   Sign out of all devices action

Purpose for demo:

-   Security Engineer will care about this.
-   Demonstrates that MFA and session UX are first-class.
-   Useful for auth tests.

---

# 5. Shared Design System Library

This is the most important part of the repo for the Chief Architect.

The design system should be a shared Angular library consumed by the main app and downstream apps.

It should wrap Angular Material components and expose BoA-style components.

## 5.1 Core Design Tokens

Include:

-   Color variables
-   Typography scale
-   Spacing scale
-   Border radius variables
-   Elevation/shadow tokens
-   Breakpoints
-   SCSS theme file
-   Angular Material theme customization

Purpose for demo:

-   Shows design system layered on Angular Material.
-   Creates a realistic migration risk when Material changes.

---

## 5.2 Shared Components

Build these components:

### Primary Button

Features:

-   Primary/secondary/tertiary variants
-   Loading state
-   Disabled state
-   Icon support

Migration value:

-   Common shared component.
-   Easy to visually verify.

---

### Account Card

Features:

-   Account name
-   Masked account number
-   Balance
-   Status badge
-   Click action

Migration value:

-   Used by main app and downstream apps.
-   Good downstream compatibility test.

---

### Money Display

Features:

-   Formats currency
-   Handles negative values
-   Handles hidden/masked values
-   Supports compact display

Migration value:

-   Used everywhere.
-   Good unit test target.

---

### Alert Banner

Features:

-   Info/warning/error/success variants
-   Dismissible option
-   Icon
-   ARIA role

Migration value:

-   Accessibility and design system stability.

---

### Data Table Wrapper

Wrap Angular Material table.

Features:

-   Column config input
-   Empty state
-   Loading state
-   Sort support
-   Pagination support
-   Row click output

Migration value:

-   This is likely to break or require updates during Material migration.
-   Strong architect demo surface.

---

### Modal/Dialog Wrapper

Wrap Angular Material dialog.

Features:

-   Standard header/body/footer
-   Confirm/cancel actions
-   Close button
-   Accessibility labels

Migration value:

-   Material dialog changes are common migration pain.

---

### Form Field Wrapper

Wrap Angular Material form field.

Features:

-   Label
-   Hint text
-   Error text
-   Required indicator
-   Currency input option
-   Masked input option

Migration value:

-   Angular Material form-field changes can create UI drift.

---

### Loading Skeleton

Features:

-   Card skeleton
-   Table skeleton
-   Text skeleton

Migration value:

-   Common customer experience component.

---

### Empty State

Features:

-   Icon
-   Title
-   Body copy
-   CTA button

Migration value:

-   Common shared UI component.

---

### Stepper / Progress Indicator

Can wrap Angular Material stepper.

Used in transfer and bill pay flows.

Migration value:

-   Angular Material migration target.
-   Useful for critical customer journey tests.

---

### Global Header

Features:

-   Logo placeholder
-   Search placeholder
-   User menu
-   Sign out
-   Mobile responsive behavior

Migration value:

-   Layout/design regression target.

---

### Side Navigation

Features:

-   Dashboard
-   Accounts
-   Transfers
-   Bill Pay
-   Profile/Security
-   Responsive collapse

Migration value:

-   Router integration plus design system.

---

# 6. Auth Library

Build a separate auth library with mock services and real frontend patterns.

## 6.1 Auth Service

Features:

-   Login method
-   Complete MFA method
-   Logout method
-   Refresh session method
-   Get current user method
-   Observable auth state
-   Mock token storage
-   Session expiration timer

Purpose:

-   Central auth integration point.
-   Important for Security Engineer demo.

---

## 6.2 Route Guards

Use Angular 14 class-based guards.

Include:

-   Authenticated guard
-   MFA completed guard
-   Role/permission guard

Purpose:

-   Route guards are common Angular migration surfaces.
-   Shows protected banking routes.

---

## 6.3 HTTP Interceptors

Include:

-   Auth token interceptor
-   Correlation ID interceptor
-   Error handling interceptor
-   Session timeout interceptor

Purpose:

-   Critical migration surface.
-   Strong security concern.
-   Useful tests.

---

## 6.4 Mock SSO/MFA Provider

Features:

-   Pretend redirect/callback flow
-   Mock user identity
-   Mock MFA challenge
-   Mock failed MFA
-   Mock expired challenge
-   Mock lockout

Purpose:

-   Represents internal authentication services without real secrets.
-   Lets Devin identify SSO/MFA as a risk area.

---

# 7. Analytics SDK Library

Build a proprietary analytics wrapper library.

## 7.1 Analytics Service

Features:

-   Track page view
-   Track button click
-   Track form step
-   Track error
-   Track completed transfer/bill pay event
-   Redact sensitive fields before logging

Purpose:

-   Represents proprietary analytics SDK.
-   Good migration risk because analytics often hides in directives/services.

---

## 7.2 Analytics Directive

Features:

-   Add directive to buttons/links
-   Sends click event with metadata
-   Used across dashboard, transfers, bill pay

Purpose:

-   Gives Devin template-level migration surface.
-   Shows custom directives.

---

## 7.3 Route Analytics

Features:

-   Tracks route changes
-   Includes route name, timestamp, user segment
-   Avoids PII

Purpose:

-   Touches router behavior.
-   Security/privacy relevance.

---

# 8. Financial Data Provider Library

Build a mock third-party financial data provider client.

## 8.1 Account API Client

Features:

-   Get accounts
-   Get account detail
-   Get balance
-   Simulate provider latency
-   Simulate provider outage

---

## 8.2 Transaction API Client

Features:

-   Get transactions
-   Filter by date/category/type
-   Get transaction detail
-   Export transactions mock

---

## 8.3 Transfer API Client

Features:

-   Validate transfer
-   Submit transfer
-   Return confirmation number
-   Simulate insufficient funds
-   Simulate provider timeout

---

## 8.4 Provider Error Mapping

Features:

-   Map third-party errors into customer-friendly UI messages
-   Log technical error internally
-   Avoid exposing raw provider errors to customer

Purpose:

-   Shows customer experience risk.
-   Shows third-party integration risk.
-   Good tests.

---

# 9. Audit Logging Library

Build a lightweight compliance/audit logging layer.

Features:

-   Log login attempt
-   Log MFA success/failure
-   Log transfer review
-   Log transfer confirmation
-   Log bill pay confirmation
-   Log profile security changes
-   Log export transactions action
-   Include correlation ID
-   Include user ID mock
-   Redact PII

Purpose:

-   Gives Security Engineer a reason to trust the workflow.
-   Lets Devin produce an audit evidence packet after migration.

---

# 10. Feature Flags Library

Build a simple feature flag system.

Features:

-   Enable/disable new transfer flow
-   Enable/disable new dashboard card
-   Enable/disable provider fallback
-   Enable/disable Angular 18 migrated component behavior if needed later

Purpose:

-   Lets you discuss incremental rollout.
-   Supports canary/rollback story.
-   Useful for VP Eng and Architect.

---

# 11. Shared Utilities Library

Include utilities for:

-   Currency formatting
-   Date formatting
-   Account number masking
-   PII redaction
-   Correlation ID generation
-   Error normalization
-   Environment config access

Purpose:

-   Realistic enterprise shared code.
-   Gives Devin more dependency edges to inspect.

---

# 12. Downstream Apps

You need at least one downstream app. Two is better, but keep them small.

## 12.1 Downstream Credit Card App

Features:

-   Uses shared design system
-   Credit card summary page
-   Recent card transactions
-   Payment due banner
-   Uses `AccountCard`, `MoneyDisplay`, `DataTable`, `AlertBanner`

Purpose:

-   Proves shared library consumers still build after migration.

---

## 12.2 Downstream Loans App

Features:

-   Uses shared design system
-   Loan summary page
-   Payment schedule table
-   Autopay enrollment banner
-   Uses same shared components

Purpose:

-   Second downstream consumer makes “multiple teams consume this library” feel real.

---

# 13. Testing Requirements

The pre-migration app should already have some tests, but not perfect coverage.

This lets Devin improve or update tests during migration.

## 13.1 Unit Tests

Include tests for:

-   Auth service
-   MFA flow component
-   Auth guard
-   Token interceptor
-   Money display component
-   Account card component
-   Data table component
-   Transfer form validators
-   Error mapping utility
-   PII redaction utility

---

## 13.2 Integration Tests

Include tests for:

-   Login → MFA → dashboard flow
-   Dashboard loads accounts from financial provider
-   Transactions table handles provider error
-   Transfer review page validates amount
-   Analytics event fires on route change
-   Audit log fires on transfer confirmation

---

## 13.3 E2E Smoke Tests

Include 3 core e2e tests:

1. User logs in, completes MFA, sees dashboard.
2. User views account details and transactions.
3. User completes a mock transfer and sees confirmation.

These are the tests you should show in the demo.

---

## 13.4 Downstream Compatibility Tests

Include simple build/test commands for:

-   Main digital banking app
-   Design system library
-   Credit card downstream app
-   Loans downstream app

Purpose:

-   This is one of the highest-value demo pieces.
-   It directly proves the shared component library did not break downstream teams.

---

# 14. Intentional Migration Risk Surfaces

Add these on purpose. They make the repo demo-worthy.

## 14.1 Angular Material Usage

Use Angular Material in:

-   Tables
-   Dialogs
-   Datepickers
-   Form fields
-   Selects
-   Tooltips
-   Snackbars
-   Steppers
-   Menus
-   Icons

This gives Devin a clear Angular Material upgrade surface.

---

## 14.2 SCSS Theme Coupled to Material

Use a custom SCSS theme that depends on Angular Material theming APIs.

Purpose:

-   Design system migration risk.
-   Visual regression risk.

---

## 14.3 Class-Based Guards

Use Angular 14-style class guards.

Purpose:

-   Angular router modernization surface.

---

## 14.4 Interceptors

Use multiple HTTP interceptors.

Purpose:

-   Security and auth-sensitive migration surface.

---

## 14.5 Reactive Forms

Use reactive forms in:

-   Login
-   MFA
-   Transfer
-   Bill pay
-   Transaction filters

Purpose:

-   Common Angular upgrade surface.
-   Good validation tests.

---

## 14.6 Custom Directives

Include:

-   Analytics click directive
-   Permission/role directive
-   Feature flag directive
-   Mask sensitive value directive

Purpose:

-   Template compatibility surface.

---

## 14.7 Third-Party SDK Wrapper

The analytics SDK and financial data provider should look like proprietary/third-party integrations.

Purpose:

-   Lets Devin identify external integration risk.
-   Supports mock contract tests.

---

# 15. Seed Data

Include mock data for:

-   User profile
-   MFA methods
-   Checking account
-   Savings account
-   Credit card account
-   Loan account
-   Transactions
-   Payees
-   Scheduled payments
-   Login activity
-   Trusted devices
-   Provider errors
-   Audit log events

Make data realistic but obviously fake.

Do not include real customer data.

---

# 16. Demo-Specific Pages and Artifacts

Add a `docs` area in the repo with pre-migration docs.

## 16.1 Architecture Overview

Should describe:

-   Apps
-   Shared libraries
-   Auth flow
-   Financial provider flow
-   Analytics flow
-   Audit logging
-   Downstream consumers

---

## 16.2 Current Angular 14 Dependency Report

Should include:

-   Angular packages
-   Angular Material packages
-   TypeScript version
-   RxJS version
-   Known old dependencies
-   Current build/test commands

---

## 16.3 Migration Risk Register

Should include risks like:

-   Auth/MFA regression
-   Token interceptor breakage
-   Angular Material visual drift
-   Shared component library breaking downstream consumers
-   Analytics event loss
-   Third-party provider contract breakage
-   Inadequate test coverage
-   Accessibility regression
-   Build tooling changes
-   Rollback complexity

---

## 16.4 Human Approval Checklist

Should include:

-   Architect approval for migration plan
-   Security approval for auth-sensitive changes
-   QA approval for critical customer journeys
-   Downstream team approval for shared library release
-   Release manager approval for rollout

This artifact will help you show that Devin is not bypassing enterprise controls.

---

# 17. What the App Should Demonstrate in the Final Demo

By the time this pre-migration app exists, Devin should be able to later produce evidence for:

## VP Engineering

-   Angular 14 to 18 upgrade is executable.
-   Work can be decomposed into small PRs.
-   Critical customer flows are preserved.
-   There is a clear pilot scope.
-   There is a rollback plan.

## Security Engineer

-   Auth/MFA flows are identified and tested.
-   Interceptors and session handling are not casually changed.
-   PII redaction exists.
-   Audit logging exists.
-   Dependency risks are visible.
-   Human approval gates exist.

## Chief Architect

-   Shared library is central to the migration.
-   Downstream apps are validated.
-   Design system migration is controlled.
-   Architecture docs and migration notes are generated.
-   Migration can become a repeatable playbook.

---

# 18. Recommended Minimum Viable Build

Do not overbuild. The minimum strong version is:

```txt
Main digital banking app:
- Login
- MFA
- Dashboard
- Account detail
- Transactions
- Transfer flow
- Profile/security page

Shared libraries:
- Design system
- Auth
- Analytics
- Financial data provider
- Audit logging
- Feature flags

Downstream apps:
- Credit card app
- Loans app

Tests:
- Login/MFA/dashboard e2e
- Transfer e2e
- Design system unit tests
- Auth service/guard/interceptor tests
- Downstream app build validation

Docs:
- Architecture overview
- Risk register
- Migration checklist
- Human approval checklist
```

That is enough.

The biggest mistake would be building too many banking features and not enough migration surfaces. The app exists to make Devin’s upgrade story credible. Prioritize auth, shared UI library, downstream consumers, tests, and auditability.
