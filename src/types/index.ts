/**
 * Configuration for the Gethen Echo application
 */
export interface GethenConfig {
	// X (Twitter) API credentials (OAuth 2.0)
	bearerToken: string;
	
	// Target account to monitor
	targetUsername: string;
	
	// Default reply message
	replyMessage: string;
	
	// How far back in time to look for mentions (in minutes)
	lookbackPeriod: number;
}

/**
 * Represents data stored in KV to track which tweets have been processed
 */
export interface ProcessedTweetData {
	tweetId: string;
	processedAt: number; // Timestamp
	replySent: boolean;
	replyTweetId?: string;
}

/**
 * Environment variables available to the application
 */
export interface Env {
	// KV namespace for storing processed tweets
	PROCESSED_TWEETS: KVNamespace;
	
	// Environment variables for configuration (OAuth 2.0)
	X_BEARER_TOKEN: string;
	TARGET_USERNAME: string;
	REPLY_MESSAGE: string;
	LOOKBACK_PERIOD_MINUTES: string;
}