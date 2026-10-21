# Cubo's Math Lab

Grade 5 math practice that follows the Illustrative Mathematics unit order. It has interactive lessons, a 5-level test ladder per unit with fresh questions on every attempt, and a progress report for grown-ups.

Plain HTML, CSS and JavaScript. No dependencies, no build tools besides Node.

## Try it locally

```sh
node scripts/build-static.mjs            # builds dist/ (no password)
python3 -m http.server -d dist 8000      # open http://localhost:8000
```

## Publish with a password (GitHub Pages)

The website is encrypted with a password. Only the encrypted file is published, so anyone who finds the link sees a password box and nothing else.

1. Build the protected page. You'll be asked to choose a password (10+ characters):
   ```sh
   node scripts/build-static.mjs --encrypt
   ```
   This writes `docs/index.html`.
2. Commit and push, including `docs/`.
3. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/docs`**.
4. The site appears at `https://<your-username>.github.io/<repo-name>/`.

**After changing the app,** run step 1 again with the same password, then commit and push. Devices that chose "Remember on this device" stay unlocked.

**To change the password,** run step 1 with a new one. Every device will ask for the new password.

**To lock a device,** open Grown-ups → Settings → "Forget the password on this device".

## Notes

- If this repository is public, the source code is visible on GitHub. It contains lessons and questions only. Your child's progress and name are never in the repository: they're saved in the browser on each device.
- Progress is per browser. Using another device or clearing browser data starts fresh.
- "Explain it another way" (Claude explanations) and cross-device sync only work in the Claude artifact version.
