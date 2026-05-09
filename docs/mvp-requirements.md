# TF-05 Safety Permit App — MVP Requirements

## Product Summary

TF-05 Safety Permit App is a responsive Permit-to-Work web app for construction site safety permits.

The app answers:
"Is this work safe and officially approved to start?"

Core flow:
Requester creates permit → completes checklist → submits to HSE → HSE approves/rejects → Construction Manager approves/rejects → permit becomes active → expiry is tracked → permit can be printed/exported.

## Target Stack

- Angular responsive web app / PWA
- Firebase SDK directly
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

Do not continue Android WebView as the main product direction.

## MVP Includes

- Real user login
- Role-based access
- Dynamic permit types
- Dynamic checklist items
- Default/max expiry duration per permit type
- Permit creation
- Checklist completion
- HSE approval
- Construction Manager approval
- Rejection with reason
- Permit status tracking
- Expiry tracking
- Permit details page
- Activity log
- Print/PDF export
- Responsive mobile/tablet/desktop UI

## MVP Excludes

Do not build:
- Workflow engine
- Dynamic approval flow builder
- Complex conditional checklist logic
- GPS tracking
- QR scanning
- Photo evidence
- Push notifications
- Advanced analytics
- Complex reports
- Native Android/iOS app
- Full offline-first conflict handling
- External integrations

## Roles

ADMIN:
- Manage users
- Manage permit types
- Manage checklist items
- Manage expiry rules
- View all permits

HSE_MANAGER:
- View submitted permits
- Approve/reject submitted permits
- Optionally manage checklist templates

CONSTRUCTION_MANAGER:
- View HSE-approved permits
- Final approve/reject permits
- View active permits

SITE_USER:
- Create permits
- Submit permits
- View own/relevant permits
- Cannot approve permits

## Statuses

Use only:

- DRAFT
- SUBMITTED
- HSE_APPROVED
- APPROVED
- REJECTED
- EXPIRED
- CLOSED

Status flow:

DRAFT → SUBMITTED → HSE_APPROVED → APPROVED → EXPIRED

Any approval stage can become REJECTED.

Approved permit can become CLOSED.

For MVP, EXPIRED may be calculated from expiryTime in the UI instead of physically updating status immediately.

## Main Firestore Collections

- users
- permitTypes
- checklistItems
- permits
- permitChecklistResponses
- permitEvents

## Important Data Rules

- Store permitTypeNameSnapshot on the permit.
- Snapshot checklist item text into permitChecklistResponses.
- Do not make old permits depend on live checklist configuration.
- Permit events should be append-only.
- Rejection reason is required.
- HSE can approve only SUBMITTED permits.
- Construction Manager can approve only HSE_APPROVED permits.
- Site users cannot approve permits.
- Frontend role checks are not enough; Firestore rules must protect data later.

## UI Rules

- Mobile responsiveness is mandatory.
- Avoid wide tables on mobile.
- Use cards on mobile.
- Use clear status badges.
- Use simple navigation.
- Desktop can use sidebar.
- Mobile can use bottom navigation.
- Do not add search/filter/dashboard complexity before real data exists.

## First Build Priority

Build slice by slice:

1. App shell
2. Auth
3. User profile and roles
4. Permit types admin
5. Checklist admin
6. Permit creation
7. Permit list/details
8. HSE approval
9. CM approval
10. Dashboard/expiry
11. Activity log
12. Print/PDF
13. Security rules