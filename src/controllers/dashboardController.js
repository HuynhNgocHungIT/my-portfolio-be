const dashboardService = require('../services/dashboardService');

class DashboardController {
  /**
   * Get comprehensive dashboard statistics
   * GET /api/dashboard
   */
  async getDashboardStats(req, res, next) {
    try {
      const userId = req.user.id;

      // Get comprehensive dashboard statistics
      const stats = await dashboardService.getDashboardStats(userId);

      res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: {
          statistics: stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complete dashboard data (stats + charts)
   * GET /api/dashboard/complete
   */
  async getCompleteDashboard(req, res, next) {
    try {
      const userId = req.user.id;

      // Get complete dashboard data
      const dashboardData = await dashboardService.getCompleteDashboard(userId);

      res.status(200).json({
        success: true,
        message: 'Complete dashboard data retrieved successfully',
        data: dashboardData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get weekly views data for chart visualization
   * GET /api/dashboard/weekly-views
   */
  async getWeeklyViews(req, res, next) {
    try {
      const userId = req.user.id;
      const { weeks = 12 } = req.query;

      // Validate weeks parameter
      const weeksNum = parseInt(weeks);
      if (isNaN(weeksNum) || weeksNum < 1 || weeksNum > 52) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Weeks parameter must be a number between 1 and 52',
            code: 'INVALID_WEEKS_PARAMETER'
          }
        });
      }

      // Get weekly views data
      const weeklyViews = await dashboardService.getWeeklyViews(userId, weeksNum);

      res.status(200).json({
        success: true,
        message: 'Weekly views data retrieved successfully',
        data: {
          weeklyViews
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get projects timeline data for chart visualization
   * GET /api/dashboard/projects-timeline
   */
  async getProjectsTimeline(req, res, next) {
    try {
      const userId = req.user.id;
      const { months = 12 } = req.query;

      // Validate months parameter
      const monthsNum = parseInt(months);
      if (isNaN(monthsNum) || monthsNum < 1 || monthsNum > 24) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Months parameter must be a number between 1 and 24',
            code: 'INVALID_MONTHS_PARAMETER'
          }
        });
      }

      // Get projects timeline data
      const projectsTimeline = await dashboardService.getProjectsTimeline(userId, monthsNum);

      res.status(200).json({
        success: true,
        message: 'Projects timeline data retrieved successfully',
        data: {
          projectsTimeline
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get skills distribution by category
   * GET /api/dashboard/skills-distribution
   */
  async getSkillsDistribution(req, res, next) {
    try {
      const userId = req.user.id;

      // Get skills distribution data
      const skillsDistribution = await dashboardService.getSkillsDistribution(userId);

      res.status(200).json({
        success: true,
        message: 'Skills distribution data retrieved successfully',
        data: {
          skillsDistribution
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get certificates timeline by year
   * GET /api/dashboard/certificates-timeline
   */
  async getCertificatesTimeline(req, res, next) {
    try {
      const userId = req.user.id;

      // Get certificates timeline data
      const certificatesTimeline = await dashboardService.getCertificatesTimeline(userId);

      res.status(200).json({
        success: true,
        message: 'Certificates timeline data retrieved successfully',
        data: {
          certificatesTimeline
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top performing posts
   * GET /api/dashboard/top-posts
   */
  async getTopPosts(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 5 } = req.query;

      // Validate limit parameter
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 20) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Limit parameter must be a number between 1 and 20',
            code: 'INVALID_LIMIT_PARAMETER'
          }
        });
      }

      // Get top posts data
      const topPosts = await dashboardService.getTopPosts(userId, limitNum);

      res.status(200).json({
        success: true,
        message: 'Top posts data retrieved successfully',
        data: {
          topPosts
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get growth analytics
   * GET /api/dashboard/growth
   */
  async getGrowthAnalytics(req, res, next) {
    try {
      const userId = req.user.id;

      // Get growth rates
      const growthRates = await dashboardService.calculateGrowthRates(userId);

      res.status(200).json({
        success: true,
        message: 'Growth analytics retrieved successfully',
        data: {
          growthRates
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent activity (last 7 days)
   * GET /api/dashboard/recent-activity
   */
  async getRecentActivity(req, res, next) {
    try {
      const userId = req.user.id;

      // Get recent activity
      const recentActivity = await dashboardService.getRecentActivity(userId);

      res.status(200).json({
        success: true,
        message: 'Recent activity retrieved successfully',
        data: {
          recentActivity
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard summary (lightweight version)
   * GET /api/dashboard/summary
   */
  async getDashboardSummary(req, res, next) {
    try {
      const userId = req.user.id;

      // Get basic stats and recent activity only
      const [stats, recentActivity] = await Promise.all([
        dashboardService.getDashboardStats(userId),
        dashboardService.getRecentActivity(userId)
      ]);

      res.status(200).json({
        success: true,
        message: 'Dashboard summary retrieved successfully',
        data: {
          totalViews: stats.totalViews,
          totalProjects: stats.totalProjects,
          totalPosts: stats.totalPosts,
          totalSkills: stats.totalSkills,
          totalCertificates: stats.totalCertificates,
          recentActivity
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();