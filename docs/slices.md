# TF-05 Permit App — Slice Plan

## Slice 0 — Project Setup
Angular project created, Firebase SDK installed, Codex rules added.

## Slice 1 — App Shell
Main layout, routing, placeholder pages, responsive navigation.

## Slice 2 — Authentication
Firebase email/password login, logout, protected routes.

## Slice 3 — User Profile and Roles
User profile loading from Firestore, role guards, profile-not-configured page.

## Slice 4 — Permit Types Admin
Admin can create, edit, activate/deactivate permit types.

## Slice 5 — Checklist Items Admin
Admin/HSE can manage checklist items per permit type.

## Slice 6 — Permit Creation
Site user creates permit, selects type, fills details, completes checklist, submits.

## Slice 7 — Permit List and Details
Permit list, status display, permit details page.

## Slice 8 — HSE Approval
HSE Manager approves/rejects submitted permits.

## Slice 9 — Construction Manager Approval
Construction Manager approves/rejects HSE-approved permits.

## Slice 10 — Dashboard and Expiry
Dashboard cards, active/pending/expiring/expired counts.

## Slice 11 — Activity Log
Permit event history.

## Slice 12 — Print/PDF
Printable permit summary using browser print.

## Slice 13 — Firestore Security Rules
Role-based Firestore protection and status transition hardening.