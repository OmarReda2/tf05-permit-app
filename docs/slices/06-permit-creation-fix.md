Fix Slice 6 permit creation selection bug only.

Current issue:
- Permit types appear in the New Permit page dropdown.
- After selecting a permit type, checklist items do not load.
- On submit, validation says "permit type is not selected" even though the UI shows a selected permit type.

Expected behavior:
- Selecting a permit type must store its Firestore document ID in the form as permitTypeId.
- Checklist items must load using the selected permitTypeId.
- Submit validation must recognize the selected permit type.
- Default risk level and default duration should apply from the selected permit type.
- Permit creation should use permitTypeId and permitTypeNameSnapshot correctly.

Inspect:
- Permit type service/model
- Checklist item service/query
- Permit creation component/form
- Permit creation template select binding

Likely cause to check:
- Firestore documents may be displayed without mapping doc.id into the PermitType model.
- The dropdown may be binding to an undefined `id`.
- The form control may not be patched when permit type changes.
- The checklist query may be filtering by the wrong field or wrong id value.

Requirements:
- Map Firestore document ID into permitType.id.
- Ensure the permit type select value is the permitType.id.
- Ensure form control `permitTypeId` is updated on selection.
- Ensure selected permit type object can be found from the selected id.
- Ensure checklist query uses `where('permitTypeId', '==', selectedPermitTypeId)`.
- Ensure checklist items created in Slice 5 and loaded in Slice 6 use the same permitTypeId value.
- Keep the fix minimal.

Do not:
- Rewrite the permit creation flow.
- Add future permit list/details.
- Add approval logic.
- Add dependencies.
- Change unrelated auth/role/admin code.
- Change Firestore rules unless there is a clear permission error.

After fixing:
- Explain the exact root cause.
- Summarize changed files.
- Run npm run build.