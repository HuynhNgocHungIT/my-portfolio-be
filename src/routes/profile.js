const express = require('express');
const { body, param } = require('express-validator');
const profileController = require('../controllers/profileController');
const authGuard = require('../middlewares/authGuard');
const { handleValidationErrors, sanitizeBody } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Profile unique identifier
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: Associated user ID
 *         name:
 *           type: string
 *           description: User's display name
 *         avatar:
 *           type: string
 *           format: uri
 *           description: Avatar image URL
 *         bio:
 *           type: string
 *           description: User biography
 *         contact:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *             phone:
 *               type: string
 *             location:
 *               type: string
 *             website:
 *               type: string
 *               format: uri
 *         social_links:
 *           type: object
 *           properties:
 *             github:
 *               type: string
 *               format: uri
 *             linkedin:
 *               type: string
 *               format: uri
 *             twitter:
 *               type: string
 *               format: uri
 *             instagram:
 *               type: string
 *               format: uri
 *             facebook:
 *               type: string
 *               format: uri
 *             youtube:
 *               type: string
 *               format: uri
 *             portfolio:
 *               type: string
 *               format: uri
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     ProfileResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             profile:
 *               $ref: '#/components/schemas/Profile'
 */

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', authGuard, profileController.getMyProfile);

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
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
 *               avatar:
 *                 type: string
 *                 format: uri
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *               contact:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *                   location:
 *                     type: string
 *                   website:
 *                     type: string
 *                     format: uri
 *               social_links:
 *                 type: object
 *                 properties:
 *                   github:
 *                     type: string
 *                     format: uri
 *                   linkedin:
 *                     type: string
 *                     format: uri
 *                   twitter:
 *                     type: string
 *                     format: uri
 *                   instagram:
 *                     type: string
 *                     format: uri
 *                   facebook:
 *                     type: string
 *                     format: uri
 *                   youtube:
 *                     type: string
 *                     format: uri
 *                   portfolio:
 *                     type: string
 *                     format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
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
router.put('/me', [
  authGuard,
  sanitizeBody,
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('bio')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Bio must not exceed 2000 characters'),
  body('contact')
    .optional()
    .isObject()
    .withMessage('Contact must be an object'),
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Contact email must be valid'),
  body('contact.website')
    .optional()
    .isURL()
    .withMessage('Contact website must be a valid URL'),
  body('social_links')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),
  handleValidationErrors
], profileController.updateMyProfile);

/**
 * @swagger
 * /api/profile/{user_id}:
 *   get:
 *     summary: Get profile by user ID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:user_id', [
  param('user_id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  handleValidationErrors
], profileController.getProfile);

/**
 * @swagger
 * /api/profile/{user_id}:
 *   put:
 *     summary: Update profile by user ID
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
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
 *               avatar:
 *                 type: string
 *                 format: uri
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *               contact:
 *                 type: object
 *               social_links:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
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
 *       403:
 *         description: Forbidden - Can only update own profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:user_id', [
  authGuard,
  sanitizeBody,
  param('user_id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('bio')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Bio must not exceed 2000 characters'),
  body('contact')
    .optional()
    .isObject()
    .withMessage('Contact must be an object'),
  body('social_links')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),
  handleValidationErrors
], profileController.updateProfile);

/**
 * @swagger
 * /api/profile/{user_id}:
 *   post:
 *     summary: Create profile for user
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *               avatar:
 *                 type: string
 *                 format: uri
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *               contact:
 *                 type: object
 *               social_links:
 *                 type: object
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
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
 *       403:
 *         description: Forbidden - Can only create own profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Profile already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:user_id', [
  authGuard,
  sanitizeBody,
  param('user_id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name is required and must be between 1 and 255 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('bio')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Bio must not exceed 2000 characters'),
  body('contact')
    .optional()
    .isObject()
    .withMessage('Contact must be an object'),
  body('social_links')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),
  handleValidationErrors
], profileController.createProfile);

/**
 * @swagger
 * /api/profile/{user_id}:
 *   delete:
 *     summary: Delete profile by user ID
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Profile deleted successfully
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
 *         description: Invalid user ID format
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
 *       403:
 *         description: Forbidden - Can only delete own profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:user_id', [
  authGuard,
  param('user_id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  handleValidationErrors
], profileController.deleteProfile);

/**
 * @swagger
 * /api/profile/{user_id}/details:
 *   get:
 *     summary: Get profile with user information
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Profile with user details retrieved successfully
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
 *                     profile:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Profile'
 *                         - type: object
 *                           properties:
 *                             user:
 *                               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:user_id/details', [
  param('user_id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  handleValidationErrors
], profileController.getProfileWithUser);

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Get all profiles (admin only)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
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
 *                     profiles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Profile'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authGuard, profileController.getAllProfiles);

module.exports = router;