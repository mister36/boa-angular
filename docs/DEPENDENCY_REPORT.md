# Angular 14 Dependency Report

This document provides a complete inventory of all dependencies, their versions, and known aging concerns for migration planning.

---

## Angular Core Packages

All Angular framework packages are pinned to the 14.2.x range.

| Package | Version | Category |
|---------|---------|----------|
| `@angular/core` | `^14.2.0` | Framework |
| `@angular/common` | `^14.2.0` | Framework |
| `@angular/compiler` | `^14.2.0` | Framework |
| `@angular/compiler-cli` | `^14.2.0` | Build |
| `@angular/forms` | `^14.2.0` | Framework |
| `@angular/router` | `^14.2.0` | Framework |
| `@angular/animations` | `^14.2.0` | Framework |
| `@angular/platform-browser` | `^14.2.0` | Framework |
| `@angular/platform-browser-dynamic` | `^14.2.0` | Framework |

---

## Angular Material and CDK

| Package | Version | Notes |
|---------|---------|-------|
| `@angular/material` | `^14.2.7` | Pre-MDC (legacy) component API |
| `@angular/cdk` | `^14.2.7` | Component Dev Kit |

Material 14 uses the legacy theming API (`@angular/material/theming`) with `mat-palette`, `mat-light-theme`, and `angular-material-theme` mixins. Material 15+ replaced this with MDC-based components and a new theming API.

---

## TypeScript

| Package | Version | Notes |
|---------|---------|-------|
| `typescript` | `~4.7.2` | Angular 14-compatible; current stable is 5.x |

---

## RxJS

| Package | Version | Notes |
|---------|---------|-------|
| `rxjs` | `~7.5.0` | Compatible with Angular 14-18 |

---

## Zone.js

| Package | Version | Notes |
|---------|---------|-------|
| `zone.js` | `~0.11.4` | Angular 14-compatible; newer Angular versions require 0.13+ |

---

## Build Tooling

| Package | Version | Notes |
|---------|---------|-------|
| `@angular/cli` | `~14.2.13` | Angular CLI |
| `@angular-devkit/build-angular` | `^14.2.13` | Webpack-based browser builder |
| `tslib` | `^2.3.0` | TypeScript runtime helpers |

The build uses the `@angular-devkit/build-angular:browser` builder for all three applications. Angular 17+ introduced a new `application` builder based on esbuild.

---

## Linting

| Package | Version | Notes |
|---------|---------|-------|
| `eslint` | `^8.57.1` | Core linter |
| `@angular-eslint/builder` | `^14.4.0` | Angular ESLint integration |
| `@angular-eslint/eslint-plugin` | `^14.4.0` | Angular-specific rules |
| `@angular-eslint/eslint-plugin-template` | `^14.4.0` | Template linting |
| `@angular-eslint/schematics` | `^14.4.0` | Code generation schematics |
| `@angular-eslint/template-parser` | `^14.4.0` | Template parser |
| `@typescript-eslint/eslint-plugin` | `^5.62.0` | TypeScript ESLint rules |
| `@typescript-eslint/parser` | `^5.62.0` | TypeScript parser for ESLint |

---

## Testing

| Package | Version | Notes |
|---------|---------|-------|
| `karma` | `~6.4.0` | Test runner |
| `karma-chrome-launcher` | `~3.1.0` | Chrome browser launcher |
| `karma-coverage` | `~2.2.0` | Code coverage |
| `karma-jasmine` | `~5.1.0` | Jasmine adapter for Karma |
| `karma-jasmine-html-reporter` | `~2.0.0` | HTML reporter |
| `jasmine-core` | `~4.3.0` | Test framework |
| `@types/jasmine` | `~4.0.0` | TypeScript types |
| `cypress` | `^15.15.0` | E2E testing |

---

## Formatting

| Package | Version | Notes |
|---------|---------|-------|
| `prettier` | `^3.8.3` | Code formatter |

---

## Known Aging Dependencies

| Concern | Detail |
|---------|--------|
| Angular 14 EOL | Angular 14 reached end of life in November 2023. No further security patches or bug fixes are issued. |
| Angular Material pre-MDC | Material 14 uses the legacy component rendering. Material 15 migrated to MDC (Material Design Components) Web, which changes DOM structure, CSS classes, and theming APIs. |
| TypeScript 4.7 | Current TypeScript stable is 5.x. Angular 16+ requires TypeScript 4.9+, Angular 17+ requires 5.2+. |
| Zone.js 0.11 | Angular 16+ requires Zone.js 0.13+. Angular 18 supports optional zoneless mode. |
| Webpack browser builder | The `@angular-devkit/build-angular:browser` builder is being replaced by the `application` builder (esbuild-based) in Angular 17+. |
| Class-based guards | `CanActivate` class-based guards are deprecated in Angular 15.2+ in favor of functional guards. |
| `HttpInterceptor` interface | Traditional `HttpInterceptor` implementations are being superseded by functional interceptors via `withInterceptors()` in Angular 15+. |
| ESLint 8 | ESLint 9 introduces flat config format. `@angular-eslint` 18+ supports ESLint 9. |

---

## Build and Test Commands

### Development

| Command | Description |
|---------|-------------|
| `ng serve` | Serve digital-banking-app on port 4200 |
| `ng serve downstream-credit-card-app` | Serve credit card app on port 4201 |
| `ng serve downstream-loans-app` | Serve loans app on port 4202 |

### Build

| Command | Description |
|---------|-------------|
| `ng build digital-banking-app` | Production build of main app |
| `ng build downstream-credit-card-app` | Production build of credit card app |
| `ng build downstream-loans-app` | Production build of loans app |
| `npm run validate:builds` | Build all 3 apps sequentially |

### Testing

| Command | Description |
|---------|-------------|
| `ng test` | Run unit and integration tests (Karma/Jasmine, ChromeHeadless) |
| `ng test --watch=false --browsers=ChromeHeadless` | Single CI run |
| `npm run e2e` | Run Cypress E2E tests headless |
| `npm run e2e:open` | Open Cypress interactive runner |

### Linting and Formatting

| Command | Description |
|---------|-------------|
| `npx eslint .` | Run ESLint |
| `npx prettier --check .` | Check formatting |
