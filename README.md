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

## Changes to be made to \wamp64\bin\apache\apache2.4.62.1\conf\extra\httpd-vhosts.conf

Allows website to be seen via Tailscale (for iPad or iPhone or even laptop assuming desktop is running)

Change "Require local" to "Require all granted" on line 10

(If you still get a 403 after this, Apache usually has a *second*, more specific
`<Directory "c:/wamp64/www/">` block further down in `httpd.conf` itself that also
says `Require local` — that one wins over the root block above it since Apache uses
whichever `<Directory>` block most specifically matches the path. Change that one to
`Require all granted` too, then restart all WAMP services.)

## Viewing the site offline on iPad (PWA setup)

The site now has offline support built in — a service worker (`sw.js`), an app
manifest (`manifest.json`), and icons all live at the root of `y2s1_2\`, and every
page registers them automatically. Once set up, the site keeps working on the iPad
even when neither this PC nor the school laptop is switched on.

**Important catch:** service workers (what makes offline caching possible) refuse to
register over plain HTTP — browsers only trust `localhost` itself as an exception,
not a remote device reached over Tailscale's normal `http://100.x.y.z/...` address.
So this needs one extra step beyond the "Require all granted" fix above: a real
HTTPS certificate in front of WAMP.

### One-time setup

1. In the [Tailscale admin console](https://login.tailscale.com/admin/dns) → **DNS**
   tab: turn on **MagicDNS** if it isn't already on, then under **HTTPS
   Certificates**, click **Enable HTTPS**.
2. On this PC, open Command Prompt (or PowerShell) and run:
   ```
   tailscale serve --bg --https=443 localhost:80
   ```
   This proxies WAMP (port 80) out over HTTPS with a certificate Tailscale issues
   and renews automatically — no warnings, no self-signed cert to trust manually.
3. Run `tailscale serve status` any time to check it's still running, or find your
   new HTTPS address. It'll look like:
   ```
   https://<this-pc's-tailscale-name>.<your-tailnet-name>.ts.net/
   ```
   Use that instead of the old `http://100.x.y.z/` address from now on — the site
   itself lives at the same `/y2s1_2/` path underneath it.

This only needs to be set up once. Because it was started with `--bg`, Tailscale
keeps it running in the background across reboots — you don't need to re-run the
command every time.

### Getting it onto the iPad home screen

1. With this PC on and Tailscale connected, open the new `https://...ts.net/y2s1_2/`
   address in Safari on the iPad and let the page fully load.
2. Tap the **Share** icon → **Add to Home Screen**.
3. From then on, tapping that home screen icon opens the site — and it'll keep
   working even with this PC completely off, since everything gets served from the
   iPad's own local cache instead of over the network.

### How the offline cache updates

Every time the site is opened *while online*, the service worker quietly re-fetches
each page in the background and refreshes what's cached — so it naturally stays
up to date without any extra effort. The one thing worth knowing: a brand new page
(like a Week 7 that doesn't exist yet) only becomes available offline after it's
been opened at least once while online. If a whole batch of new pages gets added at
once, opening the site's home page once (online) is enough — the service worker
re-downloads everything in `sw.js`'s list in the background on that first load.

If pages ever seem to be stuck showing old/stale content, bumping the version
string in `y2s1_2\sw.js` (`const CACHE_VERSION = "y2s1-prep-v1";` → `"...-v2"`, etc.)
forces every device to throw away its old cache and re-download everything fresh
the next time it's opened online.

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
