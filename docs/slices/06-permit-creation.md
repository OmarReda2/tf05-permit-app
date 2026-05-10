````md
# Slice 6 — Permit Creation

## Purpose

Add the permit creation flow for site users.

This slice allows an authorized requester to create a new Permit-to-Work request by selecting a permit type, entering work details, completing required checklist items, and submitting the permit for HSE approval.

This is the first slice that creates real permit records.

## Current Context

Completed:

- Slice 1: App shell and navigation
- Slice 2: Firebase authentication
- Slice 3: Firestore user profiles and role guards
- Slice 4: Permit types admin
- Slice 5: Checklist items admin

Current project uses:

- Angular
- Firebase SDK directly
- Firebase Authentication
- Firestore
- SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

- Permit model
- Permit checklist response model
- Permit event model if needed for creation/submission event
- Permit service
- Create permit page
- Permit type selection
- Load active permit types
- Load active checklist items for selected permit type
- Permit basic information form
- Permit work details form
- Checklist completion
- Review/submit step or simple submit section
- Validate required fields
- Validate duration against selected permit type max duration
- Validate required checklist items
- Create permit record in Firestore
- Create checklist response snapshot records
- Create permit event record for submission
- Submit permit with status `SUBMITTED`
- Allow only `SITE_USER` to access `/permits/new`

## Out of Scope

Do not implement:

- Permit list page
- Permit details page
- HSE approval
- Construction Manager approval
- Permit editing after submission
- Save draft
- Re-submit rejected permit
- Permit expiry dashboard
- Activity log screen
- PDF/export
- User management
- Permit type management changes
- Checklist item management changes
- Complex conditional checklist logic
- Evidence/photo upload
- GPS
- QR code
- Full Firestore security hardening
- Extra dependencies

## Firestore Collections

Use existing collections:

