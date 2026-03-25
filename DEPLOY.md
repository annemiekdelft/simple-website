# Simple Website Deployment

This site is ready for Render as a static website.

## What is already prepared

- `render.yaml` config for a free Render static deployment
- Static site files:
  - `index.html`
  - `styles.css`
  - `script.js`

## What still needs to happen

Render needs this project in a Git repository on GitHub, GitLab, or Bitbucket.

## Fastest path

1. Create a new GitHub repository.
2. Push the `simple-website` folder contents to that repository.
3. In Render, create a new Blueprint service from the repo.
4. Render will read `render.yaml` and publish the site automatically.

## Notes

- The site name in Render will default to `simple-website`.
- The public URL will be an `onrender.com` address unless you attach a custom domain.
- External scripts loaded by the demo depend on the remote URLs allowing browser access.
