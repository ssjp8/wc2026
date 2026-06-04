import cron from 'node-cron';
import { fetchMatchesFromAPI } from './fetchMatches.js';

export function setupCronJobs() {
  // Fetch matches every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('📅 Running scheduled match fetch...');
    await fetchMatchesFromAPI();
  });

  // Initial fetch on startup
  fetchMatchesFromAPI();

  console.log('✅ Cron jobs initialized');
}
