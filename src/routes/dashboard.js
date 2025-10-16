const express = require('express');
const { query } = require('express-validator');
const dashboardController = require('../controllers/dashboardController');
const authGuard = require('../middlewares/authGuard');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalViews:
 *           type: integer
 *           description: Total views across all posts
 *         totalProjects:
 *           type: integer
 *           description: Total number of projects
 *         totalPosts:
 *           type: integer
 *           description: Total number of posts
 *         totalSkills:
 *           type: integer
 *           description: Total number of skills
 *         totalCertificates:
 *           type: integer
 *           description: Total number of certificates
 *         growthRates:
 *           type: object
 *           properties:
 *             projectsGrowth:
 *               type: number
 *               description: Projects growth percentage (30-day comparison)
 *             postsGrowth:
 *               type: number
 *               description: Posts growth percentage (30-day comparison)
 *             viewsGrowth:
 *               type: number
 *               description: Views growth percentage (30-day comparison)
 *         recentActivity:
 *           type: object
 *           properties:
 *             projectsAdded:
 *               type: integer
 *               description: Projects added in last 7 days
 *             postsPublished:
 *               type: integer
 *               description: Posts published in last 7 days
 *             skillsAdded:
 *               type: integer
 *               description: Skills added in last 7 days
 *             certificatesAdded:
 *               type: integer
 *               description: Certificates added in last 7 days
 *     WeeklyViewsData:
 *       type: object
 *       properties:
 *         week:
 *           type: string
 *           format: date
 *           description: Week start date (YYYY-MM-DD)
 *         views:
 *           type: integer
 *           description: Total views for that week
 *     ProjectsTimelineData:
 *       type: object
 *       properties:
 *         month:
 *           type: string
 *           description: Month (YYYY-MM)
 *         created:
 *           type: integer
 *           description: Projects created in that month
 *         completed:
 *           type: integer
 *           description: Projects completed in that month
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get comprehensive dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authGuard, dashboardController.getDashboardStats);

/**
 * @swagger
 * /api/dashboard/complete:
 *   get:
 *     summary: Get complete dashboard data (statistics + charts)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complete dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       $ref: '#/components/schemas/DashboardStats'
 *                     charts:
 *                       type: object
 *                       properties:
 *                         weeklyViews:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/WeeklyViewsData'
 *                         projectsTimeline:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ProjectsTimelineData'
 *                         skillsDistribution:
 *                           type: array
 *                         certificatesTimeline:
 *                           type: array
 *                     topPosts:
 *                       type: array
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/complete', authGuard, dashboardController.getCompleteDashboard);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary (lightweight version)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalViews:
 *                       type: integer
 *                     totalProjects:
 *                       type: integer
 *                     totalPosts:
 *                       type: integer
 *                     totalSkills:
 *                       type: integer
 *                     totalCertificates:
 *                       type: integer
 *                     recentActivity:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/summary', authGuard, dashboardController.getDashboardSummary);

/**
 * @swagger
 * /api/dashboard/weekly-views:
 *   get:
 *     summary: Get weekly views data for chart visualization
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: weeks
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 52
 *           default: 12
 *         description: Number of weeks to retrieve
 *     responses:
 *       200:
 *         description: Weekly views data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     weeklyViews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WeeklyViewsData'
 *       400:
 *         description: Invalid weeks parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/weekly-views', [
  authGuard,
  query('weeks')
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage('Weeks must be an integer between 1 and 52'),
  handleValidationErrors
], dashboardController.getWeeklyViews);

/**
 * @swagger
 * /api/dashboard/projects-timeline:
 *   get:
 *     summary: Get projects timeline data for chart visualization
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 12
 *         description: Number of months to retrieve
 *     responses:
 *       200:
 *         description: Projects timeline data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectsTimeline:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectsTimelineData'
 *       400:
 *         description: Invalid months parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/projects-timeline', [
  authGuard,
  query('months')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Months must be an integer between 1 and 24'),
  handleValidationErrors
], dashboardController.getProjectsTimeline);

/**
 * @swagger
 * /api/dashboard/skills-distribution:
 *   get:
 *     summary: Get skills distribution by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skills distribution data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     skillsDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           averageLevel:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/skills-distribution', authGuard, dashboardController.getSkillsDistribution);

/**
 * @swagger
 * /api/dashboard/certificates-timeline:
 *   get:
 *     summary: Get certificates timeline by year
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificates timeline data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     certificatesTimeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: integer
 *                           certificates:
 *                             type: integer
 *                           uniqueIssuers:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/certificates-timeline', authGuard, dashboardController.getCertificatesTimeline);

/**
 * @swagger
 * /api/dashboard/top-posts:
 *   get:
 *     summary: Get top performing posts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: Number of top posts to retrieve
 *     responses:
 *       200:
 *         description: Top posts data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     topPosts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           title:
 *                             type: string
 *                           views:
 *                             type: integer
 *                           publishedAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Invalid limit parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/top-posts', [
  authGuard,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be an integer between 1 and 20'),
  handleValidationErrors
], dashboardController.getTopPosts);

/**
 * @swagger
 * /api/dashboard/growth:
 *   get:
 *     summary: Get growth analytics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Growth analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     growthRates:
 *                       type: object
 *                       properties:
 *                         projectsGrowth:
 *                           type: number
 *                         postsGrowth:
 *                           type: number
 *                         viewsGrowth:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/growth', authGuard, dashboardController.getGrowthAnalytics);

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity (last 7 days)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     recentActivity:
 *                       type: object
 *                       properties:
 *                         projectsAdded:
 *                           type: integer
 *                         postsPublished:
 *                           type: integer
 *                         skillsAdded:
 *                           type: integer
 *                         certificatesAdded:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/recent-activity', authGuard, dashboardController.getRecentActivity);

module.exports = router;