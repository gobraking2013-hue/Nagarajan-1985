# Publish KPI Serverless - README

This branch adds a serverless publish endpoint and client integration so the Admin can upload an Excel and one-click Publish to make data live for all employees.

Files added
- functions/publish-kpi/netlify_publish_kpi.js  (Netlify-style function)
- admin/publish-client.js  (front-end helper for admin page)
- public/refresh-client.html  (snippet to include in public report for live refresh)

How it works
1. Admin uploads/parses Excel in the admin UI (existing code).
2. Admin clicks "Publish" which calls publishLive(parsedData) in admin/publish-client.js. That POSTs parsed JSON to the serverless endpoint.
3. Serverless function (using GH_PAT in its environment) commits/updates kpi-data.json in the repository.
4. Employee-facing page fetches https://raw.githubusercontent.com/.../kpi-data.json?t=timestamp and re-renders.

Deployment (Netlify example)
1. Create a GitHub Personal Access Token (PAT) with repo:contents scope only.
2. On Netlify, add site and connect to this repo (or deploy with Netlify CLI).
3. In Netlify Site settings > Build & deploy > Environment > Environment variables, add:
   - GH_PAT = <your token>
   - ADMIN_SECRET = <strong secret used by admin client>
   - REPO_BRANCH = main (or whatever branch GitHub Pages uses)
4. Netlify functions live at: /.netlify/functions/publish-kpi
5. In the admin UI, set window.PUBLISH_ENDPOINT = '/.netlify/functions/publish-kpi' or leave as default. Provide ADMIN_SECRET to the admin UI (do not embed GH_PAT anywhere).

Vercel/AWS notes
- For Vercel, convert the function into api/publish-kpi.js (exports default) and deploy; set GH_PAT and ADMIN_SECRET in Vercel Environment variables.
- For AWS Lambda + API Gateway, pack this handler behind a JSON API and set environment variables in Lambda. You'll need a small wrapper to map event fields.

Security
- Never store GH_PAT in client-side code.
- Use ADMIN_SECRET and HTTPS.
- Restrict PAT to repo contents only and consider a machine user.

Post-deploy test
1. Deploy function and set env vars.
2. In admin UI, parse Excel and call publishLive(parsedData) — ensure you pass X-Admin-Secret or set window.ADMIN_SECRET.
3. Check repo: kpi-data.json should be created/updated.
4. On the public page, click "Refresh Live" button — data should refresh.

Optional improvements
- Add validation for parsedData schema in the server function.
- Return the new file commit URL in the response so the admin can view the commit.
- Implement an Admin login flow and exchange for a short-lived token rather than using ADMIN_SECRET.

