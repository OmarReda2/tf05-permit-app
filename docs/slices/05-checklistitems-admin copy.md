````md
# Slice 5 — Checklist Items Admin

## Purpose

Add management for safety checklist items per permit type.

Checklist items define what the requester must confirm before submitting a permit.

Example:

Permit Type: Hot Work

Checklist items:
- Fire extinguisher available
- Combustible materials removed or protected
- Fire watch assigned
- Work area isolated

This slice makes checklist items dynamic instead of hardcoded.

## Current Context

Completed:

- Slice 1: App shell and navigation
- Slice 2: Firebase authentication
- Slice 3: Firestore user profiles and role guards
- Slice 4: Permit types admin

Current project uses:

- Angular
- Firebase SDK directly
- Firebase Authentication
- Firestore
- SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

- Checklist item model
- Checklist Firestore service
- Checklist items management page
- Load active/inactive permit types for selection
- List checklist items by selected permit type
- Create checklist item
- Edit checklist item
- Activate/deactivate checklist item
- Required/optional flag
- Order field
- Basic validation
- Role access for `ADMIN` and `HSE_MANAGER`

## Out of Scope

Do not implement:

- Permit creation
- Checklist completion by requester
- Checklist snapshot into permit
- Permit approvals
- Permit list/details
- Dashboard calculations
- User management CRUD
- Activity logs
- PDF/export
- Delete checklist item permanently
- Complex conditional checklist logic
- Evidence upload
- GPS
- Scoring
- Full Firestore security hardening
- Extra dependencies

## Firestore Collection

Use collection:

```text
checklistItems
````

Document fields:

```ts
id?: string;
permitTypeId: string;
permitTypeNameSnapshot?: string;
text: string;
required: boolean;
active: boolean;
order: number;
createdAt?: unknown;
updatedAt?: unknown;
```

Use Firestore document ID as the checklist item ID.

## Business Rules

* Permit type is required.
* Checklist text is required.
* Order is required.
* Order must be greater than or equal to 1.
* Required flag defaults to `true`.
* Active flag defaults to `true`.
* Checklist items should not be physically deleted.
* Use `active: false` instead of delete.
* Inactive checklist items remain visible in management but will not be used for new permit creation later.
* Checklist items belong to one permit type.
* For MVP, avoid conditional logic.

## Route

Add or use this route:

```text
/admin/checklist-items
```

Allowed roles:

```text
ADMIN
HSE_MANAGER
```

Important:

If the current `/admin` route is guarded for `ADMIN` only, make sure `/admin/checklist-items` can still be accessed by `HSE_MANAGER`.

Do not open all admin pages to HSE. Only checklist management may allow HSE.

## Admin Page Link

If `/admin` currently shows links, add a simple link to:

```text
/admin/checklist-items
```

Label:

```text
Checklist Items
```

Do not build a complex admin dashboard.

## UI Requirements

The page should include:

* Page title: `Checklist Items`
* Permit type selector
* Checklist item list for the selected permit type
* Create/edit form
* Required/optional toggle
* Active/inactive status
* Activate/deactivate action
* Order field
* Clear validation messages

Keep the UI simple.

Suggested fields:

* Permit type
* Checklist text
* Required
* Order
* Active

## Checklist Service Requirements

Create a simple service that supports:

```ts
getChecklistItemsByPermitType(permitTypeId: string)
createChecklistItem(input)
updateChecklistItem(id, input)
setChecklistItemActive(id, active)
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
where
orderBy
```

## Permit Type Loading

This page needs permit types from Slice 4.

Use the existing permit type service if available.

The permit type selector should show permit type names.

For management, both active and inactive permit types may be visible, but clearly mark inactive permit types.

Do not allow creating checklist items without selecting a permit type.

## Validation

Form validation should block save when:

* Permit type is not selected
* Checklist text is empty
* Order is missing
* Order is less than 1

Show clear messages.

Example:

```text
Checklist text is required.
```

Example:

```text
Order must be 1 or greater.
```

## Temporary Firestore Access Note

This slice needs `ADMIN` and `HSE_MANAGER` users to read/write `checklistItems`.

Do not implement final production security rules in code unless the project already has a Firebase rules file.

For testing, Firebase Console rules may need to allow:

* authenticated active users to read permit types
* authenticated active users to read checklist items
* only `ADMIN` and `HSE_MANAGER` users to create/update checklist items

Final hardening belongs to Slice 13.

## Acceptance Criteria

Manual verification:

1. Login as `ADMIN`.
2. Open `/admin/checklist-items`.
3. Select a permit type.
4. Create a checklist item.
5. Checklist item appears under the selected permit type.
6. Edit the checklist item text.
7. Change required/optional.
8. Change order.
9. Deactivate the checklist item.
10. Checklist item remains visible but marked inactive.
11. Reactivate the checklist item.
12. Try saving without checklist text.
13. App shows validation and does not save.
14. Try saving without permit type.
15. App shows validation and does not save.
16. Login as `HSE_MANAGER`.
17. HSE Manager can access `/admin/checklist-items`.
18. Login as `SITE_USER`.
19. Site user cannot access `/admin/checklist-items`.
20. No permit creation feature exists yet.
21. No checklist completion feature exists yet.

## Codex Boundary

Implement this slice only.

Do not implement:

* Permit creation
* Checklist completion
* Checklist snapshotting into permits
* Permit approvals
* Permit list/details
* Dashboard stats
* PDF/export
* Delete behavior
* Complex conditional checklist logic
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
* `ADMIN` and `HSE_MANAGER` can manage checklist items.
* `SITE_USER` cannot manage checklist items.
* Checklist items are stored in Firestore.
* Checklist items are linked to permit types.
* Validation works.
* Deactivate is used instead of delete.
* No future-slice features were implemented.
* No unnecessary dependencies were added.

```
```
