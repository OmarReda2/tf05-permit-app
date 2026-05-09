# Slice 2 — Authentication

## Purpose

Add basic Firebase email/password authentication to the TF-05 Safety Permit App.

This slice makes the app private. Users must log in before accessing the main app shell created in Slice 1.

Authentication is part of the MVP because the product requires real user login and role-based access later. However, this slice only handles login/logout and route protection. Role-based behavior belongs to Slice 3.

Reference:
This slice is based on the controlled MVP docs in:
- docs/mvp-requirements.md
- docs/decisions.md
- docs/slices.md

Do not use broader product reference documents to implement extra features.

## Current Context

Slice 1 already created:

- Main app shell
- Responsive layout
- Desktop/sidebar or main navigation
- Mobile navigation
- Placeholder pages:
  - Dashboard
  - Permits
  - New Permit
  - Approvals
  - Admin
  - Profile

The project uses:

- Angular
- SCSS
- Firebase SDK directly

Important:

- Do not use `@angular/fire`.
- Do not introduce roles yet.
- Do not introduce Firestore yet unless strictly needed for auth initialization, which it is not.

## Scope

Implement only:

- Firebase app initialization using Firebase SDK
- Firebase Authentication setup
- Login page
- Email/password login
- Logout action
- Auth service
- Auth guard
- Redirect unauthenticated users to `/login`
- Redirect authenticated users away from `/login` to `/dashboard`
- Basic loading state while login is submitting
- Basic error message when login fails
- Basic authenticated user state persistence after refresh

## Out of Scope

Do not implement:

- User roles
- Firestore user profiles
- Role guards
- Admin user management
- Registration/sign-up screen
- Password reset
- Google login
- Permit creation
- Permit list functionality
- Approval logic
- Dashboard calculations
- Firestore collections
- Firestore security rules
- Activity logs
- PDF/export
- Extra UI libraries
- Extra dependencies
- Complex auth state management
- Full enterprise session handling

## Dependencies

Required previous slice:

- Slice 1 — App Shell

Required package:

- `firebase`

Forbidden package for now:

- `@angular/fire`

Reason:

The current Angular version has a dependency conflict with the available AngularFire version, so this project uses the Firebase SDK directly.

## Firebase Configuration

Use this Firebase web app config:

```ts
const firebaseConfig = {
  apiKey: "AIzaSyDMOtbLSsuxXcMkPg2gOB3pOCNyFW-N_Kk",
  authDomain: "tf05-permit-app-dev.firebaseapp.com",
  projectId: "tf05-permit-app-dev",
  storageBucket: "tf05-permit-app-dev.firebasestorage.app",
  messagingSenderId: "1020804220535",
  appId: "1:1020804220535:web:1e3649f45242c4040a6872"
};