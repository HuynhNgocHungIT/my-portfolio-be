const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const { Project, Post, Skill, Certificate } = require('../models');

class DashboardService {
  /**
   * Get comprehensive dashboard statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(userId) {
    try {
      // Get basic counts
      const [totalProjects, totalPosts, totalSkills, totalCertificates] = await Promise.all([
        Project.count({ where: { user_id: userId } }),
        Post.count({ where: { user_id: userId } }),
        Skill.count({ where: { user_id: userId } }),
        Certificate.count({ where: { user_id: userId } })
      ]);

      // Get total views from posts
      const totalViewsResult = await Post.sum('views', { where: { user_id: userId } });
      const totalViews = totalViewsResult || 0;

      // Calculate growth rates (comparing last 30 days vs previous 30 days)
      const growthStats = await this.calculateGrowthRates(userId);

      // Get recent activity counts (last 7 days)
      const recentActivity = await this.getRecentActivity(userId);

      return {
        totalViews,
        totalProjects,
        totalPosts,
        totalSkills,
        totalCertificates,
        growthRates: growthStats,
        recentActivity
      };
    } catch (error) {
      throw new Error(`Failed to retrieve dashboard statistics: ${error.message}`);
    }
  }

  /**
   * Calculate growth rates for various metrics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Growth rate statistics
   */
  async calculateGrowthRates(userId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Projects growth
      const [recentProjects, previousProjects] = await Promise.all([
        Project.count({
          where: {
            user_id: userId,
            created_at: { [sequelize.Sequelize.Op.gte]: thirtyDaysAgo }
          }
        }),
        Project.count({
          where: {
            user_id: userId,
            created_at: {
              [sequelize.Sequelize.Op.gte]: sixtyDaysAgo,
              [sequelize.Sequelize.Op.lt]: thirtyDaysAgo
            }
          }
        })
      ]);

      // Posts growth
      const [recentPosts, previousPosts] = await Promise.all([
        Post.count({
          where: {
            user_id: userId,
            created_at: { [sequelize.Sequelize.Op.gte]: thirtyDaysAgo }
          }
        }),
        Post.count({
          where: {
            user_id: userId,
            created_at: {
              [sequelize.Sequelize.Op.gte]: sixtyDaysAgo,
              [sequelize.Sequelize.Op.lt]: thirtyDaysAgo
            }
          }
        })
      ]);

      // Views growth (from posts published in the periods)
      const [recentViews, previousViews] = await Promise.all([
        Post.sum('views', {
          where: {
            user_id: userId,
            published_at: { [sequelize.Sequelize.Op.gte]: thirtyDaysAgo }
          }
        }) || 0,
        Post.sum('views', {
          where: {
            user_id: userId,
            published_at: {
              [sequelize.Sequelize.Op.gte]: sixtyDaysAgo,
              [sequelize.Sequelize.Op.lt]: thirtyDaysAgo
            }
          }
        }) || 0
      ]);

      return {
        projectsGrowth: this.calculatePercentageGrowth(recentProjects, previousProjects),
        postsGrowth: this.calculatePercentageGrowth(recentPosts, previousPosts),
        viewsGrowth: this.calculatePercentageGrowth(recentViews, previousViews)
      };
    } catch (error) {
      throw new Error(`Failed to calculate growth rates: ${error.message}`);
    }
  }

  /**
   * Get recent activity (last 7 days)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Recent activity statistics
   */
  async getRecentActivity(userId) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [recentProjects, recentPosts, recentSkills, recentCertificates] = await Promise.all([
        Project.count({
          where: {
            user_id: userId,
            created_at: { [sequelize.Sequelize.Op.gte]: sevenDaysAgo }
          }
        }),
        Post.count({
          where: {
            user_id: userId,
            created_at: { [sequelize.Sequelize.Op.gte]: sevenDaysAgo }
          }
        }),
        Skill.count({
          where: {
            user_id: userId,
            created_at: { [sequelize.Sequelize.Op.gte]: sevenDaysAgo }
          }
        }),
        Certificate.count({
          where: {
            user_id: userId,
            created_at: { [sequelize.Sequelize.Op.gte]: sevenDaysAgo }
          }
        })
      ]);

      return {
        projectsAdded: recentProjects,
        postsPublished: recentPosts,
        skillsAdded: recentSkills,
        certificatesAdded: recentCertificates
      };
    } catch (error) {
      throw new Error(`Failed to retrieve recent activity: ${error.message}`);
    }
  }

  /**
   * Get weekly views data for chart visualization
   * @param {string} userId - User ID
   * @param {number} weeks - Number of weeks to retrieve (default: 12)
   * @returns {Promise<Array>} Weekly views data
   */
  async getWeeklyViews(userId, weeks = 12) {
    try {
      const query = `
        WITH RECURSIVE week_series AS (
          SELECT 
            DATE_TRUNC('week', CURRENT_DATE - INTERVAL '${weeks - 1} weeks') AS week_start,
            0 as week_number
          UNION ALL
          SELECT 
            week_start + INTERVAL '1 week',
            week_number + 1
          FROM week_series
          WHERE week_number < ${weeks - 1}
        ),
        weekly_views AS (
          SELECT 
            DATE_TRUNC('week', p.published_at) AS week_start,
            COALESCE(SUM(p.views), 0) AS total_views
          FROM posts p
          WHERE p.user_id = :userId
            AND p.published_at >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '${weeks - 1} weeks')
            AND p.status = 'published'
          GROUP BY DATE_TRUNC('week', p.published_at)
        )
        SELECT 
          ws.week_start,
          TO_CHAR(ws.week_start, 'YYYY-MM-DD') AS week,
          COALESCE(wv.total_views, 0) AS views
        FROM week_series ws
        LEFT JOIN weekly_views wv ON ws.week_start = wv.week_start
        ORDER BY ws.week_start;
      `;

      const results = await sequelize.query(query, {
        replacements: { userId },
        type: QueryTypes.SELECT
      });

      return results.map(row => ({
        week: row.week,
        views: parseInt(row.views) || 0
      }));
    } catch (error) {
      throw new Error(`Failed to retrieve weekly views: ${error.message}`);
    }
  }

  /**
   * Get projects timeline data for chart visualization
   * @param {string} userId - User ID
   * @param {number} months - Number of months to retrieve (default: 12)
   * @returns {Promise<Array>} Projects timeline data
   */
  async getProjectsTimeline(userId, months = 12) {
    try {
      const query = `
        WITH RECURSIVE month_series AS (
          SELECT 
            DATE_TRUNC('month', CURRENT_DATE - INTERVAL '${months - 1} months') AS month_start,
            0 as month_number
          UNION ALL
          SELECT 
            month_start + INTERVAL '1 month',
            month_number + 1
          FROM month_series
          WHERE month_number < ${months - 1}
        ),
        monthly_projects AS (
          SELECT 
            DATE_TRUNC('month', p.created_at) AS month_start,
            COUNT(*) AS projects_created,
            COUNT(CASE WHEN p.status = 'completed' THEN 1 END) AS projects_completed
          FROM projects p
          WHERE p.user_id = :userId
            AND p.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '${months - 1} months')
          GROUP BY DATE_TRUNC('month', p.created_at)
        )
        SELECT 
          ms.month_start,
          TO_CHAR(ms.month_start, 'YYYY-MM') AS month,
          COALESCE(mp.projects_created, 0) AS created,
          COALESCE(mp.projects_completed, 0) AS completed
        FROM month_series ms
        LEFT JOIN monthly_projects mp ON ms.month_start = mp.month_start
        ORDER BY ms.month_start;
      `;

      const results = await sequelize.query(query, {
        replacements: { userId },
        type: QueryTypes.SELECT
      });

      return results.map(row => ({
        month: row.month,
        created: parseInt(row.created) || 0,
        completed: parseInt(row.completed) || 0
      }));
    } catch (error) {
      throw new Error(`Failed to retrieve projects timeline: ${error.message}`);
    }
  }

  /**
   * Get skills distribution by category
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Skills distribution data
   */
  async getSkillsDistribution(userId) {
    try {
      const query = `
        SELECT 
          COALESCE(category, 'Uncategorized') AS category,
          COUNT(*) AS count,
          ROUND(AVG(level), 1) AS average_level
        FROM skills
        WHERE user_id = :userId
        GROUP BY category
        ORDER BY count DESC, average_level DESC;
      `;

      const results = await sequelize.query(query, {
        replacements: { userId },
        type: QueryTypes.SELECT
      });

      return results.map(row => ({
        category: row.category,
        count: parseInt(row.count),
        averageLevel: parseFloat(row.average_level) || 0
      }));
    } catch (error) {
      throw new Error(`Failed to retrieve skills distribution: ${error.message}`);
    }
  }

  /**
   * Get certificates timeline by year
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Certificates timeline data
   */
  async getCertificatesTimeline(userId) {
    try {
      const query = `
        SELECT 
          EXTRACT(YEAR FROM issue_date) AS year,
          COUNT(*) AS certificates_count,
          COUNT(DISTINCT issuer) AS unique_issuers
        FROM certificates
        WHERE user_id = :userId
        GROUP BY EXTRACT(YEAR FROM issue_date)
        ORDER BY year DESC
        LIMIT 10;
      `;

      const results = await sequelize.query(query, {
        replacements: { userId },
        type: QueryTypes.SELECT
      });

      return results.map(row => ({
        year: parseInt(row.year),
        certificates: parseInt(row.certificates_count),
        uniqueIssuers: parseInt(row.unique_issuers)
      }));
    } catch (error) {
      throw new Error(`Failed to retrieve certificates timeline: ${error.message}`);
    }
  }

  /**
   * Get top performing posts
   * @param {string} userId - User ID
   * @param {number} limit - Number of posts to retrieve (default: 5)
   * @returns {Promise<Array>} Top performing posts
   */
  async getTopPosts(userId, limit = 5) {
    try {
      const posts = await Post.findAll({
        where: {
          user_id: userId,
          status: 'published'
        },
        order: [['views', 'DESC']],
        limit,
        attributes: ['id', 'title', 'views', 'published_at']
      });

      return posts.map(post => ({
        id: post.id,
        title: post.title,
        views: post.views,
        publishedAt: post.published_at
      }));
    } catch (error) {
      throw new Error(`Failed to retrieve top posts: ${error.message}`);
    }
  }

  /**
   * Calculate percentage growth between two values
   * @param {number} current - Current period value
   * @param {number} previous - Previous period value
   * @returns {number} Percentage growth (can be negative)
   */
  calculatePercentageGrowth(current, previous) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Get comprehensive dashboard data in one call
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Complete dashboard data
   */
  async getCompleteDashboard(userId) {
    try {
      const [
        stats,
        weeklyViews,
        projectsTimeline,
        skillsDistribution,
        certificatesTimeline,
        topPosts
      ] = await Promise.all([
        this.getDashboardStats(userId),
        this.getWeeklyViews(userId),
        this.getProjectsTimeline(userId),
        this.getSkillsDistribution(userId),
        this.getCertificatesTimeline(userId),
        this.getTopPosts(userId)
      ]);

      return {
        statistics: stats,
        charts: {
          weeklyViews,
          projectsTimeline,
          skillsDistribution,
          certificatesTimeline
        },
        topPosts
      };
    } catch (error) {
      throw new Error(`Failed to retrieve complete dashboard: ${error.message}`);
    }
  }
}

module.exports = new DashboardService();