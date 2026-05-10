````md id="vfru0r"
# Slice 13 — Firestore Security Rules

## Purpose

Harden Firestore security rules for the MVP.

Until now, Firebase rules were temporary for development.  
This slice replaces temporary broad rules with controlled role-based rules aligned with the app workflow.

The app must not rely only on frontend hiding. Firestore rules must protect the data.

## Current Context

Completed:

- Slice 1: App shell and navigation
- Slice 2: Firebase authentication
- Slice 3: Firestore user profiles and role guards
- Slice 4: Permit types admin
- Slice 5: Checklist items admin
- Slice 6: Permit creation
- Slice 7: Permit list and details
- Slice 8: HSE approval
- Slice 9: Construction Manager approval
- Slice 10: Dashboard and expiry
- Slice 11: Activity log
- Slice 12: Print / PDF export

Current project uses:

- Angular
- Firebase SDK directly
- Firebase Authentication
- Firestore
- SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

- Firestore rules file if not already present
- Role-based Firestore access rules
- User profile read rules
- Permit type read/write rules
- Checklist item read/write rules
- Permit create/read/update rules
- Permit checklist response create/read rules
- Permit event create/read rules
- Prevent physical deletes
- Prevent unauthorized role actions
- Document local deployment/testing steps if needed

## Out of Scope

Do not implement:

- App Check
- Cloud Functions
- Custom claims
- Admin SDK backend
- Server-side validation
- Storage rules
- Hosting deployment
- New UI features
- New permit workflow actions
- New collections
- Extra dependencies

## Firestore Collections

Rules must cover:

