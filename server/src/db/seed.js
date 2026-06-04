#!/usr/bin/env node
import { initDatabase, run } from '../db/database.js';

async function seedDatabase() {
  await initDatabase();

  console.log('📌 Seeding database...');

  // Add sample admin user (password: admin123)
  const adminPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36mB6DGm'; // bcrypt hash
  
  try {
    await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@wc2026.local', adminPassword, 'admin']
    );
    console.log('✅ Admin user created (username: admin, password: admin123)');
  } catch (err) {
    console.log('⚠️  Admin user already exists');
  }

  console.log('✅ Database seeded');
  process.exit(0);
}

seedDatabase().catch(console.error);
