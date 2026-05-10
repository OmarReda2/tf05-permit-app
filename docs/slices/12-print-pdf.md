````md
# Slice 12 — Print / PDF Export

## Purpose

Add printable permit summary output.

This slice allows users to open a permit and generate a clean printable view using the browser print function.

For MVP, use frontend print-to-PDF through:

```ts
window.print()
````

Do not implement server-side PDF generation.

## Current Context

Completed:

* Slice 1: App shell and navigation
* Slice 2: Firebase authentication
* Slice 3: Firestore user profiles and role guards
* Slice 4: Permit types admin
* Slice 5: Checklist items admin
* Slice 6: Permit creation
* Slice 7: Permit list and details
* Slice 8: HSE approval
* Slice 9: Construction Manager approval
* Slice 10: Dashboard and expiry
* Slice 11: Activity log

Current project uses:

* Angular
* Firebase SDK directly
* Firebase Authentication
* Firestore
* SCSS

Do not use `@angular/fire`.

## Scope

Implement only:

* Printable permit summary view
* Print action from permit details page
* Clean print-specific layout
* Include permit core details
* Include checklist responses
* Include approval information
* Include permit events summary if simple
* Include generated date/time
* Optional permit event `PDF_EXPORTED` only if simple and already aligned with existing event service

## Out of Scope

Do not implement:

* Server-side PDF generation
* Cloud Functions
* PDF storage
* Email PDF
* Downloaded file generation with external libraries
* QR code
* Digital signature
* Custom PDF templates engine
* Advanced report builder
* Bulk export
* Permit editing
* Permit close
* Permit extension
* Full Firestore security hardening
* Extra dependencies

## Route / Entry Point

Use existing permit details route:

```text
/permits/:id
```

Add a simple action button:

```text
Print / Save PDF
```

The button should open or display a print-friendly view and call:

```ts
window.print()
```

Preferred simple approach:

* Reuse permit details data.
* Add print-only styling.
* Hide navigation/actions during print.
* Print the current permit details page in a clean format.

Alternative acceptable approach:

* Add a dedicated route:

```text
/permits/:id/print
```

Only use this if it keeps the implementation cleaner.

## Access Rules

Allowed roles:

```text
ADMIN
HSE_MANAGER
CONSTRUCTION_MANAGER
SITE_USER
```

Access should follow the same visibility rules already used for permit details.

Do not expose permits to users who cannot already view the permit details.

## Printable Content

The printable permit summary should include:

```text
Project name
Permit number
Permit type
Status
Expiry state
Requester
Requester role
Contractor / trade
Work location
Scope of work
Hazards
Equipment / plant
Number of workers
Risk level
Start time
Duration hours
Expiry time
Checklist responses
HSE approval information
Construction Manager approval information
Rejection reason if rejected
Generated date/time
```

Project name:

```text
TF-05-C1 — Sheikh Zayed Road Storm Water Drainage
```

App name:

```text
TF-05 Safety Permit App
```

## Checklist Section

Use existing `permitChecklistResponses`.

Show:

```text
Checked / unchecked
Item text snapshot
Required / optional
```

Important:

Use:

```text
itemTextSnapshot
```

Do not read live checklist item text from checklist configuration.

## Approval Section

Show HSE approval:

```text
HSE Approved By
HSE Approved At
```

Show Construction Manager approval:

```text
Construction Manager Approved By
Construction Manager Approved At
```

If not approved yet, show:

```text
Not approved yet
```

If rejected, show:

```text
Rejected
Rejection reason
```

## Event Logging

Optional but useful if simple:

When user clicks print/export, create permit event:

```ts
action: 'PDF_EXPORTED';
permitId: string;
actorUserId: currentFirebaseUser.uid;
actorName: currentUser.displayName;
actorRole: currentUser.role;
comment?: 'Permit printed/exported';
createdAt: serverTimestamp();
```

If this complicates the slice, skip event creation.

Do not block printing if event creation fails.

## UI Requirements

Permit details page:

* Add clear `Print / Save PDF` button.
* Button should be visible only when permit data is loaded.
* Button should not appear in printed output.
* Navigation/sidebar/bottom nav should not appear in printed output.
* Layout should print cleanly on A4 if possible.
* Avoid dark backgrounds in print.
* Avoid unnecessary decorative UI in print.

Print layout should be:

* Clean
* Simple
* Readable
* Sectioned
* No horizontal scrolling
* No mobile navigation
* No action buttons

## Print CSS Requirements

Add print-specific CSS using:

```scss
@media print {
  ...
}
```

Print mode should hide:

```text
Sidebar
Mobile bottom navigation
Header navigation
Buttons
Filters
Non-print actions
```

Print mode should show:

```text
Permit summary
Checklist responses
Approval details
Generated timestamp
```

Do not redesign the full app.

## Permit Status and Expiry

Use the same status label and expiry state logic from Slice 7 / Slice 10.

Do not physically update permit status to `EXPIRED`.

If permit is approved but expired by time calculation, print should show:

```text
Expired
```

as expiry state, while status may still be:

```text
Approved
```

## Acceptance Criteria

Manual verification:

1. Login as `SITE_USER`.
2. Open a permit the user created.
3. Click `Print / Save PDF`.
4. Browser print dialog opens.
5. Printed preview contains permit core details.
6. Printed preview contains checklist responses.
7. Printed preview uses checklist snapshot text.
8. Printed preview contains HSE approval information if available.
9. Printed preview contains CM approval information if available.
10. Printed preview contains rejection reason if rejected.
11. Printed preview contains generated date/time.
12. Navigation is hidden in print preview.
13. Buttons are hidden in print preview.
14. Layout is readable on desktop print preview.
15. Login as `HSE_MANAGER`.
16. HSE can print permits they can view.
17. Login as `CONSTRUCTION_MANAGER`.
18. CM can print permits they can view.
19. Login as `ADMIN`.
20. Admin can print permits they can view.
21. No server-side PDF generation is implemented.
22. No external PDF dependency is added.
23. No PDF storage is implemented.

## Codex Boundary

Implement this slice only.

Do not implement:

* Server PDF
* Cloud Functions
* PDF storage
* Email sending
* QR codes
* Digital signature
* Reports
* Bulk export
* Permit close
* Permit extension
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
* Existing permit list/details still work.
* Print button works from permit details.
* Browser print dialog opens.
* Print view hides navigation and buttons.
* Print view includes permit details.
* Print view includes checklist snapshot responses.
* Print view includes approval information.
* Print view includes generated timestamp.
* No external PDF library was added.
* No future-slice features were implemented.
* No unnecessary dependencies were added.

```
```
