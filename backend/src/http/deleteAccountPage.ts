/**
 * Public account-deletion page (App Store / Play compliance).
 * Served at GET /delete-account. Posts to POST /v1/public/deletion-requests.
 */
export const DELETE_ACCOUNT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Delete your Dermis account</title>
  <style>
    :root { color-scheme: light; font-family: system-ui, sans-serif; }
    body { margin: 0; padding: 2rem 1.25rem; background: #f7f4ef; color: #1c1917; }
    main { max-width: 28rem; margin: 0 auto; }
    h1 { font-size: 1.5rem; font-weight: 650; margin: 0 0 0.75rem; }
    p { line-height: 1.5; margin: 0 0 1rem; color: #44403c; }
    label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.35rem; }
    input { width: 100%; box-sizing: border-box; padding: 0.65rem 0.75rem; border: 1px solid #d6d3d1; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 1rem; }
    button { width: 100%; padding: 0.75rem 1rem; border: 0; border-radius: 0.5rem; background: #b91c1c; color: #fff; font-weight: 600; font-size: 1rem; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .note { font-size: 0.8125rem; color: #78716c; margin-top: 1rem; }
    .msg { margin-top: 1rem; padding: 0.75rem; border-radius: 0.5rem; display: none; }
    .msg.ok { display: block; background: #ecfdf5; color: #065f46; }
    .msg.err { display: block; background: #fef2f2; color: #991b1b; }
  </style>
</head>
<body>
  <main>
    <h1>Delete your Dermis account</h1>
    <p>This permanently deletes your account and associated data (profile, scans, routine, and settings). This cannot be undone.</p>
    <form id="form">
      <label for="email">Account email</label>
      <input id="email" name="email" type="email" required autocomplete="email" />
      <label for="confirmation">Type DELETE MY ACCOUNT to confirm</label>
      <input id="confirmation" name="confirmation" type="text" required autocomplete="off" />
      <button type="submit" id="submit">Request deletion</button>
    </form>
    <p class="note">Dermis is a wellness tool, not a medical device. Fastest option: open Dermis, go to Profile and choose Delete account &mdash; it takes effect immediately. Requests made on this page are completed after we confirm you own the email address, so watch that inbox for a message from us.</p>
    <div id="msg" class="msg" role="status"></div>
  </main>
  <script>
    const form = document.getElementById('form');
    const msg = document.getElementById('msg');
    const submit = document.getElementById('submit');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      msg.className = 'msg';
      msg.textContent = '';
      submit.disabled = true;
      try {
        const body = {
          email: document.getElementById('email').value,
          confirmation: document.getElementById('confirmation').value,
        };
        const res = await fetch('/v1/public/deletion-requests', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          throw new Error('Request failed');
        }
        msg.className = 'msg ok';
        msg.textContent = 'Request received. If an account exists for that email, we will contact that inbox to confirm before deleting it.';
        form.reset();
      } catch {
        msg.className = 'msg err';
        msg.textContent = 'Something went wrong. Check the confirmation phrase and try again.';
      } finally {
        submit.disabled = false;
      }
    });
  </script>
</body>
</html>
`;

export function serveDeleteAccountPage(): Response {
  return new Response(DELETE_ACCOUNT_HTML, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
