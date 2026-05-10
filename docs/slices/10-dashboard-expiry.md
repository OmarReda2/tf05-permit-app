````md
# Slice 10 — Dashboard and Expiry

## Purpose

Add a simple operational dashboard and expiry visibility.

This slice helps users quickly understand permit status after the full approval flow is available.

The dashboard should show counts and summaries such as:

- Active permits
- Pending HSE approval
- Pending Construction Manager approval
- Expiring soon
- Expired
- Rejected

This slice does not physically update permit status to `EXPIRED`. It calculates expiry state in the UI.

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

Current project uses:

- Angular
- Firebase SDK directly
- Firebase Authentication
- Firestore
- SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

- Dashboard summary cards
- Load permits relevant to the current user
- Count permits by status
- Calculate active permits
- Calculate expiring soon permits
- Calculate expired permits
- Show role-aware dashboard summary
- Add simple recent permits section if minimal
- Keep dashboard responsive

## Out of Scope

Do not implement:

- Physical status update to `EXPIRED`
- Scheduled jobs
- Cloud Functions
- Permit close action
- Permit extension
- Advanced analytics
- Charts
- Reports
- Export
- PDF
- Activity log screen
- Complex filtering
- Full Firestore security hardening
- Extra dependencies

## Firestore Collections Used

Use existing collection:

```text
permits
````

Do not create new collections in this slice.

## Dashboard Route

Use existing route:

```text
/dashboard
```

Allowed roles:

```text
ADMIN
HSE_MANAGER
CONSTRUCTION_MANAGER
SITE_USER
```

## Dashboard Cards

Show these cards where relevant:

```text
Active Permits
Pending HSE Approval
Pending Construction Manager Approval
Expiring Soon
Expired
Rejected
```

Optional if simple:

```text
Total Permits
Approved Permits
```

## Role-Based Dashboard Behavior

Keep this simple.

### ADMIN

Can see all permit counts.

### HSE_MANAGER

Focus on:

```text
Pending HSE Approval
Approved / Active permits
Expiring Soon
Expired
Rejected
```

### CONSTRUCTION_MANAGER

Focus on:

```text
Pending Construction Manager Approval
Approved / Active permits
Expiring Soon
Expired
Rejected
```

### SITE_USER

Focus on own permits only:

```text
Own submitted permits
Own approved permits
Own rejected permits
Own expired permits
```

For `SITE_USER`, only count permits where:

```text
requestedByUserId == currentFirebaseUser.uid
```

## Permit Status Count Rules

Count direct statuses:

```text
Pending HSE Approval = status == SUBMITTED
Pending Construction Manager Approval = status == HSE_APPROVED
Rejected = status == REJECTED
Closed = status == CLOSED, if shown
```

## Expiry Calculation Rules

Use current browser time.

```text
Active = status == APPROVED and current time < expiryTime

Expiring Soon = status == APPROVED
and current time < expiryTime
and remaining time <= 2 hours

Expired = status == APPROVED
and current time >= expiryTime
```

Do not update Firestore status to `EXPIRED` in this slice.

Display expired visually even if Firestore status remains:

```text
APPROVED
```

## Recent Permits Section

If simple, show a small recent permits section.

Fields:

```text
Permit number
Permit type
Location
Status
Expiry state
View action
```

Limit to latest few permits, for example:

```text
5 latest permits
```

Do not build complex tables or filters.

## Dashboard Service Requirements

Extend existing permit service or create a small dashboard helper.

Possible methods:

```ts
getDashboardPermitsForCurrentUser()
calculateDashboardSummary(permits)
getExpiryState(permit)
```

Keep calculations simple and readable.

Do not scatter dashboard calculation logic across many components.

## Expiry Helper

Use a helper function if useful:

```ts
getExpiryState(permit): 'NOT_ACTIVE' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'
```

Expected behavior:

```text
SUBMITTED → NOT_ACTIVE
HSE_APPROVED → NOT_ACTIVE
REJECTED → NOT_ACTIVE
CLOSED → NOT_ACTIVE
APPROVED + not expired → ACTIVE
APPROVED + <= 2 hours remaining → EXPIRING_SOON
APPROVED + expired → EXPIRED
```

## UI Requirements

Dashboard should be simple and responsive.

Requirements:

* Page title: `Dashboard`
* Summary cards
* Clear labels
* Clear numbers
* Loading state
* Empty state
* Error state
* Mobile-friendly layout
* No horizontal scrolling
* Simple recent permits section if implemented

Do not add charts unless already trivial and dependency-free.

## Empty State

If no permits exist, show:

```text
No permits found yet.
```

For `SITE_USER`, optionally show:

```text
Create your first permit.
```

## Temporary Firestore Access Note

This slice only reads permits.

Do not implement final production security rules in code unless the project already has a Firebase rules file.

For testing, Firebase Console rules should already allow active users to read permits from previous slices.

Final hardening belongs to Slice 13.

## Acceptance Criteria

Manual verification:

1. Login as `SITE_USER`.
2. Create a permit.
3. Open `/dashboard`.
4. Dashboard shows the site user's permit counts.
5. Login as `HSE_MANAGER`.
6. Dashboard shows pending HSE approvals.
7. Approve a permit as HSE.
8. Login as `CONSTRUCTION_MANAGER`.
9. Dashboard shows pending Construction Manager approvals.
10. Approve a permit as Construction Manager.
11. Dashboard shows approved/active permit count.
12. Create or edit test data with expiry time within 2 hours.
13. Dashboard shows permit as expiring soon.
14. Create or edit test data with expiry time in the past.
15. Dashboard shows permit as expired.
16. Firestore permit status is not physically changed to `EXPIRED`.
17. Login as `ADMIN`.
18. Admin sees overall permit counts.
19. No approval actions are added in dashboard.
20. No PDF/export is implemented.
21. No charts or reports are implemented.

## Codex Boundary

Implement this slice only.

Do not implement:

* Permit expiry background update
* Cloud Functions
* Permit extension
* Permit close
* Advanced analytics
* Charts
* Reports
* PDF/export
* Activity log screen
* Full security rules
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
* Existing permit list/details still work.
* Existing HSE approval still works.
* Existing CM approval still works.
* Dashboard loads permits correctly.
* Dashboard counts are role-aware.
* Expiry state is calculated correctly.
* Firestore status is not automatically changed to `EXPIRED`.
* Mobile layout has no horizontal scrolling.
* No future-slice features were implemented.
* No unnecessary dependencies were added.

```
```
