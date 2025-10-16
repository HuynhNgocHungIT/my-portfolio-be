#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { sequelize, testConnection } = require('../config/database');

/**
 * Test database connection and check tables
 */
async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`🏠 Host: ${process.env.DB_HOST}`);
    console.log(`👤 User: ${process.env.DB_USERNAME}`);
    console.log(`🔌 Port: ${process.env.DB_PORT}`);
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed!');
      process.exit(1);
    }
    
    // Check if tables exist
    console.log('\n🔍 Checking database tables...');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (results.length === 0) {
      console.log('⚠️  No tables found! You need to run migrations first.');
      console.log('💡 Run: npm run migrate');
    } else {
      console.log('✅ Found tables:');
      results.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
      
      // Check if tables have data
      console.log('\n🔍 Checking table data...');
      for (const table of results) {
        try {
          const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
          const count = countResult[0].count;
          console.log(`   - ${table.table_name}: ${count} records`);
        } catch (error) {
          console.log(`   - ${table.table_name}: Error checking data`);
        }
      }
    }
    
    await sequelize.close();
    console.log('\n✅ Database test completed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };