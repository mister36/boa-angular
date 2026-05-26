#!/usr/bin/env bash
set -e

echo "=== Validating all application builds ==="
echo ""

echo "[1/3] Building digital-banking-app..."
npx ng build digital-banking-app --configuration=production
echo "  ✓ digital-banking-app build succeeded"
echo ""

echo "[2/3] Building downstream-credit-card-app..."
npx ng build downstream-credit-card-app --configuration=production
echo "  ✓ downstream-credit-card-app build succeeded"
echo ""

echo "[3/3] Building downstream-loans-app..."
npx ng build downstream-loans-app --configuration=production
echo "  ✓ downstream-loans-app build succeeded"
echo ""

echo "=== All 3 applications built successfully ==="
