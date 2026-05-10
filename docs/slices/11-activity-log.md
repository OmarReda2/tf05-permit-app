````md
# Slice 11 — Activity Log

## Purpose

Add a simple activity log screen.

This slice allows users to view permit events created during permit submission and approvals.

Events already exist from previous slices:

- `PERMIT_SUBMITTED`
- `HSE_APPROVED`
- `HSE_REJECTED`
- `CM_APPROVED`
- `CM_REJECTED`

This slice makes those events visible in one dedicated screen.

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

Current project uses:

- Angular
- Firebase SDK directly
- Firebase Authentication
- Firestore
- SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

- Activity log page
- Read permit events from Firestore
- Show event list
- Show event action
- Show permit number if available
- Show actor name
- Show actor role
- Show event comment if available
- Show event date/time
- Add navigation link if appropriate
- Keep page responsive
- Add simple filters only if minimal

## Out of Scope

Do not implement:

- New permit actions
- Approval changes
- Permit editing
- Permit delete
- Permit close
- Permit extension
- PDF/export
- Reports
- Charts
- Advanced analytics
- Full audit compliance system
- Full Firestore security hardening
- Extra dependencies

## Firestore Collections Used

Use existing collections:

```text
permitEvents
permits
users
````

Do not create new collections in this slice.

## Route

Add route:

```text
/activity-log
```

Allowed roles:

```text
ADMIN
HSE_MANAGER
CONSTRUCTION_MANAGER
SITE_USER
```

## Navigation

Add a navigation item if simple:

```text
Activity Log
```

For mobile navigation, only add it if it does not overcrowd the bottom navigation.

If mobile bottom nav already has limited space, keep Activity Log accessible from desktop/sidebar or from another simple link.

Do not redesign navigation.

## Event Visibility Rules

Keep this simple.

### ADMIN

Can view all permit events.

### HSE_MANAGER

Can view permit events relevant to permits they can see.

For MVP, HSE may view all permit events if this keeps implementation simple.

### CONSTRUCTION_MANAGER

Can view permit events relevant to permits they can see.

For MVP, CM may view all permit events if this keeps implementation simple.

### SITE_USER

Should view only events for permits where:

```text
permit.requestedByUserId == currentFirebaseUser.uid
```

Acceptable MVP simplification:

If joining events to permits is too large, use the existing permit visibility logic from the permit service and filter events by visible permit IDs.

Do not expose unrelated users' permit events to SITE_USER if avoidable.

## Event Display Fields

Show:

```text
Action
Permit number
Actor name
Actor role
Comment
Created at
```

If permit number is not directly available in the event, load related permit data by `permitId`.

If loading permit number makes the implementation too large, show `permitId` minimally, but prefer permit number.

## Event Action Labels

Display readable labels:

```text
PERMIT_SUBMITTED → Permit Submitted
HSE_APPROVED → HSE Approved
HSE_REJECTED → HSE Rejected
CM_APPROVED → Construction Manager Approved
CM_REJECTED → Construction Manager Rejected
PERMIT_CLOSED → Permit Closed
PERMIT_EXPIRED → Permit Expired
PDF_EXPORTED → PDF Exported
```

Only existing event types need to appear now.

Do not create new event actions in this slice.

## Sorting

Sort events by latest first:

```text
createdAt descending
```

## Filters

Add only simple filters if practical:

```text
Action filter
Permit number search
```

If this makes the implementation too large, implement no filters and keep latest-first list only.

Do not add date range filtering in this slice unless very simple.

## Activity Log Service Requirements

Extend existing permit event service or create a simple activity log service.

Possible methods:

```ts
getActivityEventsForCurrentUser()
getEventsForVisiblePermits(permitIds: string[])
```

Use Firebase SDK directly.

Expected Firebase functions may include:

```ts
getFirestore
collection
query
where
orderBy
onSnapshot
getDocs
```

Avoid scattered Firestore reads inside many components.

## UI Requirements

Activity log page should include:

* Page title: `Activity Log`
* Loading state
* Empty state
* Error state
* Latest-first event list
* Mobile-friendly cards
* Desktop-friendly list/table
* Clear event labels
* Clear timestamps
* No horizontal scrolling

## Empty State

If no events exist, show:

```text
No activity found.
```

For filtered results, show:

```text
No activity found for the selected filters.
```

## Temporary Firestore Access Note

This slice reads:

```text
permitEvents
permits
```

Do not implement final production security rules in code unless the project already has a Firebase rules file.

For testing, Firebase Console rules should allow active users to read permit events and permits.

Final hardening belongs to Slice 13.

## Acceptance Criteria

Manual verification:

1. Login as `SITE_USER`.
2. Create a permit.
3. Open `/activity-log`.
4. `PERMIT_SUBMITTED` event appears.
5. Login as `HSE_MANAGER`.
6. Approve or reject a submitted permit.
7. Open `/activity-log`.
8. HSE event appears.
9. Login as `CONSTRUCTION_MANAGER`.
10. Approve or reject an HSE-approved permit.
11. Open `/activity-log`.
12. CM event appears.
13. Event list is sorted latest first.
14. Event labels are readable.
15. Event actor name and role appear.
16. Event comment appears for rejected permits.
17. SITE_USER does not see unrelated users' events if filtering by visible permits is implemented.
18. No new permit actions are added.
19. No PDF/export is implemented.
20. No reports/charts are implemented.

## Codex Boundary

Implement this slice only.

Do not implement:

* PDF/export
* Reports
* Charts
* New permit workflow actions
* Permit close
* Permit extension
* Full security rules
* Advanced audit system
* Future-slice features

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
* Existing HSE approval still works.
* Existing CM approval still works.
* Activity log loads permit events.
* Events are latest-first.
* Event labels are readable.
* Mobile layout has no horizontal scrolling.
* No future-slice features were implemented.
* No unnecessary dependencies were added.

```
```
