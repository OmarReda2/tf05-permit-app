````md
# Slice 9 — Construction Manager Approval

## Purpose

Add the Construction Manager final approval/rejection flow.

This slice allows `CONSTRUCTION_MANAGER` users to review permits already approved by HSE and either finally approve them or reject them with a reason.

After Construction Manager approval, the permit becomes fully approved.

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

Current project uses:

- Angular
- Firebase SDK directly
- Firebase Authentication
- Firestore
- SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

- Construction Manager approval queue
- Show HSE-approved permits to `CONSTRUCTION_MANAGER`
- Construction Manager approve action
- Construction Manager reject action
- Rejection reason validation
- Update permit status from `HSE_APPROVED` to `APPROVED`
- Update permit status from `HSE_APPROVED` to `REJECTED`
- Store Construction Manager approval fields
- Store rejection reason when rejected
- Create permit event for CM approval/rejection
- Show CM actions on permit details page only when user is `CONSTRUCTION_MANAGER` and permit status is `HSE_APPROVED`

## Out of Scope

Do not implement:

- HSE approval changes
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

Construction Manager can approve only permits with status:

```text
HSE_APPROVED
```

When Construction Manager approves:

```text
HSE_APPROVED → APPROVED
```

When Construction Manager rejects:

```text
HSE_APPROVED → REJECTED
```

Do not allow Construction Manager to approve/reject:

```text
DRAFT
SUBMITTED
APPROVED
REJECTED
EXPIRED
CLOSED
```

## Permit Fields to Update

When Construction Manager approves, update the permit:

```ts
status: 'APPROVED';
cmApprovedBy: currentUser.displayName;
cmApprovedAt: serverTimestamp();
updatedAt: serverTimestamp();
```

When Construction Manager rejects, update the permit:

```ts
status: 'REJECTED';
cmApprovedBy: currentUser.displayName;
cmApprovedAt: serverTimestamp();
rejectionReason: string;
updatedAt: serverTimestamp();
```

Do not overwrite HSE approval fields.

## Permit Events

When Construction Manager approves, create event:

```ts
action: 'CM_APPROVED';
permitId: string;
actorUserId: currentFirebaseUser.uid;
actorName: currentUser.displayName;
actorRole: 'CONSTRUCTION_MANAGER';
comment?: string;
createdAt: serverTimestamp();
```

When Construction Manager rejects, create event:

```ts
action: 'CM_REJECTED';
permitId: string;
actorUserId: currentFirebaseUser.uid;
actorName: currentUser.displayName;
actorRole: 'CONSTRUCTION_MANAGER';
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
CONSTRUCTION_MANAGER
```

If `/approvals` is shared with `HSE_MANAGER`, keep both flows separated by role:

* `HSE_MANAGER` sees submitted permits pending HSE approval.
* `CONSTRUCTION_MANAGER` sees HSE-approved permits pending final approval.

Do not let HSE see or perform CM approval actions.

Do not let CM see or perform HSE approval actions.

## Approval Queue Page Requirements

For `CONSTRUCTION_MANAGER`, `/approvals` should show:

```text
Pending Construction Manager Approvals
```

List permits where:

```text
status == 'HSE_APPROVED'
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
HSE approved by
View details action
Approve action
Reject action
```

Keep the UI simple.

Mobile layout should use cards.

Desktop layout may use table/list.

## Permit Details Page Requirements

On `/permits/:id`, show Construction Manager actions only when:

```text
currentUser.role == 'CONSTRUCTION_MANAGER'
permit.status == 'HSE_APPROVED'
```

Actions:

```text
Approve
Reject
```

Reject requires a reason.

Do not show CM actions for other roles or other statuses.

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

Extend the existing permit service or approval service.

Required methods:

```ts
approveByConstructionManager(permitId: string)
rejectByConstructionManager(permitId: string, reason: string)
```

The service should:

* Verify current user role is `CONSTRUCTION_MANAGER`
* Verify current permit status is `HSE_APPROVED` before update
* Update permit document
* Create permit event
* Use Firebase SDK directly
* Use a batch or transaction if practical

Preferred:

Use Firestore transaction if available and simple, to avoid approving a permit whose status changed.

Acceptable for MVP:

Use `getDoc` check before `updateDoc` if transaction makes the implementation too large.

## Temporary Firestore Access Note

This slice needs `CONSTRUCTION_MANAGER` to update HSE-approved permits and create approval/rejection events.

Do not implement final production security rules in code unless the project already has a Firebase rules file.

For testing, Firebase Console rules may need to allow:

* active users to read permits
* `CONSTRUCTION_MANAGER` to update permits from `HSE_APPROVED` to `APPROVED`
* `CONSTRUCTION_MANAGER` to update permits from `HSE_APPROVED` to `REJECTED`
* `CONSTRUCTION_MANAGER` to create `CM_APPROVED` and `CM_REJECTED` events

Final hardening belongs to Slice 13.

## UI Requirements

Approval queue:

* Page title: `Approvals`
* Section title for CM: `Pending Construction Manager Approvals`
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
3. Login as `HSE_MANAGER`.
4. Approve the permit.
5. Confirm the permit status is `HSE_APPROVED`.
6. Login as `CONSTRUCTION_MANAGER`.
7. Open `/approvals`.
8. HSE-approved permit appears in Pending Construction Manager Approvals.
9. Open permit details.
10. CM approve/reject actions appear.
11. Approve the permit.
12. Permit status changes to `APPROVED`.
13. `cmApprovedBy` is saved.
14. `cmApprovedAt` is saved.
15. Permit event `CM_APPROVED` is created.
16. Create another permit and get it HSE-approved.
17. Login as `CONSTRUCTION_MANAGER`.
18. Reject without reason.
19. App blocks rejection and shows validation.
20. Reject with reason.
21. Permit status changes to `REJECTED`.
22. Rejection reason is saved.
23. Permit event `CM_REJECTED` is created.
24. Login as `HSE_MANAGER`.
25. HSE cannot perform CM approval.
26. Login as `SITE_USER`.
27. Site user cannot approve/reject.
28. No dashboard stats are implemented.
29. No PDF/export is implemented.

## Codex Boundary

Implement this slice only.

Do not implement:

* Dashboard stats
* PDF/export
* Permit editing
* Permit delete
* Permit extension
* Permit close
* Activity log screen
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
* Existing HSE approval still works.
* CM can see HSE-approved permits.
* CM can approve only `HSE_APPROVED` permits.
* CM can reject only `HSE_APPROVED` permits.
* Rejection reason is required.
* Permit event is created for CM approval/rejection.
* No future-slice features were implemented.
* No unnecessary dependencies were added.

```
```
