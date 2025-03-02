// src/utils/kv.ts

import { ProcessedTweetData } from '../types';

/**
 * Utility functions for working with KV storage
 */
export class KVUtils {
	private kvNamespace: KVNamespace;
	private retentionPeriodMs: number;

	/**
	 * Create a new KV utility instance
	 * 
	 * @param kvNamespace KV namespace for storing processed tweets
	 * @param retentionDays How many days to keep processed tweets in KV
	 */
	constructor(kvNamespace: KVNamespace, retentionDays = 7) {
		this.kvNamespace = kvNamespace;
		this.retentionPeriodMs = retentionDays * 24 * 60 * 60 * 1000;
	}

	/**
	 * Store a processed tweet in KV
	 * 
	 * @param tweetData Data about the processed tweet
	 */
	async storeProcessedTweet(tweetData: ProcessedTweetData): Promise<void> {
		await this.kvNamespace.put(
			`tweet:${tweetData.tweetId}`,
			JSON.stringify(tweetData),
			{
				// Set expiration based on retention period
				expirationTtl: Math.floor(this.retentionPeriodMs / 1000)
			}
		);
	}

	/**
	 * Check if a tweet has been processed already
	 * 
	 * @param tweetId ID of the tweet to check
	 * @returns Whether the tweet has been processed
	 */
	async isTweetProcessed(tweetId: string): Promise<boolean> {
		const data = await this.kvNamespace.get(`tweet:${tweetId}`);
		return data !== null;
	}

	/**
	 * Get the most recently processed tweet ID
	 * This helps us determine the 'since_id' parameter for API calls
	 * 
	 * @returns The most recent tweet ID or undefined if none found
	 */
	async getLatestProcessedTweetId(): Promise<string | undefined> {
		// List the keys with the 'tweet:' prefix
		const keys = await this.kvNamespace.list({ prefix: 'tweet:' });
		
		if (keys.keys.length === 0) {
			return undefined;
		}

		// Sort keys by name (tweet IDs are chronological)
		const sortedKeys = keys.keys.sort((a, b) => {
			// Extract tweet IDs from keys
			const idA = a.name.replace('tweet:', '');
			const idB = b.name.replace('tweet:', '');
			
			// Twitter IDs are sortable as strings (newer = higher)
			return idB.localeCompare(idA);
		});

		// Return the most recent tweet ID
		return sortedKeys[0].name.replace('tweet:', '');
	}

	/**
	 * Clean up old processed tweets that are beyond the retention period
	 * Note: KV handles expiration automatically, but this can be used for manual cleanup
	 */
	async cleanupOldTweets(): Promise<void> {
		const keys = await this.kvNamespace.list({ prefix: 'tweet:' });
		const now = Date.now();
		
		for (const key of keys.keys) {
			const tweetDataStr = await this.kvNamespace.get(key.name);
			
			if (tweetDataStr) {
				const tweetData = JSON.parse(tweetDataStr) as ProcessedTweetData;
				
				// Delete if older than retention period
				if (now - tweetData.processedAt > this.retentionPeriodMs) {
					await this.kvNamespace.delete(key.name);
				}
			}
		}
	}
}