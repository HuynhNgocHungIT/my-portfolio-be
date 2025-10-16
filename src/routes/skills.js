const express = require('express');
const { body, param, query } = require('express-validator');
const skillController = require('../controllers/skillController');
const authGuard = require('../middlewares/authGuard');
const { handleValidationErrors, sanitizeBody } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Skill:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Skill unique identifier
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: Associated user ID
 *         name:
 *           type: string
 *           description: Skill name
 *         level:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           description: Skill proficiency level (1-100)
 *         icon:
 *           type: string
 *           description: Skill icon URL or identifier
 *         category:
 *           type: string
 *           description: Skill category
 *         created_at:
 *           type: string
 *           format: date-time
 *     SkillResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             skill:
 *               $ref: '#/components/schemas/Skill'
 *     SkillsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             skills:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
 */

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Get current user's skills
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [level, name, category, created_at]
 *           default: level
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillsResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', [
  authGuard,
  query('sortBy')
    .optional()
    .isIn(['level', 'name', 'category', 'created_at'])
    .withMessage('SortBy must be one of: level, name, category, created_at'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('SortOrder must be ASC or DESC'),
  query('category')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  handleValidationErrors
], skillController.getMySkills);

/**
 * @swagger
 * /api/skills/categories:
 *   get:
 *     summary: Get current user's skills grouped by category
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skills by category retrieved successfully
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
 *                     skillsByCategory:
 *                       type: object
 *                       additionalProperties:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Skill'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/categories', authGuard, skillController.getSkillsByCategory);

/**
 * @swagger
 * /api/skills/stats:
 *   get:
 *     summary: Get skill statistics for current user
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skill statistics retrieved successfully
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
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalSkills:
 *                           type: integer
 *                         averageLevel:
 *                           type: integer
 *                         categoriesCount:
 *                           type: integer
 *                         expertSkills:
 *                           type: integer
 *                         categories:
 *                           type: array
 *                           items:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', authGuard, skillController.getSkillStats);

/**
 * @swagger
 * /api/skills/user/{user_id}:
 *   get:
 *     summary: Get skills by user ID (public access)
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [level, name, category, created_at]
 *           default: level
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: User skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillsResponse'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/user/:user_id', [
  param('user_id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  query('sortBy')
    .optional()
    .isIn(['level', 'name', 'category', 'created_at'])
    .withMessage('SortBy must be one of: level, name, category, created_at'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('SortOrder must be ASC or DESC'),
  query('category')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  handleValidationErrors
], skillController.getSkillsByUserId);

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Create new skill
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - level
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 description: Skill name
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Skill proficiency level (1-100)
 *               icon:
 *                 type: string
 *                 description: Skill icon URL or identifier
 *               category:
 *                 type: string
 *                 maxLength: 100
 *                 description: Skill category
 *     responses:
 *       201:
 *         description: Skill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillResponse'
 *       400:
 *         description: Validation error
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
router.post('/', [
  authGuard,
  sanitizeBody,
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name is required and must be between 1 and 255 characters'),
  body('level')
    .isInt({ min: 1, max: 100 })
    .withMessage('Level is required and must be between 1 and 100'),
  body('icon')
    .optional()
    .isString()
    .trim()
    .withMessage('Icon must be a string'),
  body('category')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  handleValidationErrors
], skillController.createSkill);

/**
 * @swagger
 * /api/skills/{id}:
 *   get:
 *     summary: Get skill by ID
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Skill ID
 *     responses:
 *       200:
 *         description: Skill retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillResponse'
 *       400:
 *         description: Invalid skill ID format
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
 *       404:
 *         description: Skill not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', [
  authGuard,
  param('id')
    .isUUID()
    .withMessage('Skill ID must be a valid UUID'),
  handleValidationErrors
], skillController.getSkillById);

/**
 * @swagger
 * /api/skills/{id}:
 *   put:
 *     summary: Update skill by ID
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Skill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 description: Skill name
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Skill proficiency level (1-100)
 *               icon:
 *                 type: string
 *                 description: Skill icon URL or identifier
 *               category:
 *                 type: string
 *                 maxLength: 100
 *                 description: Skill category
 *     responses:
 *       200:
 *         description: Skill updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillResponse'
 *       400:
 *         description: Validation error
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
 *       404:
 *         description: Skill not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', [
  authGuard,
  sanitizeBody,
  param('id')
    .isUUID()
    .withMessage('Skill ID must be a valid UUID'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('level')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Level must be between 1 and 100'),
  body('icon')
    .optional()
    .isString()
    .trim()
    .withMessage('Icon must be a string'),
  body('category')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  handleValidationErrors
], skillController.updateSkill);

/**
 * @swagger
 * /api/skills/{id}:
 *   delete:
 *     summary: Delete skill by ID
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Skill ID
 *     responses:
 *       200:
 *         description: Skill deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid skill ID format
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
 *       404:
 *         description: Skill not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', [
  authGuard,
  param('id')
    .isUUID()
    .withMessage('Skill ID must be a valid UUID'),
  handleValidationErrors
], skillController.deleteSkill);

module.exports = router;