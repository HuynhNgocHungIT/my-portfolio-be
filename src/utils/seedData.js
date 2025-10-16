const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User, Profile, About, Project, Post, Skill, Certificate } = require('../models');
const { 
  projectTemplates, 
  blogPostTemplates, 
  skillCategories, 
  certificateTemplates, 
  professionalProfiles 
} = require('./testDataTemplates');

class SeedDataGenerator {
  constructor() {
    this.users = [];
    this.profiles = [];
    this.projects = [];
    this.posts = [];
    this.skills = [];
    this.certificates = [];
  }

  /**
   * Generate seed data for all models
   * @param {Object} options - Seeding options
   * @returns {Promise<void>}
   */
  async generateSeedData(options = {}) {
    const {
      userCount = 3,
      projectsPerUser = 8,
      postsPerUser = 12,
      skillsPerUser = 15,
      certificatesPerUser = 6
    } = options;

    console.log('🌱 Starting seed data generation...');

    try {
      // Start transaction
      const transaction = await sequelize.transaction();

      try {
        // Clear existing data
        await this.clearExistingData(transaction);

        // Generate users and profiles
        await this.generateUsers(userCount, transaction);
        await this.generateProfiles(transaction);
        await this.generateAboutSections(transaction);

        // Generate content for each user
        for (const user of this.users) {
          await this.generateProjectsForUser(user.id, projectsPerUser, transaction);
          await this.generatePostsForUser(user.id, postsPerUser, transaction);
          await this.generateSkillsForUser(user.id, skillsPerUser, transaction);
          await this.generateCertificatesForUser(user.id, certificatesPerUser, transaction);
        }

        // Commit transaction
        await transaction.commit();

        console.log('✅ Seed data generation completed successfully!');
        console.log(`📊 Generated:`);
        console.log(`   - ${this.users.length} users`);
        console.log(`   - ${this.projects.length} projects`);
        console.log(`   - ${this.posts.length} posts`);
        console.log(`   - ${this.skills.length} skills`);
        console.log(`   - ${this.certificates.length} certificates`);

      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('❌ Seed data generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Clear existing data from all tables
   * @param {Object} transaction - Database transaction
   */
  async clearExistingData(transaction) {
    console.log('🧹 Clearing existing data...');
    
    // Delete in reverse order of dependencies
    await Certificate.destroy({ where: {}, transaction });
    await Skill.destroy({ where: {}, transaction });
    await Post.destroy({ where: {}, transaction });
    await Project.destroy({ where: {}, transaction });
    await About.destroy({ where: {}, transaction });
    await Profile.destroy({ where: {}, transaction });
    await User.destroy({ where: {}, transaction });
  }

  /**
   * Generate users
   * @param {number} count - Number of users to generate
   * @param {Object} transaction - Database transaction
   */
  async generateUsers(count, transaction) {
    console.log(`👥 Generating ${count} users...`);

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    for (let i = 0; i < count; i++) {
      const user = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: i === 0 ? 'admin' : 'user'
      }, { transaction });

      this.users.push(user);
    }
  }

  /**
   * Generate profiles for all users
   * @param {Object} transaction - Database transaction
   */
  async generateProfiles(transaction) {
    console.log('👤 Generating user profiles...');

    for (let i = 0; i < this.users.length; i++) {
      const user = this.users[i];
      
      // Use professional profile template for some users
      let profileData;
      if (i < professionalProfiles.length) {
        const template = professionalProfiles[i];
        profileData = {
          name: template.name,
          bio: template.bio,
          location: template.location
        };
      } else {
        profileData = {
          name: faker.person.fullName(),
          bio: faker.lorem.paragraph({ min: 2, max: 4 }),
          location: `${faker.location.city()}, ${faker.location.state()}, ${faker.location.countryCode()}`
        };
      }

      const username = faker.internet.userName().toLowerCase();
      
      const profile = await Profile.create({
        user_id: user.id,
        name: profileData.name,
        avatar: faker.image.avatar(),
        bio: profileData.bio,
        contact: {
          email: user.email,
          phone: faker.phone.number(),
          location: profileData.location
        },
        social_links: {
          github: `https://github.com/${username}`,
          linkedin: `https://linkedin.com/in/${username}`,
          twitter: `https://twitter.com/${username}`,
          portfolio: `https://${username}.dev`
        }
      }, { transaction });

      this.profiles.push(profile);
    }
  }

  /**
   * Generate about sections for all users
   * @param {Object} transaction - Database transaction
   */
  async generateAboutSections(transaction) {
    console.log('📝 Generating about sections...');

    for (let i = 0; i < this.users.length; i++) {
      const user = this.users[i];
      
      // Use professional highlights for some users
      let aboutData;
      if (i < professionalProfiles.length) {
        const template = professionalProfiles[i];
        aboutData = {
          introduction: `I'm a ${template.title.toLowerCase()} based in ${template.location}. ${template.bio}`,
          highlights: template.highlights
        };
      } else {
        aboutData = {
          introduction: faker.lorem.paragraphs({ min: 2, max: 3 }),
          highlights: [
            `${faker.number.int({ min: 2, max: 8 })}+ years of professional experience`,
            `Led ${faker.number.int({ min: 1, max: 5 })} major project launches`,
            `Contributed to ${faker.number.int({ min: 5, max: 20 })}+ open source projects`,
            `Mentored ${faker.number.int({ min: 3, max: 15 })} junior developers`
          ]
        };
      }

      await About.create({
        user_id: user.id,
        introduction: aboutData.introduction,
        highlights: aboutData.highlights,
        image: faker.image.url({ width: 800, height: 600 })
      }, { transaction });
    }
  }

  /**
   * Generate projects for a user
   * @param {string} userId - User ID
   * @param {number} count - Number of projects to generate
   * @param {Object} transaction - Database transaction
   */
  async generateProjectsForUser(userId, count, transaction) {
    const statuses = ['active', 'completed', 'archived'];
    const statusWeights = [0.3, 0.6, 0.1]; // 30% active, 60% completed, 10% archived

    for (let i = 0; i < count; i++) {
      // Use template for some projects, generate random for others
      let projectData;
      if (i < projectTemplates.length && faker.datatype.boolean(0.7)) {
        const template = projectTemplates[i % projectTemplates.length];
        projectData = {
          title: template.title,
          description: template.description,
          tags: template.tags
        };
      } else {
        // Generate random project
        const techStacks = [
          ['React', 'Node.js', 'MongoDB'],
          ['Vue.js', 'Express', 'PostgreSQL'],
          ['Angular', 'NestJS', 'MySQL'],
          ['Next.js', 'Prisma', 'SQLite'],
          ['Svelte', 'FastAPI', 'Redis'],
          ['React Native', 'Firebase', 'TypeScript'],
          ['Flutter', 'Django', 'Docker'],
          ['Laravel', 'PHP', 'MariaDB']
        ];

        const tags = faker.helpers.arrayElements(
          faker.helpers.arrayElement(techStacks),
          { min: 2, max: 5 }
        );

        projectData = {
          title: faker.lorem.words({ min: 2, max: 4 }),
          description: faker.lorem.paragraph({ min: 2, max: 4 }),
          tags: tags
        };
      }

      // Generate realistic creation date (weighted towards recent)
      const createdAt = faker.date.between({
        from: new Date(2022, 0, 1),
        to: new Date()
      });

      const project = await Project.create({
        user_id: userId,
        title: projectData.title,
        description: projectData.description,
        tags: projectData.tags,
        thumbnail: faker.image.url({ width: 800, height: 600 }),
        link: faker.internet.url(),
        status: faker.helpers.weightedArrayElement([
          { weight: statusWeights[0], value: statuses[0] },
          { weight: statusWeights[1], value: statuses[1] },
          { weight: statusWeights[2], value: statuses[2] }
        ]),
        created_at: createdAt
      }, { transaction });

      this.projects.push(project);
    }
  }

  /**
   * Generate posts for a user
   * @param {string} userId - User ID
   * @param {number} count - Number of posts to generate
   * @param {Object} transaction - Database transaction
   */
  async generatePostsForUser(userId, count, transaction) {
    const statuses = ['draft', 'published'];

    for (let i = 0; i < count; i++) {
      // Use template for some posts, generate random for others
      let postData;
      if (i < blogPostTemplates.length && faker.datatype.boolean(0.6)) {
        const template = blogPostTemplates[i % blogPostTemplates.length];
        postData = {
          title: template.title,
          content: this.generateBlogContent(template.content, template.category),
          tags: template.tags
        };
      } else {
        // Generate random post
        const topics = [
          'Web Development', 'Mobile Development', 'DevOps', 'Machine Learning',
          'Data Science', 'Cybersecurity', 'Cloud Computing', 'Blockchain',
          'UI/UX Design', 'Software Architecture', 'Testing', 'Performance'
        ];

        const tags = faker.helpers.arrayElements(topics, { min: 1, max: 3 });

        postData = {
          title: faker.lorem.sentence({ min: 4, max: 8 }),
          content: faker.lorem.paragraphs({ min: 6, max: 12 }),
          tags: tags
        };
      }

      const isPublished = faker.datatype.boolean(0.75); // 75% published
      const createdAt = faker.date.between({
        from: new Date(2022, 6, 1), // July 2022
        to: new Date()
      });

      // Generate realistic view counts based on publication date and quality
      let views = 0;
      if (isPublished) {
        const daysSincePublished = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
        const baseViews = faker.number.int({ min: 50, max: 500 });
        const timeMultiplier = Math.max(0.1, daysSincePublished / 30); // More views for older posts
        views = Math.floor(baseViews * timeMultiplier * faker.number.float({ min: 0.5, max: 2.0 }));
      }

      const post = await Post.create({
        user_id: userId,
        title: postData.title,
        content: postData.content,
        cover_image: faker.image.url({ width: 1200, height: 630 }),
        published_at: isPublished ? createdAt : null,
        tags: postData.tags,
        status: isPublished ? 'published' : 'draft',
        views: views,
        created_at: createdAt
      }, { transaction });

      this.posts.push(post);
    }
  }

  /**
   * Generate realistic blog content
   * @param {string} intro - Introduction paragraph
   * @param {string} category - Blog category
   * @returns {string} Full blog content
   */
  generateBlogContent(intro, category) {
    const sections = [
      "## Introduction\n\n" + intro,
      "## Key Concepts\n\n" + faker.lorem.paragraphs(2),
      "## Implementation Details\n\n" + faker.lorem.paragraphs(3),
      "## Best Practices\n\n" + faker.lorem.paragraphs(2),
      "## Common Pitfalls\n\n" + faker.lorem.paragraphs(2),
      "## Conclusion\n\n" + faker.lorem.paragraph()
    ];

    // Add code examples for technical posts
    if (['Backend Development', 'Frontend Development', 'DevOps'].includes(category)) {
      sections.splice(3, 0, "## Code Example\n\n```javascript\n" + this.generateCodeExample() + "\n```");
    }

    return sections.join("\n\n");
  }

  /**
   * Generate realistic code examples
   * @returns {string} Code example
   */
  generateCodeExample() {
    const examples = [
      `// Example API endpoint
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});`,
      `// React component with hooks
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner />;
  return <div>{user?.name}</div>;
};`,
      `# Docker configuration
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`
    ];

    return faker.helpers.arrayElement(examples);
  }

  /**
   * Generate skills for a user
   * @param {string} userId - User ID
   * @param {number} count - Number of skills to generate
   * @param {Object} transaction - Database transaction
   */
  async generateSkillsForUser(userId, count, transaction) {
    const usedSkills = new Set();
    const categories = Object.keys(skillCategories);
    
    // Ensure we have skills from different categories
    const skillsPerCategory = Math.floor(count / categories.length);
    const remainingSkills = count % categories.length;

    for (let catIndex = 0; catIndex < categories.length; catIndex++) {
      const category = categories[catIndex];
      const categorySkills = skillCategories[category];
      const skillsToGenerate = skillsPerCategory + (catIndex < remainingSkills ? 1 : 0);

      // Shuffle and select skills from this category
      const shuffledSkills = faker.helpers.shuffle(categorySkills);
      const selectedSkills = shuffledSkills.slice(0, Math.min(skillsToGenerate, categorySkills.length));

      for (const skillTemplate of selectedSkills) {
        if (usedSkills.has(skillTemplate.name)) continue;
        usedSkills.add(skillTemplate.name);

        // Generate level within the skill's typical range
        const [minLevel, maxLevel] = skillTemplate.level;
        const level = faker.number.int({ min: minLevel, max: maxLevel });

        const skill = await Skill.create({
          user_id: userId,
          name: skillTemplate.name,
          level: level,
          icon: `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${skillTemplate.icon}/${skillTemplate.icon}-original.svg`,
          category: category,
          created_at: faker.date.between({
            from: new Date(2021, 0, 1),
            to: new Date()
          })
        }, { transaction });

        this.skills.push(skill);
      }
    }
  }

  /**
   * Generate certificates for a user
   * @param {string} userId - User ID
   * @param {number} count - Number of certificates to generate
   * @param {Object} transaction - Database transaction
   */
  async generateCertificatesForUser(userId, count, transaction) {
    const usedCertifications = new Set();

    for (let i = 0; i < count; i++) {
      // Select a random certificate template
      const template = faker.helpers.arrayElement(certificateTemplates);
      const issuer = faker.helpers.arrayElement(template.issuers);
      
      // Get available certifications from this issuer
      const availableCerts = template.certifications.filter(cert => !usedCertifications.has(cert));
      
      if (availableCerts.length === 0) {
        // If no more certs from this template, try another
        continue;
      }

      const certification = faker.helpers.arrayElement(availableCerts);
      usedCertifications.add(certification);

      // Generate realistic issue date (weighted towards recent years)
      const issueDate = faker.date.between({
        from: new Date(2019, 0, 1),
        to: new Date()
      });

      const certificate = await Certificate.create({
        user_id: userId,
        title: certification,
        issuer: issuer,
        issue_date: issueDate,
        credential_url: faker.internet.url(),
        icon: this.generateCertificateIcon(issuer),
        created_at: faker.date.between({
          from: issueDate,
          to: new Date()
        })
      }, { transaction });

      this.certificates.push(certificate);
    }
  }

  /**
   * Generate realistic certificate icon URL
   * @param {string} issuer - Certificate issuer
   * @returns {string} Icon URL
   */
  generateCertificateIcon(issuer) {
    const iconMap = {
      'AWS': 'https://images.credly.com/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png',
      'Google Cloud': 'https://images.credly.com/images/6d0a2c0e-2b3a-4d71-9a9e-7c1c0c0e2b3a/image.png',
      'Microsoft': 'https://images.credly.com/images/4136ced8-75d5-4afb-8677-40b6236e2672/image.png',
      'Meta': 'https://images.credly.com/images/0d84d9d8-1e5a-4b3c-9c1a-2b3c4d5e6f7g/image.png',
      'Oracle': 'https://images.credly.com/images/f88d800c-5261-45c6-9515-0458e31c3e16/image.png',
      'Cisco': 'https://images.credly.com/images/af8c6b4e-fc31-47c4-8dcb-eb7a2065dc5b/image.png',
      'CompTIA': 'https://images.credly.com/images/74790a75-8451-400a-8536-92d792b5184a/image.png'
    };

    return iconMap[issuer] || `https://images.credly.com/images/${faker.string.uuid()}/cert.png`;
  }

  /**
   * Generate realistic demo user with comprehensive data
   * @param {Object} transaction - Database transaction
   */
  async generateDemoUser(transaction) {
    console.log('🎭 Generating demo user with realistic data...');

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('demo123', saltRounds);

    // Create demo user
    const demoUser = await User.create({
      email: 'demo@portfolio.com',
      password: hashedPassword,
      role: 'user'
    }, { transaction });

    // Create comprehensive profile
    await Profile.create({
      user_id: demoUser.id,
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Full-stack developer with 5+ years of experience building scalable web applications. Passionate about clean code, user experience, and emerging technologies.',
      contact: {
        email: 'demo@portfolio.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA'
      },
      social_links: {
        github: 'https://github.com/alexjohnson',
        linkedin: 'https://linkedin.com/in/alexjohnson',
        twitter: 'https://twitter.com/alexjohnson',
        portfolio: 'https://alexjohnson.dev'
      }
    }, { transaction });

    // Create about section
    await About.create({
      user_id: demoUser.id,
      introduction: 'I\'m a passionate full-stack developer who loves creating innovative solutions to complex problems. With expertise in modern web technologies and a keen eye for design, I build applications that are both functional and beautiful.',
      highlights: [
        '5+ years of professional development experience',
        'Led development of 3 major product launches',
        'Contributed to 15+ open source projects',
        'Mentored 10+ junior developers'
      ],
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'
    }, { transaction });

    return demoUser;
  }
}

module.exports = SeedDataGenerator;