```text
users
permitTypes
checklistItems
permits
permitChecklistResponses
permitEvents
````

## Roles

Use only:

```text
ADMIN
HSE_MANAGER
CONSTRUCTION_MANAGER
SITE_USER
```

## General Security Rules

* Only authenticated users can access app data.
* User must have an active profile in `users/{uid}`.
* Inactive users cannot read or write app data.
* Users can read their own profile.
* Users cannot update their own role.
* No client-side physical deletes for MVP.
* Permit events should be append-only.
* Approval history fields should not be directly edited by unauthorized users.

## users Rules

Collection:

```text
users/{userId}
```

Rules:

* Authenticated user can read their own user profile.
* Admin can read all user profiles if needed by the app.
* Client cannot create/update/delete users in this MVP unless existing app already requires it.
* User management UI is not implemented yet.

Expected:

```text
allow read own profile
allow admin read all profiles
deny create/update/delete
```

## permitTypes Rules

Collection:

```text
permitTypes/{permitTypeId}
```

Rules:

* Active users can read permit types.
* Only ADMIN can create permit types.
* Only ADMIN can update permit types.
* No client delete.

Important:

* Deactivation uses `active: false`.
* Do not allow delete.

## checklistItems Rules

Collection:

```text
checklistItems/{checklistItemId}
```

Rules:

* Active users can read checklist items.
* ADMIN can create/update checklist items.
* HSE_MANAGER can create/update checklist items.
* No client delete.

Important:

* Deactivation uses `active: false`.
* Do not allow delete.

## permits Rules

Collection:

```text
permits/{permitId}
```

### Read Rules

* ADMIN can read all permits.
* HSE_MANAGER can read permits.
* CONSTRUCTION_MANAGER can read permits.
* SITE_USER can read only permits where:

```text
requestedByUserId == request.auth.uid
```

If existing UI requires HSE/CM to read all permits for queues and dashboard, allow it for MVP.

### Create Rules

Only SITE_USER can create permits.

Create must require:

```text
requestedByUserId == request.auth.uid
status == "SUBMITTED"
```

Do not allow users to create already-approved permits.

### HSE Update Rules

Only HSE_MANAGER can update permit from:

```text
SUBMITTED → HSE_APPROVED
SUBMITTED → REJECTED
```

Required:

* Existing permit status must be `SUBMITTED`.
* New status must be `HSE_APPROVED` or `REJECTED`.
* `updatedAt` may change.
* `hseApprovedBy` / `hseApprovedAt` may be added.
* `rejectionReason` must be present when status becomes `REJECTED`.

Do not allow HSE to approve:

```text
HSE_APPROVED
APPROVED
REJECTED
EXPIRED
CLOSED
```

### Construction Manager Update Rules

Only CONSTRUCTION_MANAGER can update permit from:

```text
HSE_APPROVED → APPROVED
HSE_APPROVED → REJECTED
```

Required:

* Existing permit status must be `HSE_APPROVED`.
* New status must be `APPROVED` or `REJECTED`.
* `updatedAt` may change.
* `cmApprovedBy` / `cmApprovedAt` may be added.
* `rejectionReason` must be present when status becomes `REJECTED`.

Do not allow CM to approve:

```text
SUBMITTED
APPROVED
REJECTED
EXPIRED
CLOSED
```

### Delete Rules

Deny all client deletes.

## permitChecklistResponses Rules

Collection:

```text
permitChecklistResponses/{responseId}
```

Rules:

* Active users can read checklist responses if they can read the related permit.
* SITE_USER can create checklist responses during permit creation.
* Updates should be denied after creation for MVP.
* Deletes denied.

MVP acceptable simplification:

If rule-level join validation becomes too complex, allow active users to read checklist responses and SITE_USER to create them, then document stricter relation checks for later.

Do not block MVP with complex rules.

## permitEvents Rules

Collection:

```text
permitEvents/{eventId}
```

Rules:

* Active users can read permit events if they can read the related permit.
* Events are append-only.
* No update.
* No delete.

Allowed create actions:

SITE_USER:

```text
PERMIT_SUBMITTED
```

HSE_MANAGER:

```text
HSE_APPROVED
HSE_REJECTED
```

CONSTRUCTION_MANAGER:

```text
CM_APPROVED
CM_REJECTED
```

Optional if already implemented:

```text
PDF_EXPORTED
```

Only allow `PDF_EXPORTED` if the app actually creates it.
If not implemented, do not add special support.

## Rule File Location

If the project does not already have Firebase config files, create minimal Firebase rules setup:

```text
firestore.rules
```

Optionally:

```text
firebase.json
```

Only add what is needed for Firestore rules.

Do not deploy automatically unless explicitly requested.

## Validation Limits

Firestore rules are not a full backend validator.

Rules should protect the major workflow transitions and roles.

Do not overcomplicate rules to validate every UI field if it creates fragile rules.

Focus on:

* authentication
* active user profile
* role authorization
* status transitions
* append-only events
* no deletes
* site users cannot create permits for another user
* no unauthorized approval updates

## Testing Guidance

Test manually in Firebase Console / app:

1. Unauthenticated user cannot read app data.
2. Inactive user cannot read/write app data.
3. SITE_USER can create permit with status `SUBMITTED`.
4. SITE_USER cannot create permit with status `APPROVED`.
5. SITE_USER cannot approve permits.
6. HSE_MANAGER can update `SUBMITTED` to `HSE_APPROVED`.
7. HSE_MANAGER can update `SUBMITTED` to `REJECTED`.
8. HSE_MANAGER cannot update `HSE_APPROVED` to `APPROVED`.
9. CONSTRUCTION_MANAGER can update `HSE_APPROVED` to `APPROVED`.
10. CONSTRUCTION_MANAGER can update `HSE_APPROVED` to `REJECTED`.
11. CONSTRUCTION_MANAGER cannot update `SUBMITTED` to `APPROVED`.
12. ADMIN can manage permit types.
13. ADMIN can manage checklist items.
14. HSE_MANAGER can manage checklist items.
15. SITE_USER cannot manage permit types or checklist items.
16. Delete attempts fail.

## Acceptance Criteria

Manual verification:

1. Firestore rules file exists.
2. Rules are aligned with current app roles.
3. App still works for login/profile loading.
4. Admin can manage permit types.
5. Admin/HSE can manage checklist items as intended.
6. Site user can create permits.
7. HSE can approve/reject submitted permits.
8. CM can approve/reject HSE-approved permits.
9. Site user cannot approve/reject.
10. Unauthorized routes may be hidden by UI, but Firestore also blocks invalid writes.
11. Deletes are denied.
12. Events cannot be updated or deleted.
13. No new UI feature was added.
14. No backend/server was added.

## Codex Boundary

Implement this slice only.

Do not implement:

* New UI screens
* New permit workflow actions
* Cloud Functions
* Custom claims
* App Check
* Storage rules
* Hosting deployment
* Server-side API
* Extra dependencies
* Future-slice features

Before changing files:

* Explain planned changes briefly.

After changing files:

* Summarize exactly what changed.
* Explain why the solution is minimal.
* Mention how to test or deploy the rules.

## Self-Review Checklist

Before finishing, verify:

* Rules use Firebase Auth UID.
* Rules check active user profile.
* Rules check role from `users/{uid}`.
* SITE_USER cannot create permits for another UID.
* SITE_USER cannot approve permits.
* HSE_MANAGER cannot perform CM approval.
* CONSTRUCTION_MANAGER cannot perform HSE approval.
* ADMIN-only configuration remains protected.
* Checklist management allows ADMIN/HSE only.
* Deletes are denied.
* Permit events are append-only.
* No app features were added.
* No unnecessary dependencies were added.

```
```
