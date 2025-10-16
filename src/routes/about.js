const express = require('express');
const { body, param } = require('express-validator');
const aboutController = require('../controllers/aboutController');
const authGuard = require('../middlewares/authGuard');
const { handleValidationErrors, sanitizeBody } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     About:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: About unique identifier
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: Associated user ID
 *         introduction:
 *           type: string
 *           description: Introduction text
 *         highlights:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of highlight strings
 *         image:
 *           type: string
 *           format: uri
 *           description: About section image URL
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     AboutResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             about:
 *               $ref: '#/components/schemas/About'
 */

/**
 * @swagger
 * /api/about:
 *   get:
 *     summary: Get about information for authenticated user
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: About information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: About information not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authGuard, aboutController.getAbout);

/**
 * @swagger
 * /api/about:
 *   put:
 *     summary: Update about information for authenticated user
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - introduction
 *             properties:
 *               introduction:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Introduction text
 *               highlights:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 200
 *                 description: Array of highlight strings
 *               image:
 *                 type: string
 *                 format: uri
 *                 description: About section image URL
 *     responses:
 *       200:
 *         description: About information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutResponse'
 *       201:
 *         description: About information created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutResponse'
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
router.put('/', [
  authGuard,
  sanitizeBody,
  body('introduction')
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Introduction is required and must be between 1 and 5000 characters'),
  body('highlights')
    .optional()
    .isArray()
    .withMessage('Highlights must be an array'),
  body('highlights.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each highlight must be between 1 and 200 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  handleValidationErrors
], aboutController.updateAbout);

/**
 * @swagger
 * /api/about/{user_id}:
 *   get:
 *     summary: Get about information by user ID (public endpoint)
 *     tags: [About]
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
 *         description: About information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutResponse'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: About information not found
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
], aboutController.getAboutByUserId);

/**
 * @swagger
 * /api/about:
 *   delete:
 *     summary: Delete about information for authenticated user
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: About information deleted successfully
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
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: About information not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/', authGuard, aboutController.deleteAbout);

module.exports = router;