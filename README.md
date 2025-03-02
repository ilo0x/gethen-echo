# Gethen Echo
*Reply bot for X*
## Purpose
Auto-reply to accounts that engage with a target account
## Scope
- Create a simply bot using typescript
- Run the bot locally
- Deploy the bot on the cloud
- Create a simple GUI for it
## Run
open `aiseed.gethen-echo.json` for an overview of the project.

## Environment Setup

This project requires several API credentials from Twitter/X:

1. Create a `.dev.vars` file in the project root (this file is git-ignored)
2. Add the following variables:
X_API_KEY=your_api_key_here
X_API_SECRET=your_api_secret_here
X_ACCESS_TOKEN=your_access_token_here
X_ACCESS_TOKEN_SECRET=your_access_token_secret_here

3. For production deployment, add these secrets to Cloudflare:
```bash
npx wrangler secret put X_API_KEY
npx wrangler secret put X_API_SECRET
npx wrangler secret put X_ACCESS_TOKEN
npx wrangler secret put X_ACCESS_TOKEN_SECRET
```