export interface Env {
    PROCESSED_TWEETS: KVNamespace;
    X_API_KEY: string;
    X_API_SECRET: string;
    X_ACCESS_TOKEN: string;
    X_ACCESS_SECRET: string;
    TARGET_ACCOUNT: string;
    REPLY_MESSAGE: string;
  }
  
  export interface ProcessedTweet {
    id: string;
    processedAt: string;
  }