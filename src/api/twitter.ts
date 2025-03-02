import { TwitterApi } from 'twitter-api-v2';
import type { Env } from '../types';

export function createTwitterClient(env: Env) {
  // We'll implement this fully in Step 2
  return new TwitterApi({
    appKey: env.X_API_KEY,
    appSecret: env.X_API_SECRET,
    accessToken: env.X_ACCESS_TOKEN,
    accessSecret: env.X_ACCESS_SECRET,
  });
}