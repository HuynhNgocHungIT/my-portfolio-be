/**
 * Comprehensive test data templates for realistic portfolio content
 */

const projectTemplates = [
  {
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution built with React and Node.js, featuring user authentication, payment processing, inventory management, and admin dashboard. Implemented with microservices architecture for scalability.",
    tags: ["React", "Node.js", "MongoDB", "Stripe", "Docker"],
    category: "Web Application"
  },
  {
    title: "Task Management App",
    description: "A collaborative project management tool with real-time updates, drag-and-drop functionality, team collaboration features, and advanced reporting. Built using modern web technologies with focus on user experience.",
    tags: ["Vue.js", "Express", "Socket.io", "PostgreSQL", "Redis"],
    category: "Productivity"
  },
  {
    title: "Weather Dashboard",
    description: "A responsive weather application that provides real-time weather data, forecasts, and interactive maps. Features location-based services, data visualization, and offline capabilities using service workers.",
    tags: ["JavaScript", "Chart.js", "PWA", "API Integration"],
    category: "Data Visualization"
  },
  {
    title: "Social Media Analytics",
    description: "A comprehensive analytics platform for social media management with sentiment analysis, engagement tracking, and automated reporting. Processes large datasets using machine learning algorithms.",
    tags: ["Python", "Django", "TensorFlow", "PostgreSQL", "Celery"],
    category: "Analytics"
  },
  {
    title: "Mobile Fitness Tracker",
    description: "Cross-platform mobile application for fitness tracking with workout planning, progress monitoring, social features, and integration with wearable devices. Built with React Native for iOS and Android.",
    tags: ["React Native", "Firebase", "Redux", "Health APIs"],
    category: "Mobile App"
  },
  {
    title: "AI Chatbot Platform",
    description: "An intelligent chatbot platform with natural language processing, multi-language support, and integration capabilities. Features machine learning models for improved conversation quality.",
    tags: ["Python", "NLP", "TensorFlow", "FastAPI", "Docker"],
    category: "AI/ML"
  },
  {
    title: "Blockchain Voting System",
    description: "A secure and transparent voting system built on blockchain technology, ensuring immutable records and voter privacy. Includes smart contracts and decentralized architecture.",
    tags: ["Solidity", "Web3.js", "Ethereum", "React", "IPFS"],
    category: "Blockchain"
  },
  {
    title: "Real Estate Platform",
    description: "A comprehensive real estate marketplace with property listings, virtual tours, mortgage calculators, and agent management. Features advanced search and recommendation algorithms.",
    tags: ["Next.js", "Prisma", "PostgreSQL", "Stripe", "MapBox"],
    category: "Marketplace"
  }
];

const blogPostTemplates = [
  {
    title: "Building Scalable Microservices with Node.js",
    content: "Microservices architecture has become increasingly popular for building large-scale applications. In this comprehensive guide, we'll explore how to design, implement, and deploy microservices using Node.js...",
    tags: ["Node.js", "Microservices", "Architecture"],
    category: "Backend Development"
  },
  {
    title: "Modern React Patterns and Best Practices",
    content: "React has evolved significantly over the years, introducing new patterns and best practices. This article covers the latest React patterns including hooks, context, and performance optimization techniques...",
    tags: ["React", "JavaScript", "Frontend"],
    category: "Frontend Development"
  },
  {
    title: "Database Optimization Strategies for High-Traffic Applications",
    content: "As your application grows, database performance becomes crucial. Learn about indexing strategies, query optimization, caching mechanisms, and database scaling techniques...",
    tags: ["Database", "Performance", "PostgreSQL"],
    category: "Database"
  },
  {
    title: "DevOps Best Practices: CI/CD Pipeline Implementation",
    content: "Implementing a robust CI/CD pipeline is essential for modern software development. This guide covers setting up automated testing, deployment strategies, and monitoring...",
    tags: ["DevOps", "CI/CD", "Docker"],
    category: "DevOps"
  },
  {
    title: "Machine Learning in Web Applications",
    content: "Integrating machine learning models into web applications opens up new possibilities. Learn how to deploy ML models, handle real-time predictions, and optimize performance...",
    tags: ["Machine Learning", "Python", "TensorFlow"],
    category: "AI/ML"
  },
  {
    title: "Security Best Practices for Modern Web Applications",
    content: "Web application security is more important than ever. This comprehensive guide covers authentication, authorization, data protection, and common security vulnerabilities...",
    tags: ["Security", "Authentication", "Web Development"],
    category: "Security"
  },
  {
    title: "Building Progressive Web Apps with Service Workers",
    content: "Progressive Web Apps provide native app-like experiences on the web. Learn how to implement service workers, offline functionality, and push notifications...",
    tags: ["PWA", "Service Workers", "JavaScript"],
    category: "Web Development"
  },
  {
    title: "GraphQL vs REST: Choosing the Right API Architecture",
    content: "Both GraphQL and REST have their strengths and use cases. This article provides a detailed comparison to help you choose the right API architecture for your project...",
    tags: ["GraphQL", "REST", "API Design"],
    category: "API Development"
  }
];

