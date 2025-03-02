# Gethen Echo

*Auto-reply bot for X (formerly Twitter)*

Gethen Echo is a serverless application that automatically replies to mentions of a target X account. It uses Cloudflare Workers for easy deployment and scheduling.

Open `aiseed.gethen-echo.json` with any AI client for an overview of the project.

## Features

- 🔄 Automatically responds to mentions of your X account
- 🕒 Runs on a customizable schedule (default: every 10 minutes)
- 💾 Keeps track of processed tweets to avoid duplicate replies
- 📊 Simple dashboard UI for status checking and manual triggering

## Setup Instructions

### Prerequisites

1. An X Developer Account with API access
2. A Cloudflare account
3. Node.js and npm installed on your development machine

### X API Setup

1. Create a developer account on the [X Developer Platform](https://developer.twitter.com/)
2. Create a new Project and App
3. Set up OAuth 2.0 with the following settings:
   - Type of App: Automated App or Bot
   - App permissions: Read and Write
   - Callback URL/Redirect URL: `https://your-worker-url.workers.dev/auth/callback` (or use localhost for testing)
4. Generate a Bearer Token in the "Keys and Tokens" section

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gethen-echo.git
   cd gethen-echo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create KV namespace for the application:
   ```bash
   npx wrangler kv:namespace create PROCESSED_TWEETS
   npx wrangler kv:namespace create PROCESSED_TWEETS --preview
   ```

4. Update the `wrangler.jsonc` file with the KV namespace IDs returned from the previous commands.

5. Configure environment variables in `wrangler.jsonc`:
   - `TARGET_USERNAME`: The X username to monitor for mentions
   - `REPLY_MESSAGE`: The message to automatically reply with
   - `LOOKBACK_PERIOD_MINUTES`: How far back to look for mentions

6. Create a `.dev.vars` file for local development:
   ```
   # Twitter/X API Credentials (OAuth 2.0)
   X_BEARER_TOKEN=your_bearer_token_here
   
   # Application Configuration
   TARGET_USERNAME=yourtargetaccount
   REPLY_MESSAGE=Thanks for mentioning me! This is an automated response.
   LOOKBACK_PERIOD_MINUTES=60
   ```

7. Add your X Bearer Token as a secret for production:
   ```bash
   npx wrangler secret put X_BEARER_TOKEN
   ```

### Development

Run the application locally:
```bash
npm run dev
```

This will start a local development server, typically at http://localhost:8787.

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Usage

Once deployed, Gethen Echo will:

1. Run automatically every 10 minutes (configurable in `wrangler.jsonc`)
2. Check for new mentions of your target account
3. Reply to each mention with your configured message
4. Track which tweets have been processed to avoid duplicates

You can also access the simple dashboard UI by visiting your Cloudflare Workers URL, which allows you to:
- View current configuration
- Manually trigger processing
- See results of processing

## Project Structure

- `src/index.ts`: Main entry point for the application
- `src/api/x-client.ts`: Client for interacting with the X API
- `src/utils/kv.ts`: Utilities for working with Cloudflare KV storage
- `src/utils/tweet-processor.ts`: Core logic for processing tweets
- `src/types/index.ts`: TypeScript type definitions

## Customization

### Changing the Reply Message

Update the `REPLY_MESSAGE` environment variable in `wrangler.jsonc` or via the Cloudflare dashboard.

### Adjusting the Schedule

Modify the `cron` setting in `wrangler.jsonc` to change how frequently Gethen Echo checks for new mentions.

### Extending Functionality

The modular design makes it easy to extend functionality:
- Add custom reply logic in `tweet-processor.ts`
- Implement additional endpoints in `index.ts`
- Enhance the dashboard UI with more features

## License

MIT

## Acknowledgments

Named after the planet Gethen from Ursula K. Le Guin's novel "The Left Hand of Darkness".