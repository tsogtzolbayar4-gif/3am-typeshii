# Setup guide

## 1. Add your images
Drop these files into the `images/` folder (exact filenames matter, but if one is missing the page just shows a fallback emoji instead of breaking):

- `background.jpg` — full-screen background photo (optional, falls back to a pastel gradient)
- `popup-q1-yes.png`, `popup-q1-no.png`
- `popup-q2-yes.png`, `popup-q2-no.png`
- `popup-q3.png`
- `popup-q4-yes.png`, `popup-q4-no.png`
- `popup-q5.png` — shown after she picks a date
- `q6-picture.png` — the picture for question 6 (now the very last slide, shown after she says yes to q7)
- `popup-q7-yes.png` — shown after she finally presses Yes on the second-to-last question

## 2. Set up EmailJS (so her answers land in your inbox)
1. Go to https://www.emailjs.com and create a free account.
2. Add an Email Service (e.g. connect your Gmail) → copy the **Service ID**.
3. Create an Email Template. In the template body, add `{{answers}}` wherever you want the list of answers to appear.
4. Copy the **Template ID**.
5. Go to Account → API Keys → copy your **Public Key**.
6. Open `script.js`, find this section near the top, and paste your three IDs in:
   ```js
   const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";
   const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";
   const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
   ```

## 3. (Optional) Add background music
1. Put an mp3 file anywhere in the project (e.g. `images/music.mp3`).
2. In `script.js`, find section 13 and uncomment these two lines:
   ```js
   bgMusic.src = "music.mp3";
   musicToggle.classList.remove("hidden");
   ```

## 4. Add more questions later
Open `script.js` and add a new object to the `questions` array at the top — see the comments above it for the four supported types (`yesno`, `slider`, `date`, `message`).

The flow can branch: a question can have a `next` field pointing to a different question id depending on the answer (see q1 and q4 for examples). Without a `next` field, it just moves to the next item in the array.

## 5. Host it — full step-by-step (GitHub Pages)

This turns your folder into a real link you can text her. No coding needed beyond copy/paste.

1. **Create a GitHub account** (skip if you have one): go to https://github.com/signup and follow the prompts.
2. **Create a new repository**:
   - Click the **+** icon top-right → **New repository**.
   - Name it anything (e.g. `for-temi`). It can be **Public** (Pages needs a public repo on the free plan) or **Private** if you have GitHub Pro.
   - Leave everything else default → click **Create repository**.
3. **Upload your files**:
   - On the new repo's page, click **uploading an existing file** (or the "Add file" → "Upload files" button).
   - Drag in `index.html`, `style.css`, `script.js`, and the whole `images` folder (drag the folder in directly — GitHub keeps the folder structure).
   - Scroll down, click **Commit changes**.
4. **Turn on GitHub Pages**:
   - In your repo, click **Settings** (top menu of the repo, not your account settings).
   - In the left sidebar, click **Pages**.
   - Under "Build and deployment" → "Source", choose **Deploy from a branch**.
   - Under "Branch", choose **main** (or `master`) and folder **/ (root)** → click **Save**.
5. **Wait ~1-2 minutes**, then refresh that same Pages settings page. A banner will appear: *"Your site is live at https://yourusername.github.io/for-temi/"*. That's your link.
6. **Test it yourself first** — open that link on your own phone, click through everything, confirm images/popups/confetti/email all work.
7. **Send her the link.**

**Making a change later:** click on the file in GitHub (e.g. `script.js`) → the pencil/edit icon → make your edit → **Commit changes**. The live link updates automatically within a minute or two.

### Alternative: Vercel (also free, slightly faster deploys)
1. Go to https://vercel.com → sign up (you can sign up directly with your GitHub account, which is easiest).
2. Click **Add New** → **Project**.
3. If you did the GitHub steps above, just **import** that same repo — Vercel deploys it automatically, no configuration needed for a plain HTML/CSS/JS site.
4. Vercel gives you a link like `https://for-temi.vercel.app` immediately.
5. Any time you push a change to GitHub, Vercel redeploys automatically.

Either way works fine — GitHub Pages is simpler if you don't want a second account; Vercel is nice if you'll keep tweaking it and want faster redeploys.

## 6. EmailJS troubleshooting (if it's still not sending)

Since it's still not working, let's narrow it down. Go through these **in order**:

1. **Open the browser console while testing.** On desktop: right-click the page → Inspect → Console tab. Click through the whole quiz to the end, then look at the console.
   - If you see `EmailJS is not configured yet...` → one of your three IDs in `script.js` still isn't saved correctly. Double check the file.
   - If you see `EmailJS error: ...` followed by details → **copy that exact error message**, that tells us precisely what's wrong. Common ones:
     - `"The recipients address is empty"` → your EmailJS template's **To Email** field isn't set (see step 2 below — this is the single most common cause).
     - `"The user ID is required"` / `"Invalid public key"` → the Public Key in `script.js` doesn't match your EmailJS account.
     - `"Service ID not found"` or `"Template ID not found"` → typo, or you copied an ID from the wrong service/template.
   - If you see **no error at all** and nothing else happens → the button/flow itself might not be reaching the final screen; check that confetti/final message also appear.

2. **Check your EmailJS template's "To Email" field** — this causes the most silent failures:
   - Go to https://dashboard.emailjs.com → **Email Templates** → open your template.
   - Look for a **"To Email"** field near the top (separate from the subject/body). It needs your actual email address typed in there directly (e.g. `youremail@gmail.com`) — it is easy to accidentally leave this blank.
   - Save the template after fixing it.

3. **Check your Email Service is still connected**:
   - Dashboard → **Email Services** → open your service.
   - If it shows "Reconnect" or a warning icon instead of "Connected", your Gmail authorization expired — click reconnect and re-authorize.

4. **Check the Email Logs / History**:
   - Dashboard → look for **"Logs"** or **"History"** in the sidebar. Every send attempt shows here, successful or failed, with a reason for failures. This is the most reliable place to see what actually happened.

5. **Rule out ad blockers**: try the full flow in an incognito/private window with extensions disabled, since some ad blockers block requests to email-sounding API domains.

6. **Check your spam folder** — it can land there on the first few sends.

If you go through steps 1-2 and still get stuck, tell me exactly what error text (if any) shows up in the console, and I can pin down the fix immediately.