```text
permitTypes
checklistItems
````

Add new collections:

```text
permits
permitChecklistResponses
permitEvents
```

## Permit Document

Collection:

```text
permits
```

Document fields:

```ts
id?: string;
permitNumber: string;
permitTypeId: string;
permitTypeNameSnapshot: string;
requestedByUserId: string;
requestedByName: string;
requesterRole: 'SITE_USER';
contractorOrTrade: string;
workLocation: string;
scopeOfWork: string;
hazards?: string;
equipment?: string;
numberOfWorkers: number;
riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
startTime: string | Date | unknown;
durationHours: number;
expiryTime: string | Date | unknown;
status: 'SUBMITTED';
hseApprovedBy?: string | null;
hseApprovedAt?: unknown | null;
cmApprovedBy?: string | null;
cmApprovedAt?: unknown | null;
rejectionReason?: string | null;
createdAt?: unknown;
updatedAt?: unknown;
```

## Permit Checklist Response Document

Collection:

```text
permitChecklistResponses
```

Document fields:

```ts
id?: string;
permitId: string;
checklistItemId: string;
itemTextSnapshot: string;
required: boolean;
checked: boolean;
createdAt?: unknown;
updatedAt?: unknown;
```

Important:

Checklist item text must be snapshotted when the permit is submitted.

Do not make submitted permits depend on live checklist item text.

## Permit Event Document

Collection:

```text
permitEvents
```

Document fields:

```ts
id?: string;
permitId: string;
action: 'PERMIT_SUBMITTED';
actorUserId: string;
actorName: string;
actorRole: 'SITE_USER';
comment?: string;
createdAt?: unknown;
```

## Permit Number

Generate a simple permit number.

Recommended MVP format:

```text
PTW-YYYYMMDD-HHMMSS
```

Example:

```text
PTW-20260509-153022
```

Do not build a complex sequence generator in this slice.

## Route

Use existing route:

```text
/permits/new
```

Allowed role:

```text
SITE_USER
```

Do not allow:

```text
ADMIN
HSE_MANAGER
CONSTRUCTION_MANAGER
```

to create permits in this slice.

## Form Sections

The permit creation page should be simple and mobile-friendly.

Use either:

* step-based sections, or
* one page with clear grouped sections

Do not add a complex stepper dependency.

## Section 1 — Basic Information

Fields:

```text
Permit type
Work location
Start date/time
Duration hours
Risk level
```

Rules:

* Permit type is required.
* Work location is required.
* Start date/time is required.
* Duration is required.
* Duration must be greater than 0.
* Duration cannot exceed selected permit type `maxDurationHours`.
* Risk level is required.
* When permit type is selected:

  * default risk level is applied
  * default duration is applied
  * max duration is shown
  * checklist items are loaded

## Section 2 — Work Details

Fields:

```text
Contractor / trade
Scope of work
Hazards
Equipment / plant
Number of workers
```

Rules:

* Contractor/trade is required.
* Scope of work is required.
* Number of workers is required.
* Number of workers must be greater than 0.
* Hazards should be required when risk level is `MEDIUM` or `HIGH`.

## Section 3 — Checklist

Load active checklist items for the selected permit type.

Show:

```text
Checkbox
Checklist item text
Required/optional indicator
```

Rules:

* Required checklist items must be checked before submission.
* Optional checklist items may remain unchecked.
* Checklist item text must be copied into `permitChecklistResponses`.
* Inactive checklist items must not be included for new permits.

## Section 4 — Review and Submit

Show a simple summary before submission:

```text
Permit type
Work location
Start time
Duration
Expiry time
Risk level
Scope of work
Checklist completion
```

Actions:

```text
Submit for HSE Approval
Cancel / Back
```

For MVP, do not implement Save Draft.

## Expiry Calculation

Calculate:

```text
expiryTime = startTime + durationHours
```

Example:

```text
startTime = 2026-05-09 08:00
durationHours = 4
expiryTime = 2026-05-09 12:00
```

Use a simple date calculation.

Do not add a date library unless already available.

## Submission Behavior

When user submits a valid permit:

1. Create a document in `permits`.
2. Set status to:

```text
SUBMITTED
```

3. Store `permitTypeNameSnapshot`.
4. Store requester information from current user profile.
5. Store calculated `expiryTime`.
6. Create checklist response records in `permitChecklistResponses`.
7. Create event in `permitEvents` with action:

```text
PERMIT_SUBMITTED
```

8. Show success message.
9. Redirect to `/permits` or `/dashboard`.

If `/permits` is only a placeholder, redirecting there is still acceptable.

## Permit Service Requirements

Create a simple service that supports:

```ts
createPermit(input)
```

The service should:

* create the permit
* create checklist response snapshot records
* create permit event
* use Firestore SDK directly
* keep write logic centralized enough to avoid scattered Firestore writes in the component

Expected Firebase functions may include:

```ts
getFirestore
collection
doc
addDoc
writeBatch
serverTimestamp
```

Use a batch if practical.

## Validation

Block submission when:

* Permit type is missing
* Work location is missing
* Start time is missing
* Duration is missing
* Duration is less than or equal to 0
* Duration exceeds selected permit type max duration
* Risk level is missing
* Contractor/trade is missing
* Scope of work is missing
* Number of workers is missing
* Number of workers is less than or equal to 0
* Hazards is missing for `MEDIUM` or `HIGH` risk
* Any required checklist item is unchecked

Show clear validation messages.

Examples:

```text
Permit type is required.
```

```text
Duration cannot exceed the selected permit type maximum duration.
```

```text
Required checklist items must be completed before submission.
```

## Temporary Firestore Access Note

This slice needs `SITE_USER` to create:

```text
permits
permitChecklistResponses
permitEvents
```

Do not implement final production security rules in code unless the project already has a Firebase rules file.

For testing, Firebase Console rules may need to allow:

* active authenticated users to read active permit types
* active authenticated users to read active checklist items
* `SITE_USER` to create permits
* `SITE_USER` to create checklist responses for their submitted permit
* `SITE_USER` to create permit events for their submitted permit

Final hardening belongs to Slice 13.

## UI Requirements

Keep UI simple and usable on mobile.

Requirements:

* Clear page title: `New Permit`
* Clear grouped sections
* Large touch-friendly inputs/buttons
* No horizontal scrolling
* Clear validation messages
* Clear loading state during submit
* Clear success/error message after submit

Do not build a complex wizard if the current UI structure does not need it.

## Acceptance Criteria

Manual verification:

1. Login as `SITE_USER`.
2. Open `/permits/new`.
3. Select an active permit type.
4. App loads active checklist items for that permit type.
5. Default risk level is applied from permit type.
6. Default duration is applied from permit type.
7. Max duration is shown or enforced.
8. Fill required basic information.
9. Fill required work details.
10. Check all required checklist items.
11. Submit permit.
12. Permit is created in Firestore `permits`.
13. Permit status is `SUBMITTED`.
14. Permit has `permitTypeNameSnapshot`.
15. Permit has requester user ID and requester name.
16. Permit has calculated `expiryTime`.
17. Checklist responses are created in `permitChecklistResponses`.
18. Checklist responses contain `itemTextSnapshot`.
19. Permit event is created in `permitEvents`.
20. Invalid duration is blocked.
21. Missing required checklist item is blocked.
22. Missing required fields are blocked.
23. Login as `ADMIN`.
24. ADMIN cannot access `/permits/new` unless current project intentionally allows it from previous route behavior.
25. Login as `HSE_MANAGER`.
26. HSE Manager cannot access `/permits/new`.
27. No approval feature exists yet.
28. No permit details page exists yet.

## Codex Boundary

Implement this slice only.

Do not implement:

* Permit list functionality
* Permit details
* HSE approval
* Construction Manager approval
* Dashboard stats
* Activity log screen
* PDF/export
* Save draft
* Edit permit
* Delete permit
* Resubmit rejected permit
* Full Firestore security rules
* Complex workflow logic

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
* Existing permit type admin still works.
* Existing checklist admin still works.
* Only `SITE_USER` can access permit creation.
* Permit creation uses active permit types.
* Checklist loading uses active checklist items.
* Required checklist validation works.
* Permit type name is snapshotted.
* Checklist item text is snapshotted.
* Permit event is created.
* No future-slice features were implemented.
* No unnecessary dependencies were added.

```
```
