# Deploying to Netlify

This guide outlines the steps to deploy the application to Netlify, based on the [Netlify Next.js Setup Guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).

## Changes Made to Prepare for Deployment

1.  **Fixed Middleware Build Error**:
    - Refactored `src/middleware.ts` to include the logic from `src/proxy.ts` directly.
    - Deleted `src/proxy.ts` to resolve conflicts and build errors.
    - Note: You may see a warning during build about `middleware` being deprecated in favor of `proxy`. This is expected in this version but the build succeeds.

2.  **Updated `next.config.ts`**:
    - Removed `output: 'standalone'` as Netlify's OpenNext adapter handles the serverless function generation automatically.

3.  **Added `netlify.toml`**:
    - Created a simplified configuration file to explicitly set the build command.

4.  **Verified Build**:
    - Successfully ran `npm run build` locally.

## Steps to Deploy

1.  **Push Changes to Git**:
    - Ensure all changes (including the new `netlify.toml` and middleware fixes) are committed and pushed to your Git repository (GitHub, GitLab, or Bitbucket).

2.  **Connect to Netlify**:
    - Log in to your [Netlify Dashboard](https://app.netlify.com/).
    - Click **"Add new site"** > **"Import an existing project"**.
    - Select your Git provider and authorize Netlify.
    - Choose the repository `TumAraiD` (or the relevant repo name).

3.  **Configure Build Settings**:
    - Netlify should automatically detect it's a Next.js project.
    - **Build Command**: `npm run build` (should be auto-filled or read from `netlify.toml`)
    - **Publish Directory**: `.next` (or leave default, Netlify handles this)
    - **Environment Variables**:
        - You MUST add your environment variables from `.env` to Netlify's **Site configuration > Environment variables**.
        - Critical variables likely include:
            - `DATABASE_URL`
            - `NEXTAUTH_SECRET`
            - `NEXTAUTH_URL` (Set this to your Netlify site URL, e.g. `https://your-site.netlify.app`)
            - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (if using Google Auth)
            - Any other secrets used in `src/middleware.ts` (formerly `proxy.ts`).

4.  **Deploy**:
    - Click **"Deploy site"**.
    - Netlify will run the build. You can monitor the logs in the "Deploys" tab.

## Troubleshooting

-   If the build fails on Netlify verify that all environment variables are set.
-   If you encounter "Skew protection" issues, refer to the [Netlify docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/#skew-protection).
