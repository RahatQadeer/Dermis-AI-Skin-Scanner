/**
 * Public password-reset page. The Supabase reset email links here with a
 * short-lived recovery session in the URL fragment (never sent to servers or
 * logs). The page posts the new password to POST /v1/auth/password.
 */
export const RESET_PASSWORD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="referrer" content="no-referrer" />
  <title>Reset your Dermis password</title>
  <style>
    :root { color-scheme: light; font-family: system-ui, sans-serif; }
    body { margin: 0; padding: 2rem 1.25rem; background: #f7f4ef; color: #1c1917; }
    main { max-width: 28rem; margin: 0 auto; }
    h1 { font-size: 1.5rem; font-weight: 650; margin: 0 0 0.75rem; }
    p { line-height: 1.5; margin: 0 0 1rem; color: #44403c; }
    label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.35rem; }
    input { width: 100%; box-sizing: border-box; padding: 0.65rem 0.75rem; border: 1px solid #d6d3d1; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 1rem; }
    button { width: 100%; padding: 0.75rem 1rem; border: 0; border-radius: 0.5rem; background: #1c1917; color: #fff; font-weight: 600; font-size: 1rem; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .note { font-size: 0.8125rem; color: #78716c; margin-top: 1rem; }
    .msg { margin-top: 1rem; padding: 0.75rem; border-radius: 0.5rem; display: none; }
    .msg.ok { display: block; background: #ecfdf5; color: #065f46; }
    .msg.err { display: block; background: #fef2f2; color: #991b1b; }
  </style>
</head>
<body>
  <main>
    <h1>Choose a new password</h1>
    <p id="intro">Use at least 8 characters, including an uppercase letter, a lowercase letter and a number.</p>
    <form id="form">
      <label for="password">New password</label>
      <input id="password" type="password" required minlength="8" autocomplete="new-password" />
      <label for="confirm">Confirm new password</label>
      <input id="confirm" type="password" required minlength="8" autocomplete="new-password" />
      <button type="submit" id="submit">Save new password</button>
    </form>
    <p class="note">When you're done, go back to the Dermis app and log in with your new password.</p>
    <div id="msg" class="msg" role="status"></div>
  </main>
  <script>
    const params = new URLSearchParams(location.hash.slice(1));
    const token = params.get('access_token');
    const linkError = params.get('error_description');
    // Remove the token from the address bar and history right away.
    history.replaceState(null, '', location.pathname);
    const form = document.getElementById('form');
    const msg = document.getElementById('msg');
    const submit = document.getElementById('submit');
    function show(kind, text) { msg.className = 'msg ' + kind; msg.textContent = text; }
    if (!token || params.get('type') !== 'recovery') {
      form.style.display = 'none';
      show('err', linkError
        ? 'This reset link has expired or was already used. Request a new one from the Dermis app.'
        : 'Open this page from the link in your password-reset email.');
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const password = document.getElementById('password').value;
      if (password !== document.getElementById('confirm').value) {
        show('err', 'The two passwords don\\'t match.');
        return;
      }
      submit.disabled = true;
      try {
        const res = await fetch('/v1/auth/password', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
          body: JSON.stringify({ password }),
        });
        if (res.ok) {
          form.style.display = 'none';
          show('ok', 'Password updated. Return to the Dermis app and log in.');
          return;
        }
        const body = await res.json().catch(() => ({}));
        show('err', body.error === 'weak_password'
          ? 'That password is too weak. Use 8+ characters with an uppercase letter, a lowercase letter and a number.'
          : 'This reset link has expired or was already used. Request a new one from the Dermis app.');
      } catch {
        show('err', 'Could not reach Dermis. Check your connection and try again.');
      } finally {
        submit.disabled = false;
      }
    });
  </script>
</body>
</html>
`;
