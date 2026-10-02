# Cyclist Carbohydrate Planner

Static GitHub Pages version of the calculator. It uses only HTML, CSS, and vanilla JavaScript, so it does not require .NET, Docker, or a server.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static file server.

## Deploy with GitHub Pages

The repository workflow at `.github/workflows/deploy-pages.yml` publishes this folder automatically whenever `main` is updated.

1. Push the repository to GitHub.
2. In the repository, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`, or run **Deploy static site to GitHub Pages** manually from the Actions tab.

The existing ASP.NET Core application remains outside this static site and can still be deployed with Docker.
