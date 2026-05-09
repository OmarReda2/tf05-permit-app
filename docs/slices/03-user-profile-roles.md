# Slice 3 — User Profile and Roles

## Purpose

Add application user profiles and role-based route access.

Firebase Authentication only proves the user is logged in.
This slice connects the logged-in Firebase user to an application profile stored in Firestore.

Roles are required because different users will later access different permit features.

## Current Context

Completed:

* Slice 1: App shell and navigation
* Slice 2: Firebase email/password authentication, login, logout, protected routes

Current project uses:

* Angular
* Firebase SDK directly
* Firebase Authentication
* SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

* Firestore initialization using Firebase SDK
* `users/{uid}` profile loading
* User profile model
* User service
* Role type/model
* Profile-not-configured page
* User-disabled/inactive handling
* Basic role guard
* Basic not-authorized page
* Show current user name/role in the app shell if simple
* Protect role-specific placeholder routes

## Out of Scope

Do not implement:

* User management CRUD
* Creating users from the app
* Editing users from the app
* Permit types
* Checklist items
* Permit creation
* Permit approvals
* Dashboard calculations
* Activity logs
* PDF/export
* Full Firestore security hardening
* Complex permissions engine
* Dynamic permission matrix
* Workflow engine

## Firestore Collection

Use collection:

```text
users
```

Document path:

```text
users/{firebaseAuthUid}
```

Fields:

```ts
displayName: string;
email: string;
role: 'ADMIN' | 'HSE_MANAGER' | 'CONSTRUCTION_MANAGER' | 'SITE_USER';
active: boolean;
createdAt?: unknown;
updatedAt?: unknown;
```

Use the Firebase Auth UID as the Firestore document ID.

## Roles

Use only these roles:

```ts
ADMIN
HSE_MANAGER
CONSTRUCTION_MANAGER
SITE_USER
```

Role meanings:

* `ADMIN`: configuration owner
* `HSE_MANAGER`: safety reviewer
* `CONSTRUCTION_MANAGER`: final approving authority
* `SITE_USER`: requester / site engineer / foreman

## Route Access Rules

General authenticated routes:

```text
/dashboard
/permits
/profile
```

Allowed for any active configured user.

Role-specific routes:

```text
/admin
```

Allowed roles:

```text
ADMIN
```

```text
/approvals
```

Allowed roles:

```text
HSE_MANAGER
CONSTRUCTION_MANAGER
```

```text
/permits/new
```

Allowed roles:

```text
SITE_USER
```

Do not implement the actual business features inside these pages yet.
Only protect the placeholder routes.

## Profile Missing Behavior

If Firebase Auth user exists but `users/{uid}` does not exist:

* Do not allow access to the main app.
* Show a clear page:

```text
Profile not configured
Your login exists, but your application profile has not been configured yet.
Please contact the system admin.
```

Do not auto-create the profile in the app.

Reason:

Profiles and roles should be controlled manually for now.

## Inactive User Behavior

If profile exists but:

```ts
active === false
```

Then:

* Block access to the app.
* Show a clear disabled-user page or reuse the profile-not-configured page with a different message.

Example:

```text
Account disabled
Your application access is disabled. Please contact the system admin.
```

## Manual Firebase Setup Required

Before testing, manually create Firestore user documents.

In Firebase Console:

```text
Firestore Database
→ users
→ Add document
```

Document ID must be the Firebase Auth UID.

Example admin profile:

```json
{
  "displayName": "Omar Admin",
  "email": "admin@tf05.local",
  "role": "ADMIN",
  "active": true
}
```

Example HSE profile:

```json
{
  "displayName": "HSE Manager",
  "email": "hse@tf05.local",
  "role": "HSE_MANAGER",
  "active": true
}
```

Example construction manager profile:

```json
{
  "displayName": "Construction Manager",
  "email": "cm@tf05.local",
  "role": "CONSTRUCTION_MANAGER",
  "active": true
}
```

Example site user profile:

```json
{
  "displayName": "Site Engineer",
  "email": "site@tf05.local",
  "role": "SITE_USER",
  "active": true
}
```

## Temporary Firestore Access Note

This slice needs the app to read `users/{uid}`.

Do not implement full Firestore security hardening in this slice.
Full rules belong to Slice 13.

For local/dev testing, use the minimum Firebase Console rules needed to allow an authenticated user to read their own user profile.

Do not open all collections publicly.

## Recommended Implementation

Follow the existing Slice 1 and Slice 2 structure.

Suggested files:

```text
src/app/auth/user-profile.model.ts
src/app/auth/user.service.ts
src/app/auth/role.guard.ts
src/app/auth/profile-status.guard.ts
src/app/auth/not-authorized/
src/app/auth/profile-not-configured/
```

Use existing project structure if different.

Keep implementation simple.

## UserService Requirements

The user service should:

* Read the current Firebase Auth user
* Load `users/{uid}` from Firestore
* Expose current user profile state
* Expose loading state if needed
* Expose helper method like `hasRole(...)`
* Treat missing profile as not configured
* Treat inactive profile as blocked

## Route Guard Requirements

Keep guards simple.

Expected guards:

1. Auth guard from Slice 2 remains responsible for login state.
2. Profile guard ensures logged-in user has an active Firestore profile.
3. Role guard checks allowed roles for specific routes.

Do not combine everything into a confusing mega-guard unless the current code structure strongly favors it.

## UI Requirements

Add simple pages:

```text
/profile-not-configured
/not-authorized
```

Profile page should show simple current user information:

* Display name
* Email
* Role
* Active status

Do not build edit profile.

App shell may show:

* Display name
* Role badge

Only do this if simple and not disruptive.

## Acceptance Criteria

Manual verification:

1. Login with Firebase user that has no Firestore profile.
2. App shows profile-not-configured page.
3. Create `users/{uid}` profile manually in Firestore.
4. Refresh/re-login.
5. User can access `/dashboard`.
6. `/profile` shows display name, email, role, and active status.
7. `ADMIN` can access `/admin`.
8. non-ADMIN cannot access `/admin` and sees `/not-authorized`.
9. `HSE_MANAGER` and `CONSTRUCTION_MANAGER` can access `/approvals`.
10. `SITE_USER` cannot access `/approvals`.
11. `SITE_USER` can access `/permits/new`.
12. inactive user is blocked.
13. No permit logic exists.
14. No user management CRUD exists.

## Codex Boundary

Implement this slice only.

Do not implement:

* Admin user management screen
* Permit types
* Checklist items
* Permit creation
* Approval actions
* Full security rules
* Complex permission system

Before changing files:

* Explain planned changes briefly.

After changing files:

* Summarize exactly what changed.
* Explain why the solution is minimal.
* Mention how to run and verify the slice.

## Self-Review Checklist

Before finishing, verify:

* Firebase SDK direct usage is preserved.
* `@angular/fire` is not added.
* Auth from Slice 2 still works.
* User profile is loaded from Firestore.
* Missing profile is handled cleanly.
* Inactive profile is blocked.
* Role guards work.
* No future-slice features were implemented.
* No unnecessary dependencies were added.
