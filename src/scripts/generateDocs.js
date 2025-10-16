#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { generateSpecFile } = require('../config/swagger');

/**
 * Generate OpenAPI specification file
 */
function generateApiDocs() {
  try {
    console.log('📚 Generating OpenAPI specification...');
    
    const outputPath = path.join(__dirname, '../../docs/swagger.json');
    
    // Ensure docs directory exists
    const fs = require('fs');
    const docsDir = path.dirname(outputPath);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Generate specification file
    generateSpecFile(outputPath);
    
    console.log('✅ API documentation generated successfully!');
    console.log(`📄 Specification file: ${outputPath}`);
    console.log('🌐 Start the server and visit /api-docs to view the interactive documentation');
    
  } catch (error) {
    console.error('❌ Failed to generate API documentation:', error.message);
    process.exit(1);
  }
}

// Run the generator
if (require.main === module) {
  generateApiDocs();
}

module.exports = { generateApiDocs };