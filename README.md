# Dakota STEM Trails website

A static website (Home, About Us, Contact, Our Team) for Dakota STEM Trails. It's plain HTML/CSS/JS with no build step, so it can go straight onto GitHub and Vercel.

## Folder layout

```
index.html      Home
about.html      About Us
contact.html    Contact (with working contact form)
team.html       Our Team
404.html        "Page not found" page
css/styles.css  All colors, fonts, layout and animations
js/main.js      Page transitions, scroll animations, mobile menu, contact form
images/         All photos
```

## Put it on GitHub and Vercel

1. On github.com, create a new repository (for example `dakota-stem-trails`).
2. Click **uploading an existing file** and drag in **everything inside** this folder: the 5 `.html` files, `README.md`, and the `css`, `js` and `images` folders. Then click **Commit changes**.
3. On vercel.com, click **Add New → Project**, pick the repo, leave the Framework Preset as **Other**, and click **Deploy**.

## Contact form (one-time setup)

The form sends messages to **dakotastemtrails@gmail.com** through FormSubmit, a free service with no account needed.
The **first** time someone submits the form after the site is live, FormSubmit emails that inbox an activation link. Click it once, and every message after that is delivered.

## Editing

- **Colors:** change the variables at the top of `css/styles.css` (`--orange`, `--yellow`, `--blue`, `--green`, and so on).
- **Photos:** replace a file in `images/` with your own photo, keeping the same file name.
- **Team members:** edit the names and roles in `team.html`.
- **Instagram:** the handle is set to `@dakotastemtrails`. If the real handle is different, search for `dakotastemtrails/` in the HTML files and update it.
