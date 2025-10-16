require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  issuer: 'portfolio-api',
  audience: 'portfolio-users'
};

// Validate JWT configuration
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('❌ JWT_SECRET is required in production environment');
  process.exit(1);
}

if (jwtConfig.secret === 'your_super_secret_jwt_key_here' && process.env.NODE_ENV === 'production') {
  console.error('❌ Please set a secure JWT_SECRET in production environment');
  process.exit(1);
}

module.exports = jwtConfig;