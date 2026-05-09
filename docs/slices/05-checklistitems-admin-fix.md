Fix Slice 5 navigation access issue only.

Current issue:
- HSE_MANAGER is allowed to access /admin/checklist-items directly.
- But HSE_MANAGER cannot access /admin because /admin is ADMIN-only.
- This makes the Checklist Items page hidden from HSE navigation.

Required behavior:
- ADMIN can access /admin and /admin/permit-types and /admin/checklist-items.
- HSE_MANAGER can access /admin/checklist-items.
- HSE_MANAGER should not access /admin or /admin/permit-types.
- SITE_USER should not access admin/checklist pages.

Fix options:
Preferred:
- Add a direct navigation item called "Checklist Items" visible to ADMIN and HSE_MANAGER.
- Link it directly to /admin/checklist-items.
- Keep /admin itself ADMIN-only.

Do not:
- Open /admin to HSE_MANAGER.
- Give HSE_MANAGER access to permit type management.
- Add new roles.
- Add new features.
- Refactor unrelated routes.
- Implement future slices.

Before changing files:
- Explain planned changes briefly.

After changing files:
- Summarize exactly what changed.
- Explain why this fix is minimal.
- Run npm run build.