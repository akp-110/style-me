# Branded auth email templates

HTML templates for Supabase auth emails, styled to match the app (paper
`#FAF7F2`, ink `#111111`, acid `#D7FD35`). Email clients can't load web fonts
or external CSS, so these use inline styles and web-safe stacks (Arial Black ≈
Archivo, Georgia ≈ Playfair Display).

## How to apply (dashboard only — there's no API for this)

Supabase Dashboard → **Authentication → Email Templates**, then for each:

| Template in dashboard | File to paste |
|---|---|
| Confirm signup | `confirm-signup.html` |
| Reset password | `reset-password.html` |

Paste the file's full contents into the "Message body" field (source mode) and
save. The `{{ .ConfirmationURL }}` placeholder is filled in by Supabase.

## Before production

In **Authentication → URL Configuration**, set the Site URL to the production
domain and add `http://localhost:5173` to additional redirect URLs — the
password-reset flow redirects to `<origin>/reset-password` and Supabase only
honours allowlisted origins.