const skillCategories = {
  "Frontend Development": [
    { name: "React", level: [70, 95], icon: "react" },
    { name: "Vue.js", level: [60, 90], icon: "vuejs" },
    { name: "Angular", level: [50, 85], icon: "angular" },
    { name: "JavaScript", level: [80, 98], icon: "javascript" },
    { name: "TypeScript", level: [70, 95], icon: "typescript" },
    { name: "HTML5", level: [85, 98], icon: "html5" },
    { name: "CSS3", level: [80, 95], icon: "css3" },
    { name: "Sass", level: [70, 90], icon: "sass" },
    { name: "Tailwind CSS", level: [60, 88], icon: "tailwindcss" },
    { name: "Next.js", level: [65, 90], icon: "nextjs" }
  ],
  "Backend Development": [
    { name: "Node.js", level: [75, 95], icon: "nodejs" },
    { name: "Python", level: [70, 92], icon: "python" },
    { name: "Java", level: [60, 88], icon: "java" },
    { name: "C#", level: [55, 85], icon: "csharp" },
    { name: "PHP", level: [50, 80], icon: "php" },
    { name: "Ruby", level: [45, 75], icon: "ruby" },
    { name: "Go", level: [40, 70], icon: "go" },
    { name: "Rust", level: [35, 65], icon: "rust" },
    { name: "Express.js", level: [70, 90], icon: "express" },
    { name: "Django", level: [60, 85], icon: "django" }
  ],
  "Database & Storage": [
    { name: "PostgreSQL", level: [70, 90], icon: "postgresql" },
    { name: "MongoDB", level: [65, 88], icon: "mongodb" },
    { name: "MySQL", level: [60, 85], icon: "mysql" },
    { name: "Redis", level: [55, 80], icon: "redis" },
    { name: "Elasticsearch", level: [45, 75], icon: "elasticsearch" },
    { name: "SQLite", level: [70, 85], icon: "sqlite" },
    { name: "Firebase", level: [60, 82], icon: "firebase" },
    { name: "Supabase", level: [50, 75], icon: "supabase" }
  ],
  "DevOps & Cloud": [
    { name: "Docker", level: [65, 88], icon: "docker" },
    { name: "Kubernetes", level: [50, 80], icon: "kubernetes" },
    { name: "AWS", level: [60, 85], icon: "amazonwebservices" },
    { name: "Azure", level: [45, 75], icon: "azure" },
    { name: "Google Cloud", level: [40, 70], icon: "googlecloud" },
    { name: "Jenkins", level: [55, 78], icon: "jenkins" },
    { name: "GitLab CI", level: [50, 75], icon: "gitlab" },
    { name: "Terraform", level: [45, 70], icon: "terraform" },
    { name: "Nginx", level: [60, 80], icon: "nginx" }
  ],
  "Mobile Development": [
    { name: "React Native", level: [60, 85], icon: "react" },
    { name: "Flutter", level: [55, 80], icon: "flutter" },
    { name: "Swift", level: [50, 75], icon: "swift" },
    { name: "Kotlin", level: [45, 70], icon: "kotlin" },
    { name: "Xamarin", level: [40, 65], icon: "xamarin" },
    { name: "Ionic", level: [50, 75], icon: "ionic" }
  ],
  "Tools & Others": [
    { name: "Git", level: [85, 98], icon: "git" },
    { name: "VS Code", level: [90, 98], icon: "vscode" },
    { name: "Figma", level: [60, 85], icon: "figma" },
    { name: "Postman", level: [75, 90], icon: "postman" },
    { name: "Jira", level: [65, 85], icon: "jira" },
    { name: "Slack", level: [80, 95], icon: "slack" },
    { name: "Notion", level: [70, 88], icon: "notion" },
    { name: "Linear", level: [60, 80], icon: "linear" }
  ]
};

