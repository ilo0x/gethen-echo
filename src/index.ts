import { XClient } from './api/x-client';
import { KVUtils } from './utils/kv';
import { TweetProcessor } from './utils/tweet-processor';
import { Env, GethenConfig } from './types';

/**
 * Load configuration from environment variables
 */
function loadConfig(env: Env): GethenConfig {
	return {
		bearerToken: env.X_BEARER_TOKEN,
		targetUsername: env.TARGET_USERNAME,
		replyMessage: env.REPLY_MESSAGE,
		lookbackPeriod: parseInt(env.LOOKBACK_PERIOD_MINUTES || '60', 10)
	};
}

/**
 * Main worker that processes mentions and responds to them
 */
export default {
	// Handle HTTP requests - for dashboard and manual triggers
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		
		// Manual trigger endpoint for immediate processing
		if (url.pathname === '/api/process') {
			if (request.method !== 'POST') {
				return new Response('Method not allowed', { status: 405 });
			}
			
			try {
				// Run the mention processing
				const result = await processMentions(env);
				return new Response(JSON.stringify(result), {
					headers: { 'Content-Type': 'application/json' }
				});
			} catch (error) {
				console.error('Error processing mentions:', error);
				return new Response(JSON.stringify({ error: 'Failed to process mentions' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}
		
		// Simple dashboard/status page
		if (url.pathname === '/' || url.pathname === '') {
			return new Response(`
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Gethen Echo</title>
					<style>
						body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
						h1 { color: #1DA1F2; }
						.card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
						button { background-color: #1DA1F2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
						button:hover { background-color: #0c85d0; }
					</style>
				</head>
				<body>
					<h1>Gethen Echo</h1>
					<div class="card">
						<h2>Status</h2>
						<p>Target Account: @${env.TARGET_USERNAME}</p>
						<p>Reply Message: "${env.REPLY_MESSAGE}"</p>
						<p>Looking back: ${env.LOOKBACK_PERIOD_MINUTES || '60'} minutes</p>
					</div>
					<div class="card">
						<h2>Actions</h2>
						<button onclick="triggerProcess()">Process Mentions Now</button>
						<div id="result" style="margin-top: 15px;"></div>
					</div>
					
					<script>
						async function triggerProcess() {
							document.getElementById('result').textContent = 'Processing...';
							try {
								const response = await fetch('/api/process', { method: 'POST' });
								const data = await response.json();
								document.getElementById('result').textContent = 
									\`Processing complete! Processed: \${data.processed}, Replied: \${data.replied}\`;
							} catch (error) {
								document.getElementById('result').textContent = 'Error: ' + error.message;
							}
						}
					</script>
				</body>
				</html>
			`, {
				headers: { 'Content-Type': 'text/html' }
			});
		}
		
		// Default response for other paths
		return new Response('Gethen Echo API', {
			headers: { 'Content-Type': 'text/plain' }
		});
	},
	
	// Schedule-based trigger (Cron)
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		// Process mentions on schedule
		ctx.waitUntil(processMentions(env));
	}
};

/**
 * Process mentions and reply to them
 */
async function processMentions(env: Env): Promise<{processed: number, replied: number}> {
	// Load configuration
	const config = loadConfig(env);
	
	// Initialize clients and utilities
	const xClient = new XClient(
		config.bearerToken,
		config.targetUsername
	);
	
	const kvUtils = new KVUtils(env.PROCESSED_TWEETS);
	
	// Create and run the tweet processor
	const processor = new TweetProcessor(xClient, kvUtils, config.replyMessage);
	return await processor.processNewMentions();
}