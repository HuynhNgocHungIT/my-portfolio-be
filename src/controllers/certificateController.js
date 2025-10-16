const certificateService = require("../services/certificateService");

class CertificateController {
  /**
   * Get all certificates for current user
   * GET /api/certificates
   */
  async getMyCertificates(req, res, next) {
    try {
      const userId = req.user.id;
      const { sortBy = "issue_date", sortOrder = "DESC", issuer } = req.query;

      // Get certificates for current user
      const certificates = await certificateService.getCertificatesByUserId(
        userId,
        {
          sortBy,
          sortOrder,
          issuer,
        }
      );

      res.status(200).json({
        success: true,
        message: "Certificates retrieved successfully",
        data: {
          certificates,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get certificates by user ID (public access)
   * GET /api/certificates/user/:user_id
   */
  async getCertificatesByUserId(req, res, next) {
    try {
      const { user_id } = req.params;
      const { sortBy = "issue_date", sortOrder = "DESC", issuer } = req.query;

      // Validate user_id format (UUID)
      if (!this.isValidUUID(user_id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid user ID format",
            code: "INVALID_USER_ID",
          },
        });
      }

      // Get certificates for specified user
      const certificates = await certificateService.getCertificatesByUserId(
        user_id,
        {
          sortBy,
          sortOrder,
          issuer,
        }
      );

      res.status(200).json({
        success: true,
        message: "User certificates retrieved successfully",
        data: {
          certificates,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get certificates grouped by issuer for current user
   * GET /api/certificates/issuers
   */
  async getCertificatesByIssuer(req, res, next) {
    try {
      const userId = req.user.id;

      // Get certificates grouped by issuer
      const certificatesByIssuer =
        await certificateService.getCertificatesByIssuer(userId);

      res.status(200).json({
        success: true,
        message: "Certificates by issuer retrieved successfully",
        data: {
          certificatesByIssuer,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get certificate statistics for current user
   * GET /api/certificates/stats
   */
  async getCertificateStats(req, res, next) {
    try {
      const userId = req.user.id;

      // Get certificate statistics
      const stats = await certificateService.getCertificateStats(userId);

      res.status(200).json({
        success: true,
        message: "Certificate statistics retrieved successfully",
        data: {
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search certificates by title or issuer
   * GET /api/certificates/search
   */
  async searchCertificates(req, res, next) {
    try {
      const userId = req.user.id;
      const { query } = req.query;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Search query is required",
            code: "MISSING_SEARCH_QUERY",
          },
        });
      }

      // Search certificates
      const certificates = await certificateService.searchCertificates(
        userId,
        query.trim()
      );

      res.status(200).json({
        success: true,
        message: "Certificate search completed successfully",
        data: {
          certificates,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get certificates by date range
   * GET /api/certificates/date-range
   */
  async getCertificatesByDateRange(req, res, next) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Both startDate and endDate are required",
            code: "MISSING_DATE_RANGE",
          },
        });
      }

      // Validate date format
      if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid date format. Use YYYY-MM-DD format",
            code: "INVALID_DATE_FORMAT",
          },
        });
      }

      // Get certificates by date range
      const certificates = await certificateService.getCertificatesByDateRange(
        userId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        message: "Certificates by date range retrieved successfully",
        data: {
          certificates,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get certificate by ID
   * GET /api/certificates/:id
   */
  async getCertificateById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate certificate ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid certificate ID format",
            code: "INVALID_CERTIFICATE_ID",
          },
        });
      }

      // Get certificate with ownership validation
      const certificate = await certificateService.getCertificateById(
        id,
        userId
      );

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Certificate not found or access denied",
            code: "CERTIFICATE_NOT_FOUND",
          },
        });
      }

      res.status(200).json({
        success: true,
        message: "Certificate retrieved successfully",
        data: {
          certificate,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new certificate
   * POST /api/certificates
   */
  async createCertificate(req, res, next) {
    try {
      const userId = req.user.id;
      const certificateData = req.body;

      // Create certificate
      const certificate = await certificateService.createCertificate(
        certificateData,
        userId
      );

      res.status(201).json({
        success: true,
        message: "Certificate created successfully",
        data: {
          certificate,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update certificate by ID
   * PUT /api/certificates/:id
   */
  async updateCertificate(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Validate certificate ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid certificate ID format",
            code: "INVALID_CERTIFICATE_ID",
          },
        });
      }

      // Update certificate (with user ownership validation)
      const certificate = await certificateService.updateCertificate(
        id,
        updateData,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Certificate updated successfully",
        data: {
          certificate,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete certificate by ID
   * DELETE /api/certificates/:id
   */
  async deleteCertificate(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate certificate ID format (UUID)
      if (!this.isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid certificate ID format",
            code: "INVALID_CERTIFICATE_ID",
          },
        });
      }

      // Delete certificate (with user ownership validation)
      await certificateService.deleteCertificate(id, userId);

      res.status(200).json({
        success: true,
        message: "Certificate deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate UUID format
   * @param {string} uuid - UUID string to validate
   * @returns {boolean} - Whether the UUID is valid
   */
  isValidUUID(uuid) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} dateString - Date string to validate
   * @returns {boolean} - Whether the date is valid
   */
  isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    const date = new Date(dateString);
    return (
      date instanceof Date &&
      !isNaN(date) &&
      date.toISOString().slice(0, 10) === dateString
    );
  }
}

module.exports = new CertificateController();
