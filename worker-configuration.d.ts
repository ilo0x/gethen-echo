interface Env {
	// KV namespace for storing processed tweets
	PROCESSED_TWEETS: KVNamespace;
	
	// Environment variables for configuration (OAuth 2.0)
	X_BEARER_TOKEN: string;
	TARGET_USERNAME: string;
	REPLY_MESSAGE: string;
	LOOKBACK_PERIOD_MINUTES: string;
}