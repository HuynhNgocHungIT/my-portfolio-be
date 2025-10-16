const express = require('express');
const { body, param, query } = require('express-validator');
const certificateController = require('../controllers/certificateController');
const authGuard = require('../middlewares/authGuard');
const { handleValidationErrors, sanitizeBody } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Certificate unique identifier
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: Associated user ID
 *         title:
 *           type: string
 *           description: Certificate title
 *         issuer:
 *           type: string
 *           description: Certificate issuing organization
 *         issue_date:
 *           type: string
 *           format: date
 *           description: Certificate issue date (YYYY-MM-DD)
 *         credential_url:
 *           type: string
 *           format: uri
 *           description: URL to verify the certificate
 *         icon:
 *           type: string
 *           description: Certificate icon URL or identifier
 *         created_at:
 *           type: string
 *           format: date-time
 *     CertificateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             certificate:
 *               $ref: '#/components/schemas/Certificate'
 *     CertificatesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             certificates:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Certificate'
 */

/**
 * @swagger
 * /api/certificates:
 *   get:
 *     summary: Get current user's certificates
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [issue_date, title, issuer, created_at]
 *           default: issue_date
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: issuer
 *         schema:
 *           type: string
 *         description: Filter by issuer (partial match)
 *     responses:
 *       200:
 *         description: Certificates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificatesResponse'
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
    .isIn(['issue_date', 'title', 'issuer', 'created_at'])
    .withMessage('SortBy must be one of: issue_date, title, issuer, created_at'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('SortOrder must be ASC or DESC'),
  query('issuer')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Issuer must be between 1 and 255 characters'),
  handleValidationErrors
], certificateController.getMyCertificates);

/**
 * @swagger
 * /api/certificates/issuers:
 *   get:
 *     summary: Get current user's certificates grouped by issuer
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificates by issuer retrieved successfully
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
 *                     certificatesByIssuer:
 *                       type: object
 *                       additionalProperties:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Certificate'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/issuers', authGuard, certificateController.getCertificatesByIssuer);

/**
 * @swagger
 * /api/certificates/stats:
 *   get:
 *     summary: Get certificate statistics for current user
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificate statistics retrieved successfully
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
 *                         totalCertificates:
 *                           type: integer
 *                         uniqueIssuers:
 *                           type: integer
 *                         thisYearCertificates:
 *                           type: integer
 *                         mostRecentIssueDate:
 *                           type: string
 *                           format: date
 *                         topIssuers:
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
router.get('/stats', authGuard, certificateController.getCertificateStats);

/**
 * @swagger
 * /api/certificates/search:
 *   get:
 *     summary: Search certificates by title or issuer
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Search query for title or issuer
 *     responses:
 *       200:
 *         description: Certificate search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificatesResponse'
 *       400:
 *         description: Missing or invalid search query
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
router.get('/search', [
  authGuard,
  query('query')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query is required and must not be empty'),
  handleValidationErrors
], certificateController.searchCertificates);

/**
 * @swagger
 * /api/certificates/date-range:
 *   get:
 *     summary: Get certificates by date range
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Certificates by date range retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificatesResponse'
 *       400:
 *         description: Missing or invalid date range
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
router.get('/date-range', [
  authGuard,
  query('startDate')
    .isISO8601({ strict: true })
    .withMessage('Start date must be in YYYY-MM-DD format'),
  query('endDate')
    .isISO8601({ strict: true })
    .withMessage('End date must be in YYYY-MM-DD format'),
  handleValidationErrors
], certificateController.getCertificatesByDateRange);

/**
 * @swagger
 * /api/certificates/user/{user_id}:
 *   get:
 *     summary: Get certificates by user ID (public access)
 *     tags: [Certificates]
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
 *           enum: [issue_date, title, issuer, created_at]
 *           default: issue_date
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: issuer
 *         schema:
 *           type: string
 *         description: Filter by issuer (partial match)
 *     responses:
 *       200:
 *         description: User certificates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificatesResponse'
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
    .isIn(['issue_date', 'title', 'issuer', 'created_at'])
    .withMessage('SortBy must be one of: issue_date, title, issuer, created_at'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('SortOrder must be ASC or DESC'),
  query('issuer')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Issuer must be between 1 and 255 characters'),
  handleValidationErrors
], certificateController.getCertificatesByUserId);

/**
 * @swagger
 * /api/certificates:
 *   post:
 *     summary: Create new certificate
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - issuer
 *               - issue_date
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: Certificate title
 *               issuer:
 *                 type: string
 *                 maxLength: 255
 *                 description: Certificate issuing organization
 *               issue_date:
 *                 type: string
 *                 format: date
 *                 description: Certificate issue date (YYYY-MM-DD)
 *               credential_url:
 *                 type: string
 *                 format: uri
 *                 description: URL to verify the certificate
 *               icon:
 *                 type: string
 *                 description: Certificate icon URL or identifier
 *     responses:
 *       201:
 *         description: Certificate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateResponse'
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
  body('title')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be between 1 and 255 characters'),
  body('issuer')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Issuer is required and must be between 1 and 255 characters'),
  body('issue_date')
    .isISO8601({ strict: true })
    .withMessage('Issue date is required and must be in YYYY-MM-DD format'),
  body('credential_url')
    .optional()
    .isURL()
    .withMessage('Credential URL must be a valid URL'),
  body('icon')
    .optional()
    .isString()
    .trim()
    .withMessage('Icon must be a string'),
  handleValidationErrors
], certificateController.createCertificate);

/**
 * @swagger
 * /api/certificates/{id}:
 *   get:
 *     summary: Get certificate by ID
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateResponse'
 *       400:
 *         description: Invalid certificate ID format
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
 *         description: Certificate not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', [
  authGuard,
  param('id')
    .isUUID()
    .withMessage('Certificate ID must be a valid UUID'),
  handleValidationErrors
], certificateController.getCertificateById);

/**
 * @swagger
 * /api/certificates/{id}:
 *   put:
 *     summary: Update certificate by ID
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certificate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: Certificate title
 *               issuer:
 *                 type: string
 *                 maxLength: 255
 *                 description: Certificate issuing organization
 *               issue_date:
 *                 type: string
 *                 format: date
 *                 description: Certificate issue date (YYYY-MM-DD)
 *               credential_url:
 *                 type: string
 *                 format: uri
 *                 description: URL to verify the certificate
 *               icon:
 *                 type: string
 *                 description: Certificate icon URL or identifier
 *     responses:
 *       200:
 *         description: Certificate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateResponse'
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
 *         description: Certificate not found or access denied
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
    .withMessage('Certificate ID must be a valid UUID'),
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('issuer')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Issuer must be between 1 and 255 characters'),
  body('issue_date')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('Issue date must be in YYYY-MM-DD format'),
  body('credential_url')
    .optional()
    .isURL()
    .withMessage('Credential URL must be a valid URL'),
  body('icon')
    .optional()
    .isString()
    .trim()
    .withMessage('Icon must be a string'),
  handleValidationErrors
], certificateController.updateCertificate);

/**
 * @swagger
 * /api/certificates/{id}:
 *   delete:
 *     summary: Delete certificate by ID
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate deleted successfully
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
 *         description: Invalid certificate ID format
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
 *         description: Certificate not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', [
  authGuard,
  param('id')
    .isUUID()
    .withMessage('Certificate ID must be a valid UUID'),
  handleValidationErrors
], certificateController.deleteCertificate);

module.exports = router;