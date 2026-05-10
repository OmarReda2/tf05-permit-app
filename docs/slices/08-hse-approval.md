````md
# Slice 8 — HSE Approval

## Purpose

Add the HSE approval/rejection flow.

This slice allows `HSE_MANAGER` users to review submitted permits and either approve them for Construction Manager review or reject them with a reason.

This is the first approval slice.

## Current Context

Completed:

- Slice 1: App shell and navigation
- Slice 2: Firebase authentication
- Slice 3: Firestore user profiles and role guards
- Slice 4: Permit types admin
- Slice 5: Checklist items admin
- Slice 6: Permit creation
- Slice 7: Permit list and details

Current project uses:

- Angular
- Firebase SDK directly
- Firebase Authentication
- Firestore
- SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

- HSE approval queue
- Show submitted permits to `HSE_MANAGER`
- HSE approve action
- HSE reject action
- Rejection reason validation
- Update permit status from `SUBMITTED` to `HSE_APPROVED`
- Update permit status from `SUBMITTED` to `REJECTED`
- Store HSE approval fields
- Store rejection reason when rejected
- Create permit event for HSE approval/rejection
- Show HSE actions on permit details page only when user is `HSE_MANAGER` and permit status is `SUBMITTED`

## Out of Scope

Do not implement:

- Construction Manager approval
- Final approval
- Permit expiry status update
- Permit close action
- Permit extension
- Permit editing
- Permit delete
- Resubmission of rejected permit
- Dashboard calculations
- PDF/export
- Activity log screen
- Full Firestore security hardening
- Extra dependencies

## Firestore Collections Used

Use existing collections:

