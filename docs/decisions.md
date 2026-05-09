# TF-05 Permit App — Technical Decisions

## Decision 1 — Build as Web App
We will build a responsive Angular web app instead of continuing with Android WebView.

Reason:
The app must work on mobile and desktop.

## Decision 2 — Use Firebase
We will use Firebase Auth, Firestore, and Firebase Hosting for MVP.

Reason:
It reduces backend complexity and is suitable for a small MVP.

## Decision 3 — Use Firebase SDK Directly
We will not use @angular/fire for now.

Reason:
The current Angular version has a peer dependency conflict with the available AngularFire version.

## Decision 4 — Build Slice by Slice
We will implement one small working slice at a time.

Reason:
This keeps Codex controlled and avoids overengineering.

## Decision 5 — Fixed Approval Flow
The approval flow is fixed:
Requester → HSE Manager → Construction Manager.

Reason:
A workflow engine is not needed for MVP.