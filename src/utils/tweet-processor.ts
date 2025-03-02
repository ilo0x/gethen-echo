// src/utils/tweet-processor.ts

import { XClient } from '../api/x-client';
import { KVUtils } from './kv';
import { ProcessedTweetData } from '../types';

/**
 * TweetProcessor handles the core logic of finding mentions and replying to them
 */
export class TweetProcessor {
	private xClient: XClient;
	private kvUtils: KVUtils;
	private replyMessage: string;

	/**
	 * Create a new tweet processor
	 * 
	 * @param xClient X API client instance
	 * @param kvUtils KV utilities instance
	 * @param replyMessage Default reply message
	 */
	constructor(xClient: XClient, kvUtils: KVUtils, replyMessage: string) {
		this.xClient = xClient;
		this.kvUtils = kvUtils;
		this.replyMessage = replyMessage;
	}

	/**
	 * Process new mentions and reply to them
	 * 
	 * @returns Number of tweets processed and replied to
	 */
	async processNewMentions(): Promise<{processed: number, replied: number}> {
		let processedCount = 0;
		let repliedCount = 0;
		
		try {
			// Get the latest processed tweet ID to use as since_id
			const latestProcessedId = await this.kvUtils.getLatestProcessedTweetId();
			
			// Get recent mentions
			const mentions = await this.xClient.getRecentMentions(latestProcessedId);
			
			if (!mentions.data || mentions.data.length === 0) {
				console.log('No new mentions found');
				return { processed: 0, replied: 0 };
			}
			
			console.log(`Found ${mentions.data.length} new mentions to process`);
			
			// Process each mention
			for (const tweet of mentions.data) {
				// Skip if we've already processed this tweet (additional safety check)
				const isProcessed = await this.kvUtils.isTweetProcessed(tweet.id);
				if (isProcessed) {
					continue;
				}
				
				// Mark the tweet as processed
				const tweetData: ProcessedTweetData = {
					tweetId: tweet.id,
					processedAt: Date.now(),
					replySent: false
				};
				
				try {
					// Send reply
					const reply = await this.xClient.replyToTweet(tweet.id, this.replyMessage);
					
					// Update tweet data with reply info
					tweetData.replySent = true;
					tweetData.replyTweetId = reply.id;
					repliedCount++;
					
					console.log(`Replied to tweet ${tweet.id} with ${reply.id}`);
				} catch (replyError) {
					console.error(`Failed to reply to tweet ${tweet.id}:`, replyError);
				}
				
				// Store processed tweet data regardless of whether reply succeeded
				await this.kvUtils.storeProcessedTweet(tweetData);
				processedCount++;
			}
			
			return { processed: processedCount, replied: repliedCount };
		} catch (error) {
			console.error('Error processing mentions:', error);
			throw error;
		}
	}
}