```text
permits
permitEvents
permitChecklistResponses
users
````

Do not create new collections in this slice.

## Permit Status Rules

HSE can approve only permits with status:

```text
SUBMITTED
```

When HSE approves:

```text
SUBMITTED → HSE_APPROVED
```

When HSE rejects:

```text
SUBMITTED → REJECTED
```

Do not allow HSE to approve/reject:

```text
DRAFT
HSE_APPROVED
APPROVED
REJECTED
EXPIRED
CLOSED
```

## Permit Fields to Update

When HSE approves, update the permit:

```ts
status: 'HSE_APPROVED';
hseApprovedBy: currentUser.displayName;
hseApprovedAt: serverTimestamp();
updatedAt: serverTimestamp();
```

When HSE rejects, update the permit:

```ts
status: 'REJECTED';
hseApprovedBy: currentUser.displayName;
hseApprovedAt: serverTimestamp();
rejectionReason: string;
updatedAt: serverTimestamp();
```

## Permit Events

When HSE approves, create event:

```ts
action: 'HSE_APPROVED';
permitId: string;
actorUserId: currentFirebaseUser.uid;
actorName: currentUser.displayName;
actorRole: 'HSE_MANAGER';
comment?: string;
createdAt: serverTimestamp();
```

When HSE rejects, create event:

```ts
action: 'HSE_REJECTED';
permitId: string;
actorUserId: currentFirebaseUser.uid;
actorName: currentUser.displayName;
actorRole: 'HSE_MANAGER';
comment: rejectionReason;
createdAt: serverTimestamp();
```

## Route

Use existing route:

```text
/approvals
```

Allowed role:

```text
HSE_MANAGER
```

If `CONSTRUCTION_MANAGER` already has access to `/approvals`, keep the page safe by showing only the relevant placeholder/message for Construction Manager in this slice.

Do not implement Construction Manager actions yet.

## Approval Queue Page Requirements

For `HSE_MANAGER`, `/approvals` should show:

```text
Pending HSE Approvals
```

List permits where:

```text
status == 'SUBMITTED'
```

Each item should show:

```text
Permit number
Permit type
Work location
Requester
Risk level
Start time
Expiry time
View details action
Approve action
Reject action
```

Keep the UI simple.

Mobile layout should use cards.

Desktop layout may use table/list.

## Permit Details Page Requirements

On `/permits/:id`, show HSE actions only when:

```text
currentUser.role == 'HSE_MANAGER'
permit.status == 'SUBMITTED'
```

Actions:

```text
Approve
Reject
```

Reject requires a reason.

Do not show HSE actions for other roles or other statuses.

## Rejection Reason

Rejection reason is required.

Validation:

* Cannot be empty
* Should be trimmed
* Show clear validation message

Example:

```text
Rejection reason is required.
```

## Approval Service Requirements

Extend the existing permit service or create a small approval service.

Required methods:

```ts
approveByHse(permitId: string)
rejectByHse(permitId: string, reason: string)
```

The service should:

* Verify current user role is `HSE_MANAGER`
* Verify current permit status is `SUBMITTED` before update
* Update permit document
* Create permit event
* Use Firestore SDK directly
* Use a batch or transaction if practical

Preferred:

Use Firestore transaction if available and simple, to avoid approving a permit whose status changed.

Acceptable for MVP:

Use `getDoc` check before `updateDoc` if transaction makes the implementation too large.

## Temporary Firestore Access Note

This slice needs `HSE_MANAGER` to update submitted permits and create approval/rejection events.

Do not implement final production security rules in code unless the project already has a Firebase rules file.

For testing, Firebase Console rules may need to allow:

* active users to read permits
* `HSE_MANAGER` to update permits from `SUBMITTED` to `HSE_APPROVED`
* `HSE_MANAGER` to update permits from `SUBMITTED` to `REJECTED`
* `HSE_MANAGER` to create `HSE_APPROVED` and `HSE_REJECTED` events

Final hardening belongs to Slice 13.

## UI Requirements

Approval queue:

* Page title: `Approvals`
* Section title: `Pending HSE Approvals`
* Loading state
* Empty state
* Error state
* Simple approve button
* Simple reject button
* Clear confirmation or simple action feedback
* Rejection reason input/dialog/inline field

Permit details:

* Show approve/reject actions only when allowed.
* Show success message after action if simple.
* After approve/reject, refresh displayed status or navigate back to `/approvals`.

Do not add complex modals if a simple inline rejection field is enough.

## Acceptance Criteria

Manual verification:

1. Login as `SITE_USER`.
2. Create a permit.
3. Confirm the permit status is `SUBMITTED`.
4. Login as `HSE_MANAGER`.
5. Open `/approvals`.
6. Submitted permit appears in Pending HSE Approvals.
7. Open permit details.
8. HSE approve/reject actions appear.
9. Approve the permit.
10. Permit status changes to `HSE_APPROVED`.
11. `hseApprovedBy` is saved.
12. `hseApprovedAt` is saved.
13. Permit event `HSE_APPROVED` is created.
14. Create another submitted permit.
15. Login as `HSE_MANAGER`.
16. Reject without reason.
17. App blocks rejection and shows validation.
18. Reject with reason.
19. Permit status changes to `REJECTED`.
20. Rejection reason is saved.
21. Permit event `HSE_REJECTED` is created.
22. Login as `SITE_USER`.
23. Site user cannot approve/reject.
24. Login as `ADMIN`.
25. Admin cannot approve/reject unless current design explicitly allows it.
26. No Construction Manager approval exists yet.
27. No dashboard stats are implemented.
28. No PDF/export is implemented.

## Codex Boundary

Implement this slice only.

Do not implement:

* Construction Manager approval
* Final approval
* Dashboard stats
* PDF/export
* Permit editing
* Permit delete
* Permit extension
* Permit close
* Full security rules
* Complex workflow engine

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
* HSE can see submitted permits.
* HSE can approve only `SUBMITTED` permits.
* HSE can reject only `SUBMITTED` permits.
* Rejection reason is required.
* Permit event is created for approval/rejection.
* No Construction Manager approval was implemented.
* No future-slice features were implemented.
* No unnecessary dependencies were added.

```
```
