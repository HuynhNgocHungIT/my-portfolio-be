#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { sequelize } = require('../config/database');
const SeedDataGenerator = require('../utils/seedData');

/**
 * Seed database with sample data
 */
async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding process...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME || 'my_portfolio_db_0r2j'}`);

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database (create tables if they don't exist)
    console.log('🔄 Syncing database schema...');
    await sequelize.sync({ force: false });
    console.log('✅ Database schema synced successfully.');

    // Generate seed data
    const seeder = new SeedDataGenerator();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = parseArguments(args);

    if (options.demo) {
      console.log('🎭 Generating demo data only...');
      const transaction = await sequelize.transaction();
      try {
        await seeder.clearExistingData(transaction);
        await seeder.generateDemoUser(transaction);
        await transaction.commit();
        console.log('✅ Demo data generated successfully!');
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else {
      await seeder.generateSeedData(options);
    }

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed options
 */
function parseArguments(args) {
  const options = {
    userCount: 3,
    projectsPerUser: 8,
    postsPerUser: 12,
    skillsPerUser: 15,
    certificatesPerUser: 6,
    demo: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--users':
        options.userCount = parseInt(args[i + 1]) || options.userCount;
        i++;
        break;
      case '--projects':
        options.projectsPerUser = parseInt(args[i + 1]) || options.projectsPerUser;
        i++;
        break;
      case '--posts':
        options.postsPerUser = parseInt(args[i + 1]) || options.postsPerUser;
        i++;
        break;
      case '--skills':
        options.skillsPerUser = parseInt(args[i + 1]) || options.skillsPerUser;
        i++;
        break;
      case '--certificates':
        options.certificatesPerUser = parseInt(args[i + 1]) || options.certificatesPerUser;
        i++;
        break;
      case '--demo':
        options.demo = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
📚 Portfolio API Database Seeder

Usage: npm run seed [options]

Options:
  --users <number>        Number of users to generate (default: 3)
  --projects <number>     Number of projects per user (default: 8)
  --posts <number>        Number of posts per user (default: 12)
  --skills <number>       Number of skills per user (default: 15)
  --certificates <number> Number of certificates per user (default: 6)
  --demo                  Generate demo user only
  --help, -h              Show this help message

Examples:
  npm run seed                           # Generate default seed data
  npm run seed -- --users 5             # Generate 5 users with default content
  npm run seed -- --demo                # Generate demo user only
  npm run seed -- --users 2 --posts 20  # Generate 2 users with 20 posts each

Environment Variables:
  NODE_ENV                Database environment (development/production)
  DB_NAME                 Database name
  DB_USER                 Database user
  DB_PASSWORD             Database password
  DB_HOST                 Database host
  DB_PORT                 Database port
  `);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Closing database connection...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Closing database connection...');
  await sequelize.close();
  process.exit(0);
});

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, parseArguments };