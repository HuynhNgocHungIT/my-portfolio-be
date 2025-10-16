#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { sequelize } = require('../config/database');
const { User, Profile } = require('../models');

/**
 * Simple seed test - just create one user
 */
async function simpleSeed() {
  try {
    console.log('🌱 Starting simple seed test...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Create a simple user
    const user = await User.create({
      email: 'test@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PqHd.G', // hashed 'password'
      role: 'user'
    });
    
    console.log('✅ User created:', user.id);
    
    // Create profile
    const profile = await Profile.create({
      user_id: user.id,
      name: 'Test User',
      bio: 'This is a test user',
      contact: {
        email: 'test@example.com',
        location: 'Test City'
      },
      social_links: {
        github: 'https://github.com/testuser'
      }
    });
    
    console.log('✅ Profile created:', profile.id);
    
    // Check if data exists
    const userCount = await User.count();
    const profileCount = await Profile.count();
    
    console.log(`📊 Total users: ${userCount}`);
    console.log(`📊 Total profiles: ${profileCount}`);
    
    await sequelize.close();
    console.log('🎉 Simple seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Simple seed failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the simple seed
if (require.main === module) {
  simpleSeed();
}

module.exports = { simpleSeed };