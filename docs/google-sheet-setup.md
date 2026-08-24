# Recording demo requests in a Google Sheet

The `/book-a-demo` form posts to a TanStack **server function**
(`src/lib/demo-request.ts`), which forwards the request to a Google Apps Script
web app bound to your sheet. The webhook URL lives in the `DEMO_WEBHOOK_URL`
environment variable and is read server-side only, so it never reaches the
browser and can't be scraped out of the client bundle.

```
browser  ──POST──▶  submitDemoRequest (server)  ──POST──▶  Apps Script  ──▶  Google Sheet
```

Nothing is recorded until you finish steps 1–4 below. Until then the form
returns "The form isn't connected yet."

---

## 1. Create the sheet

1. Go to <https://sheets.new> and name the file something like
   **Corridor One X — Demo Requests**.
2. Put these headers in row 1, in exactly this order:

   | A | B | C | D | E | F |
   |---|---|---|---|---|---|
   | Timestamp | Name | Email | Phone | Company | Message |

   (The script writes them for you if the sheet is empty, but creating them
   yourself makes the order obvious.)

## 2. Add the Apps Script

In the sheet, open **Extensions → Apps Script**. Delete whatever is in
`Code.gs` and paste this in full:

```javascript
/**
 * Receives demo requests from the Corridor One X site and appends one row per
 * submission. Deployed as a web app; see the repo's docs/google-sheet-setup.md.
 */
const SHARED_SECRET = ''; // optional — see step 5

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respond({ ok: false, error: 'empty request' });
    }

    const body = JSON.parse(e.postData.contents);

    if (SHARED_SECRET && body.secret !== SHARED_SECRET) {
      return respond({ ok: false, error: 'unauthorized' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write the header row once, if the sheet is still completely empty.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Company', 'Message']);
      sheet.getRange('A1:F1').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      body.submittedAt ? new Date(body.submittedAt) : new Date(),
      body.name || '',
      body.email || '',
      body.phone || '',
      body.company || '',
      body.message || '',
    ]);

    return respond({ ok: true });
  } catch (err) {
    return respond({ ok: false, error: String(err) });
  }
}

function respond(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Save it (the disk icon).

## 3. Deploy it as a web app

1. **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set:
   - **Description**: anything, e.g. `demo requests v1`
   - **Execute as**: **Me** — so the script can write to your sheet
   - **Who has access**: **Anyone** — required, because your site's server calls
     it without a Google login. It only accepts POSTs and only ever appends
     rows; it never reads or returns your data.
4. Click **Deploy**, then **Authorize access** and approve the permissions
   prompt for your own account.
5. Copy the **Web app URL**. It looks like:

   ```
   https://script.google.com/macros/s/AKfycb..................../exec
   ```

> **Every time you edit the script**, you must do **Deploy → Manage deployments
> → edit (pencil) → Version: New version → Deploy**. Saving alone does not
> update the live web app.

## 4. Point the site at it

Set `DEMO_WEBHOOK_URL` to that web app URL.

**Local development** — create a `.env` file in the project root:

```
DEMO_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb..../exec
```

`.env` is already covered by `.gitignore`; never commit the URL.

**Production** — add the same variable in your host's environment settings
(Lovable project settings; Cloudflare → Workers & Pages → your project →
Settings → Variables and Secrets, added as a **Secret**; or Railway → the
`web` service → Variables), then redeploy.

> **Railway note.** This app is built by Nitro, which targets Cloudflare Workers
> by default. The Railway service therefore also sets `NITRO_PRESET=node-server`
> so the build produces a plain Node server that `npm start` can run. Don't
> remove that variable — without it the container builds a Cloudflare Worker,
> nothing listens on `$PORT`, and every request returns 502.

Restart the dev server after adding it, then submit the form once and confirm a
row lands in the sheet.

---

## 5. Optional: reject anything that isn't your site

Because "Who has access" must be **Anyone**, someone who learns the URL could
post rows to your sheet. The URL is only ever used server-side, so it isn't
published anywhere — but if you want a second lock:

1. Put any long random string in `SHARED_SECRET` at the top of the script, and
   redeploy a **new version**.
2. Add the same string to your environment as `DEMO_WEBHOOK_SECRET`.
3. In `src/lib/demo-request.ts`, include it in the POST body:

   ```ts
   body: JSON.stringify({
     secret: process.env.DEMO_WEBHOOK_SECRET,
     name: data.name,
     // ...the rest unchanged
   }),
   ```

## 6. Optional: email yourself on each request

Add this inside `doPost`, just before `return respond({ ok: true })`:

```javascript
MailApp.sendEmail({
  to: 'you@corridoronex.com',
  subject: 'New demo request: ' + (body.name || 'unknown'),
  body: [
    'Name: ' + (body.name || ''),
    'Email: ' + (body.email || ''),
    'Phone: ' + (body.phone || ''),
    'Company: ' + (body.company || ''),
    '',
    body.message || '',
  ].join('\n'),
});
```

Redeploy a new version afterwards.

---

## Troubleshooting

| What you see | Cause |
| --- | --- |
| "The form isn't connected yet." | `DEMO_WEBHOOK_URL` isn't set in that environment. Restart the dev server / redeploy after adding it. |
| "We couldn't record that just now." | The script returned an error. Open Apps Script → **Executions** to read the failure. |
| Submits fine, no new row | You edited the script but deployed no **new version**, so the live web app is still running the old code. |
| Rows appear with an empty timestamp | The `Timestamp` column is formatted as plain text. Select column A → Format → Number → Date time. |
