# Reporting Hub setup (Google Drive)

The Reporting Hub stores every offtaker report in Google Drive and reads back the submission tracker and library from it. Until the four steps below are done, the hub runs in demo mode: the tracker and library show illustrative data and upload is disabled. Once configured, it switches to live Drive automatically. No code changes are needed to switch over.

## What you need

- A Google Shared Drive (not a personal My Drive folder). This matters: the service account has no personal Drive storage of its own, so files must live in a Shared Drive that owns the storage.
- A Google Cloud service account with the Drive API enabled.
- Access to your Netlify site settings to add environment variables.

## Step 1: Shared Drive and root folder

1. In Google Drive, create (or choose) a Shared Drive, for example "KPMD Reports".
2. Inside it, create a folder to act as the root, for example "Submissions".
3. Open that folder and copy its ID from the URL. The ID is the part after `/folders/`:
   `https://drive.google.com/drive/folders/`**`1AbCdEf...`**
4. Keep that ID for step 4 (`GDRIVE_ROOT_FOLDER_ID`).

The hub will create the folder structure under it automatically as reports are uploaded:
`Submissions / Weekly / 2026-W23 / Genco / <file>`, and the same for Monthly and Quarterly.

## Step 2: Service account

1. In the Google Cloud console, create or select a project.
2. Enable the Google Drive API for the project.
3. Create a service account, then create a JSON key for it and download the key file.
4. Note the service account email, it looks like `kpmd-hub@your-project.iam.gserviceaccount.com`.

## Step 3: Give the service account access to the Shared Drive

1. Open the Shared Drive in Google Drive.
2. Use Manage members and add the service account email as a member with the Content manager role.

This is what lets the service account create folders and upload files into the Shared Drive.

## Step 4: Netlify environment variables

The key JSON is stored base64 encoded, which avoids problems with the private-key line breaks. Encode it:

```bash
# macOS / Linux
base64 -i service-account-key.json | tr -d '\n' > sa-key-base64.txt
```

Then in Netlify, under Site configuration, Environment variables, add two variables:

| Key | Value |
| --- | --- |
| `GDRIVE_SA_KEY` | the full base64 string from `sa-key-base64.txt` |
| `GDRIVE_ROOT_FOLDER_ID` | the folder ID from step 1 |

Trigger a redeploy (Deploys, Trigger deploy). When it finishes, open the Reporting Hub. The demo banner disappears, the tracker reads live from Drive, and upload is active.

## Step 5: Netlify Identity (team sign-in)

The Reporting Hub functions are now locked: only signed-in team members can read the library or upload. Turn on Identity so the team can sign in.

1. In Netlify, open your site, then Integrations or Identity, and click Enable Identity.
2. Under Identity, Registration, set it to Invite only so only people you invite can access.
3. Invite your team members by email. They accept the invite and set a password.
4. Roles set the lens each person lands on. In Identity, open a user, and under Roles add one of `staff`, `donor` or `admin`. No role defaults to staff. The donor role lands on the accountability view; admin sees everything.

Once Identity is on, the dashboard login screen's Sign in button opens the Identity login, and after signing in the hub reads live from Drive and upload works. The preview role buttons remain for quick read-only viewing, but preview users cannot upload or read stored files, which is the point of the lock.

## Test checklist

1. Sign in with an Identity account. The demo banner on the hub disappears once Drive is also configured.
2. Open the hub, click Upload report, pick a type, offtaker and a `.pptx`, and upload. It should appear in the correct Drive folder and in the library within a few seconds.
3. The tracker cell for that offtaker and report type turns to Received with an Open link.
4. Sign out, then use a preview role: the hub shows demo data and upload is disabled. That confirms the functions are locked.

## Notes

- Consolidation Studio. Once Drive is configured, the studio saves the captured figures to a shared file in Drive (a `_consolidation` folder), so the whole team prepares each period's consolidated report from one dataset rather than per browser. It also pulls the offtakers' own field photos out of their uploaded decks, so the generated deck carries their imagery. Both activate automatically with the same two environment variables; no extra setup.
- Large files. Weekly decks with photos can be several megabytes. The hub uploads them straight from the browser to Drive using a resumable session, so they are not limited by the serverless request size. If a large upload is ever blocked by a browser cross-origin error, tell me the message and I will switch that path to a chunked proxy; it is a one-file change.
- Securing the functions. For a first internal rollout the functions are reachable by anyone who has the site URL. Before wider use, gate them with Netlify Identity (the same login you use on the other programme sites) so only signed-in team members can upload or read. I can wire that in when you are ready.
- Nothing here affects the rest of the dashboard. The static front end and all existing tiers are unchanged; the hub simply adds the Drive-backed functions alongside them.
