# Setting up git for home ⇄ school sync

I tried to set this up for you from my end, but hit a real limitation: this sandbox
reaches your `y2s1_2` folder through a network-style mount, and that mount doesn't
support the low-level file operations git needs (renaming/deleting temp objects) —
about half of git's own internal files failed to write cleanly, and I couldn't fully
clean up the mess afterwards either. **There's a broken `.git` folder sitting in
`C:\wamp64\www\y2s1_2` right now that you'll need to delete before doing anything else.**

This isn't a sign git won't work for you — it works completely normally on a real
Windows filesystem. It just needs to be *you*, running it directly on your PC, not me
running it through this sandbox.

## Step 0 — clean up my mess

Open Command Prompt, then:

```
cd C:\wamp64\www\y2s1_2
rmdir /s /q .git
```

(If that says "Access is denied" on a couple of files, just delete the `.git` folder
by hand in File Explorer instead — you'll need View → Show → Hidden items turned on
to see it.)

## Step 1 — install git (skip if you already have it)

Download from https://git-scm.com/download/win and install with defaults. Then in
Command Prompt:

```
git --version
```

should print a version number.

## Step 2 — turn the folder into a repo

```
cd C:\wamp64\www\y2s1_2
git init
git config user.name "Kiryu Kazuma"
git config user.email "terenceng769@gmail.com"
```

A `.gitignore` and `.htaccess` are already sitting in `C:\wamp64\www\y2s1_2\` (I
placed them there directly — no mount issues with plain file writes, just with git
itself). The `.gitignore` deliberately keeps the raw lecture/tutorial PDFs in
`subject files\` out of the repo — only the built prep site (the HTML/CSS you
actually use) gets synced. That keeps the repo small and sidesteps any copyright
awkwardness around redistributing NTU course PDFs, even to a private repo. Check
they're there (they're hidden files, so enable View → Show → Hidden items if you
want to eyeball them) — if for some reason they didn't make it over, their contents
are at the bottom of this guide.

```
git add .
git commit -m "Initial commit — IE2104/IE2106/EE2005 prep site + routine page"
```

## Step 3 — create a private repo on GitHub

This part has to be you, since it needs your login.

1. Go to https://github.com/new
2. Repository name: anything, e.g. `y2s1-prep`
3. **Set it to Private**
4. Do NOT check "Add a README" or "Add .gitignore" (you already have local content)
5. Click Create repository
6. Copy the URL it gives you under "…or push an existing repository from the
   command line" — it looks like `https://github.com/<you>/y2s1-prep.git`

## Step 4 — connect and push

Back in Command Prompt:

```
git remote add origin https://github.com/<you>/y2s1-prep.git
git branch -M main
git push -u origin main
```

First time, it'll pop up a browser window asking you to log into GitHub — that's
normal, it's just authenticating the `git push`.

## Step 5 — get it onto your school laptop

On the school laptop, once (first time only):

```
cd C:\wamp64\www
git clone https://github.com/<you>/y2s1-prep.git y2s1_2
```

That downloads the whole thing into the right spot for WAMP to serve it.

## The day-to-day workflow

**Before you start editing, anywhere:**
```
cd C:\wamp64\www\y2s1_2
git pull
```

**After you're done editing, anywhere:**
```
cd C:\wamp64\www\y2s1_2
git add -A
git commit -m "describe what changed"
git push
```

That's really the whole habit — pull before you start, push before you close the
laptop. If you ever forget and edit on both machines before syncing, `git pull` will
tell you about the conflict instead of silently losing anything, which is the main
thing this buys you over a USB drive.

## Why the `.htaccess` matters

Since `.git` lives inside your WAMP document root, in principle a misconfigured
Apache could serve its contents over HTTP. WAMP only listens on localhost by default
so this is low-risk, but the `.htaccess` already placed at
`C:\wamp64\www\y2s1_2\.htaccess` closes it off for free — it just tells Apache to
404 anything under `/.git`.

## Reference — file contents, in case they didn't come through

`.gitignore`:
```
# Raw course materials -- copyrighted NTU content, kept local-only, not pushed
subject files/

# OS / editor cruft
.DS_Store
Thumbs.db
desktop.ini
*.tmp
```

`.htaccess`:
```
RedirectMatch 404 /\.git
```
