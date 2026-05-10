````md
# Slice 7 — Permit List and Details

## Purpose

Add permit visibility after creation.

This slice allows users to view submitted permits in a list and open a permit details page.

Slice 6 created permits in Firestore, but the UI does not show them yet.  
Slice 7 makes created permits visible.

## Current Context

Completed:

- Slice 1: App shell and navigation
- Slice 2: Firebase authentication
- Slice 3: Firestore user profiles and role guards
- Slice 4: Permit types admin
- Slice 5: Checklist items admin
- Slice 6: Permit creation

Current project uses:

- Angular
- Firebase SDK directly
- Firebase Authentication
- Firestore
- SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

- Permit list page
- Permit details page
- Load permits from Firestore
- Load single permit by ID
- Load checklist responses for permit details
- Load permit events for permit details
- Show permit status
- Show permit expiry state
- Show basic filters if simple
- Show mobile-friendly permit cards
- Show desktop-friendly list/table
- Add route to permit details
- Keep role-based visibility simple

## Out of Scope

Do not implement:

- HSE approval
- Construction Manager approval
- Reject action
- Close permit action
- Extend permit action
- Edit permit
- Delete permit
- Save draft
- Resubmit rejected permit
- Dashboard calculations
- PDF/export
- Activity log screen
- Advanced reporting
- Complex search
- Full Firestore security hardening
- Extra dependencies

## Firestore Collections Used

Use existing collections:

```text
permits
permitChecklistResponses
permitEvents
permitTypes
users
````

Do not create new collections in this slice.

## Routes

Use existing route:

```text
/permits
```

Add route:

```text
/permits/:id
```

Allowed roles:

```text
ADMIN
HSE_MANAGER
CONSTRUCTION_MANAGER
SITE_USER
```

## Permit List Visibility

Keep this simple for MVP.

Recommended visibility:

### ADMIN

Can view all permits.

### SITE_USER

Can view permits where:

```text
requestedByUserId == currentUser.uid
```

### HSE_MANAGER

Can view permits relevant to HSE review:

```text
SUBMITTED
HSE_APPROVED
APPROVED
REJECTED
EXPIRED
CLOSED
```

For this slice, HSE may read all permits if that keeps the implementation simple.

### CONSTRUCTION_MANAGER

Can view permits relevant to final approval:

```text
HSE_APPROVED
APPROVED
REJECTED
EXPIRED
CLOSED
```

For this slice, Construction Manager may read all permits if that keeps the implementation simple.

Important:

Do not implement approval actions yet.

## Permit List Page Requirements

The permit list page should show:

```text
Permit number
Permit type
Work location
Requester
Status
Start time
Expiry time
Expiry state
View action
```

Desktop layout may use a simple table.

Mobile layout should use cards.

Do not use a wide table on mobile.

## Simple Filters

Add only simple filters if practical:

```text
Status filter
Permit type filter
Search by permit number/location
```

If this makes the implementation too large, implement only status filter and latest-first sorting.

Sort permits by latest created first.

Do not build advanced date filtering in this slice unless very simple.

## Permit Details Page Requirements

The permit details page should show:

```text
Permit number
Status
Permit type
Requester
Requester role
Contractor/trade
Work location
Scope of work
Hazards
Equipment
Number of workers
Risk level
Start time
Duration hours
Expiry time
Expiry state
Checklist responses
Permit events
```

Do not add approve/reject buttons yet.

If the current user role would later approve the permit, show only informational text if needed, but no action.

## Expiry Display

Calculate expiry state in the UI:

```text
Active = status is APPROVED and current time < expiryTime
Expiring Soon = status is APPROVED and less than 2 hours remain
Expired = status is APPROVED and current time >= expiryTime
Not Active = any non-approved status
```

For MVP, do not physically update the permit status to `EXPIRED` in this slice.

Only display the calculated state.

## Status Display

Use clear status labels:

```text
SUBMITTED → Pending HSE Approval
HSE_APPROVED → Pending Construction Manager Approval
APPROVED → Approved
REJECTED → Rejected
EXPIRED → Expired
CLOSED → Closed
```

Use simple status badges.

Do not create a complex status component unless already useful.

## Permit Service Requirements

Extend or create a simple PermitService that supports:

```ts
getPermitsForCurrentUser()
getPermitById(id: string)
getChecklistResponsesForPermit(permitId: string)
getEventsForPermit(permitId: string)
```

Use Firebase SDK directly.

Expected Firebase functions may include:

```ts
getFirestore
collection
doc
query
where
orderBy
onSnapshot
getDoc
getDocs
```

Use existing service structure from Slice 6 if available.

Avoid scattered Firestore reads inside many components.

## Checklist Responses Display

Load checklist responses from:

```text
permitChecklistResponses
```

Filtered by:

```text
permitId == selected permit id
```

Show:

```text
checked / unchecked
itemTextSnapshot
required / optional
```

Important:

Use `itemTextSnapshot`.

Do not read live checklist item text for submitted permits.

## Permit Events Display

Load permit events from:

```text
permitEvents
```

Filtered by:

```text
permitId == selected permit id
```

Show:

```text
action
actorName
actorRole
comment if exists
createdAt
```

For now, most permits may only have:

```text
PERMIT_SUBMITTED
```

That is okay.

## UI Requirements

Permit list:

* Simple page title: `Permits`
* Loading state
* Empty state
* Error state
* Desktop table or clean list
* Mobile cards
* View details action

Permit details:

* Simple page title
* Back to permits link
* Clear grouped sections
* Checklist section
* Events section
* No horizontal scrolling
* Mobile-friendly layout

## Empty States

If no permits exist, show:

```text
No permits found.
```

For SITE_USER, optionally show:

```text
Create your first permit.
```

Do not add complex onboarding.

## Temporary Firestore Access Note

This slice needs active users to read:

```text
permits
permitChecklistResponses
permitEvents
permitTypes
```

Do not implement final production security rules in code unless the project already has a Firebase rules file.

For testing, Firebase Console rules may need to allow:

* active authenticated users to read permits
* active authenticated users to read permit checklist responses
* active authenticated users to read permit events

Final hardening belongs to Slice 13.

## Acceptance Criteria

Manual verification:

1. Login as `SITE_USER`.
2. Create a permit from `/permits/new` if needed.
3. Open `/permits`.
4. The created permit appears in the list.
5. Open the permit details page.
6. Permit details are displayed correctly.
7. Checklist responses are displayed using snapshot text.
8. Permit event `PERMIT_SUBMITTED` is displayed.
9. Permit status label is readable.
10. Expiry time is displayed.
11. Expiry state is displayed.
12. Login as `ADMIN`.
13. Admin can view permits.
14. Login as `HSE_MANAGER`.
15. HSE Manager can view relevant permits.
16. Login as `CONSTRUCTION_MANAGER`.
17. Construction Manager can view relevant permits.
18. No approve/reject buttons exist yet.
19. No dashboard stats are implemented.
20. No PDF/export is implemented.
21. No permit editing is implemented.

## Codex Boundary

Implement this slice only.

Do not implement:

* HSE approval
* Construction Manager approval
* Reject action
* Permit editing
* Permit delete
* Dashboard stats
* Activity log screen
* PDF/export
* Full security rules
* Complex reporting

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
* Existing permit creation still works.
* `/permits` shows created permits.
* `/permits/:id` shows permit details.
* Checklist responses use `itemTextSnapshot`.
* Permit events are displayed.
* Status labels are clear.
* Expiry state is calculated for display only.
* Mobile layout has no horizontal scrolling.
* No future-slice features were implemented.
* No unnecessary dependencies were added.

```
```
