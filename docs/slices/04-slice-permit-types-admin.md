````md
# Slice 4 — Permit Types Admin

## Purpose

Add Admin management for permit types.

Permit types define the categories of risky work, such as:

- Excavation
- Confined Space
- Lifting Operations
- Hot Work
- Drilling
- Electrical

This slice makes permit types dynamic instead of hardcoded.

## Current Context

Completed:

- Slice 1: App shell and navigation
- Slice 2: Firebase authentication
- Slice 3: Firestore user profiles and role guards

Current project uses:

- Angular
- Firebase SDK directly
- Firebase Authentication
- Firestore
- SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

- Permit type model
- Permit type Firestore service
- Admin permit type page
- List permit types
- Create permit type
- Edit permit type
- Activate/deactivate permit type
- Basic validation
- Admin-only access using existing role guard

## Out of Scope

Do not implement:

- Checklist items
- Permit creation
- Permit approval
- Permit list
- Dashboard calculations
- User management CRUD
- Activity logs
- PDF/export
- Delete permit type permanently
- Advanced filtering/search
- Complex admin dashboard
- Full Firestore security hardening
- Extra dependencies

## Firestore Collection

Use collection:

```text
permitTypes
````

Document fields:

```ts
id?: string;
name: string;
description?: string;
active: boolean;
defaultRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
defaultDurationHours: number;
maxDurationHours: number;
createdBy?: string;
createdAt?: unknown;
updatedAt?: unknown;
```

Use Firestore document ID as the permit type ID.

## Business Rules

* Name is required.
* Default duration is required.
* Max duration is required.
* Default duration must be greater than 0.
* Max duration must be greater than 0.
* Max duration must be greater than or equal to default duration.
* Default risk level is required.
* Permit types should not be physically deleted.
* Use `active: false` instead of delete.
* Inactive permit types should remain visible in Admin but will not be selectable in permit creation later.

## Route

Add or use this route:

```text
/admin/permit-types
```

Allowed role:

```text
ADMIN
```

If `/admin` currently only shows a placeholder, update it minimally to link to:

```text
/admin/permit-types
```

Do not build the full Admin module yet.

## UI Requirements

The page should include:

* Page title: `Permit Types`
* Simple list/table on desktop
* Card-like readable layout on mobile if needed
* Create form
* Edit form or inline edit
* Active/inactive status
* Activate/deactivate action
* Clear validation messages

Keep the UI simple.

Suggested fields:

* Name
* Description
* Default risk level
* Default duration hours
* Max duration hours
* Active

## Permit Type Service Requirements

Create a simple service that supports:

* Load all permit types
* Create permit type
* Update permit type
* Activate/deactivate permit type

Expected methods can be similar to:

```ts
getPermitTypes()
createPermitType(input)
updatePermitType(id, input)
setPermitTypeActive(id, active)
```

Use Firebase SDK directly.

Expected Firebase functions may include:

```ts
getFirestore
collection
doc
addDoc
updateDoc
onSnapshot
serverTimestamp
query
orderBy
```

Use simple realtime loading if it fits the existing style.

## Validation

Form validation should block save when:

* Name is empty
* Default risk level is empty
* Default duration is missing or less than/equal to 0
* Max duration is missing or less than/equal to 0
* Max duration is less than default duration

Show clear messages.

Example:

```text
Max duration must be greater than or equal to default duration.
```

## Temporary Firestore Access Note

This slice needs Admin users to read/write `permitTypes`.

Do not implement final production security rules in code unless the project already has a Firebase rules file.

For testing, Firebase Console rules may need to allow:

* authenticated active users to read permit types
* only ADMIN users to create/update permit types

Final hardening belongs to Slice 13.

## Acceptance Criteria

Manual verification:

1. Login as an `ADMIN`.
2. Open `/admin`.
3. Navigate to `/admin/permit-types`.
4. Create a permit type.
5. Permit type appears in the list.
6. Edit the permit type.
7. Changes are saved in Firestore.
8. Deactivate the permit type.
9. Permit type remains visible but marked inactive.
10. Reactivate the permit type.
11. Try invalid duration values.
12. App shows validation and does not save.
13. Login as non-ADMIN.
14. Non-ADMIN cannot access `/admin/permit-types`.
15. No checklist feature exists yet.
16. No permit creation feature exists yet.

## Codex Boundary

Implement this slice only.

Do not implement:

* Checklist item management
* Permit creation
* Permit approval
* User management
* Dashboard stats
* PDF/export
* Delete behavior
* Complex admin layout
* Full security rules

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
* Existing auth/profile/role behavior still works.
* Only ADMIN can access permit type management.
* Permit types are stored in Firestore.
* Validation works.
* Deactivate is used instead of delete.
* No future-slice features were implemented.
* No unnecessary dependencies were added.

```
```
