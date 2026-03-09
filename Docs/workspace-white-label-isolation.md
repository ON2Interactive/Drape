# Drape Workspace Isolation

The Drape workspace has now been isolated and backed up for future white-label reuse.

## Snapshot Location

- [workspace-isolated-20260308-083040](/Users/kistudioultra/Documents/Clients/Drape/backups/workspace-isolated-20260308-083040)

## Current Workspace Boundary

The reusable workspace surface is centered on:

- [App.workspace.jsx](/Users/kistudioultra/Documents/Clients/Drape/src/App.workspace.jsx)

That entry point pulls in the following reusable functional areas:

- onboarding
- preview canvas
- collection panel
- upload/profile modals
- favorites
- weekly plan
- video generation modal
- stylist modal
- Gemini try-on and remix services
- video persistence services

## Why This Matters

This makes it practical to repurpose Drape's workspace as a branded component for other companies without coupling those integrations to Drape's marketing pages or landing-page experiments.

## Recommended White-Label Path

1. Treat `App.workspace.jsx` as the product shell.
2. Move all brand-specific copy and assets behind a theme/config layer.
3. Replace any client-side fallback API keys with server-only configuration.
4. Keep landing pages and common marketing pages outside the workspace package boundary.

## Immediate Outcome

You now have a recoverable snapshot of the workspace code and a clear seam for extracting it into a white-label package later.
