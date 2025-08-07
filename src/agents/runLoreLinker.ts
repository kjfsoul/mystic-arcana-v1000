
import { LoreLinkerAgent } from './LoreLinkerAgent';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const testUrl = 'https://en.wikipedia.org/wiki/Astrology'; // Changed URL

const runTest = async () => {
  try {
    const agent = new LoreLinkerAgent();
    const result = await agent.processUrl(testUrl);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
};

runTest();
