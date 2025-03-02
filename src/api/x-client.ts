import { TwitterApi } from 'twitter-api-v2';

/**
 * XClient provides a wrapper around the Twitter API client
 * focused on the specific needs of Gethen Echo.
 */
export class XClient {
	private client: TwitterApi;
	private targetUsername: string;

	constructor(
        clientId: string,
        clientSecret: string,
        accessToken: string,  // This would be your OAuth 2.0 access token
        targetUsername: string
    ) {
        // Initialize with OAuth 2.0
        this.client = new TwitterApi(accessToken);
        this.targetUsername = targetUsername;
    }

	/**
	 * Get recent mentions of the target account
	 * 
	 * @param sinceId Only get mentions newer than this ID
	 * @returns Array of mentions
	 */
	async getRecentMentions(sinceId?: string) {
		try {
			const user = await this.client.v2.userByUsername(this.targetUsername);
			
			if (!user?.data?.id) {
				throw new Error(`Could not find user ID for username: ${this.targetUsername}`);
			}

			const userId = user.data.id;
			
			// Get mentions of the target user
			const mentions = await this.client.v2.search(
				`@${this.targetUsername}`,
				{
					'tweet.fields': ['author_id', 'created_at', 'conversation_id', 'in_reply_to_user_id'],
					'user.fields': ['username', 'name'],
					'expansions': ['author_id'],
					...(sinceId && { since_id: sinceId }),
					max_results: 100, // Maximum allowed by the API
				}
			);

			return mentions.data;
		} catch (error) {
			console.error('Error getting recent mentions:', error);
			throw error;
		}
	}

	/**
	 * Reply to a specific tweet
	 * 
	 * @param tweetId ID of the tweet to reply to
	 * @param message Reply message content
	 * @returns The created reply tweet
	 */
	async replyToTweet(tweetId: string, message: string) {
		try {
			const reply = await this.client.v2.reply(
				message,
				tweetId
			);
			
			return reply.data;
		} catch (error) {
			console.error(`Error replying to tweet ${tweetId}:`, error);
			throw error;
		}
	}
}