const certificateTemplates = [
  {
    issuers: ["AWS", "Amazon Web Services"],
    certifications: [
      "AWS Certified Solutions Architect - Associate",
      "AWS Certified Developer - Associate",
      "AWS Certified SysOps Administrator - Associate",
      "AWS Certified Solutions Architect - Professional",
      "AWS Certified DevOps Engineer - Professional"
    ]
  },
  {
    issuers: ["Google Cloud", "Google"],
    certifications: [
      "Google Cloud Professional Cloud Architect",
      "Google Cloud Professional Data Engineer",
      "Google Cloud Professional DevOps Engineer",
      "Google Cloud Associate Cloud Engineer"
    ]
  },
  {
    issuers: ["Microsoft", "Microsoft Azure"],
    certifications: [
      "Microsoft Azure Fundamentals",
      "Microsoft Azure Developer Associate",
      "Microsoft Azure Solutions Architect Expert",
      "Microsoft Azure DevOps Engineer Expert"
    ]
  },
  {
    issuers: ["Meta", "Facebook"],
    certifications: [
      "Meta Front-End Developer Certificate",
      "Meta Back-End Developer Certificate",
      "Meta Full-Stack Engineer Certificate",
      "Meta React Native Specialist"
    ]
  },
  {
    issuers: ["Oracle"],
    certifications: [
      "Oracle Certified Professional Java SE Developer",
      "Oracle Database SQL Certified Associate",
      "Oracle Cloud Infrastructure Architect Associate"
    ]
  },
  {
    issuers: ["Cisco"],
    certifications: [
      "Cisco Certified Network Associate (CCNA)",
      "Cisco Certified Network Professional (CCNP)",
      "Cisco DevNet Associate"
    ]
  },
  {
    issuers: ["CompTIA"],
    certifications: [
      "CompTIA Security+",
      "CompTIA Network+",
      "CompTIA A+",
      "CompTIA Cloud+"
    ]
  },
  {
    issuers: ["Coursera", "Stanford University"],
    certifications: [
      "Machine Learning Specialization",
      "Deep Learning Specialization",
      "Data Science Professional Certificate",
      "Full-Stack Web Development Specialization"
    ]
  }
];

const professionalProfiles = [
  {
    name: "Alex Johnson",
    title: "Full-Stack Developer",
    bio: "Passionate full-stack developer with 5+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies. Love solving complex problems and mentoring junior developers.",
    location: "San Francisco, CA",
    highlights: [
      "Led development of 3 major product launches",
      "Reduced application load time by 60% through optimization",
      "Mentored 10+ junior developers",
      "Contributed to 15+ open source projects"
    ]
  },
  {
    name: "Sarah Chen",
    title: "Senior Frontend Engineer",
    bio: "Creative frontend engineer specializing in React and modern JavaScript. Passionate about user experience, accessibility, and performance optimization. Strong advocate for clean code and best practices.",
    location: "New York, NY",
    highlights: [
      "Improved user engagement by 40% through UX enhancements",
      "Built design system used across 5 product teams",
      "Speaker at 3 major tech conferences",
      "Accessibility champion with WCAG 2.1 expertise"
    ]
  },
  {
    name: "Michael Rodriguez",
    title: "DevOps Engineer",
    bio: "Experienced DevOps engineer focused on automation, scalability, and reliability. Expert in containerization, CI/CD pipelines, and cloud infrastructure. Passionate about improving developer productivity.",
    location: "Austin, TX",
    highlights: [
      "Reduced deployment time from hours to minutes",
      "Achieved 99.9% uptime across all services",
      "Automated 80% of manual deployment processes",
      "Saved company $100K annually through cloud optimization"
    ]
  }
];

module.exports = {
  projectTemplates,
  blogPostTemplates,
  skillCategories,
  certificateTemplates,
  professionalProfiles
};