const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Import all models here as they are created
const User = require('./User')(sequelize, DataTypes);
const Profile = require('./Profile')(sequelize, DataTypes);
const About = require('./About')(sequelize, DataTypes);
const Project = require('./Project')(sequelize, DataTypes);
const Post = require('./Post')(sequelize, DataTypes);
const Skill = require('./Skill')(sequelize, DataTypes);
const Certificate = require('./Certificate')(sequelize, DataTypes);

const db = {
  sequelize,
  Sequelize,
  // Add models here as they are created
  User,
  Profile,
  About,
  Project,
  Post,
  Skill,
  Certificate
};

// Define associations here when models are created
User.hasOne(Profile, { foreignKey: 'user_id', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(About, { foreignKey: 'user_id', as: 'about' });
About.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Skill, { foreignKey: 'user_id', as: 'skills' });
Skill.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Certificate, { foreignKey: 'user_id', as: 'certificates' });
Certificate.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = db;