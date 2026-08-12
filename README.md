# Recipe Site — GitHub Pages Setup

This folder is a ready-to-publish static website. Follow these one-time steps to make it live on the web, free, with no domain to decide on.

## One-time setup (about 5 minutes)

1. Go to https://github.com and create a free account (if you don't have one).
2. Click the "+" in the top right → "New repository."
   - Name it anything, e.g. `recipes` (this becomes part of your free URL, so pick something you're fine keeping — but you CAN rename it later without losing anything).
   - Set it to **Public**.
   - Do NOT initialize with a README (you already have one).
3. On the new repo's page, click "uploading an existing file" (or drag-and-drop).
4. Drag every file from this `recipe_site` folder into the upload box (index.html, all the *_Recipe.html and *_Recipe.pdf files). Commit the upload.
5. Go to the repo's **Settings** tab → **Pages** (left sidebar).
6. Under "Build and deployment," set Source to **Deploy from a branch**, Branch to **main** / **(root)**. Save.
7. Wait about a minute, then refresh — GitHub will show your live URL, something like:
   `https://<your-username>.github.io/<repo-name>/`

That's it — no domain purchase, no hosting bill, no renewal to worry about. Bookmark that URL on your phone (or "Add to Home Screen" in Safari/Chrome) and it behaves like an app icon.

## Adding new recipes later

Each time a new recipe card is made, you'll get an updated `index.html` plus the new recipe's `.html`/`.pdf` files. Repeat step 3-4 above (upload the new files — GitHub will ask if you want to overwrite `index.html`, say yes) to publish the update. If you want this automated so you never have to do this step manually, let me know once you've connected a GitHub account/connector and I can push updates for you directly.
