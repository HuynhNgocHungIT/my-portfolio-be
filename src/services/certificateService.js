const { Certificate } = require('../models');
const { Op } = require('sequelize');

class CertificateService {
  /**
   * Get all certificates for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options (sort, issuer filter)
   * @returns {Promise<Array>} Array of certificates
   */
  async getCertificatesByUserId(userId, options = {}) {
    try {
      const { sortBy = 'issue_date', sortOrder = 'DESC', issuer } = options;
      
      const whereClause = { user_id: userId };
      
      // Add issuer filter if provided
      if (issuer) {
        whereClause.issuer = {
          [Op.iLike]: `%${issuer}%`
        };
      }

      const certificates = await Certificate.findAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        attributes: ['id', 'title', 'issuer', 'issue_date', 'credential_url', 'icon', 'created_at']
      });

      return certificates;
    } catch (error) {
      throw new Error(`Failed to retrieve certificates: ${error.message}`);
    }
  }

  /**
   * Get certificate by ID
   * @param {string} certificateId - Certificate ID
   * @param {string} userId - User ID for ownership validation
   * @returns {Promise<Object|null>} Certificate object or null
   */
  async getCertificateById(certificateId, userId) {
    try {
      const certificate = await Certificate.findOne({
        where: { 
          id: certificateId,
          user_id: userId 
        },
        attributes: ['id', 'title', 'issuer', 'issue_date', 'credential_url', 'icon', 'created_at']
      });

      return certificate;
    } catch (error) {
      throw new Error(`Failed to retrieve certificate: ${error.message}`);
    }
  }

  /**
   * Create a new certificate
   * @param {Object} certificateData - Certificate data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created certificate
   */
  async createCertificate(certificateData, userId) {
    try {
      const { title, issuer, issue_date, credential_url, icon } = certificateData;

      // Validate issue_date is not in the future
      const issueDate = new Date(issue_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      if (issueDate > today) {
        throw new Error('Issue date cannot be in the future');
      }

      const certificate = await Certificate.create({
        user_id: userId,
        title: title.trim(),
        issuer: issuer.trim(),
        issue_date: issueDate,
        credential_url: credential_url || null,
        icon: icon || null
      });

      return {
        id: certificate.id,
        title: certificate.title,
        issuer: certificate.issuer,
        issue_date: certificate.issue_date,
        credential_url: certificate.credential_url,
        icon: certificate.icon,
        created_at: certificate.created_at
      };
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      throw new Error(`Failed to create certificate: ${error.message}`);
    }
  }

  /**
   * Update a certificate
   * @param {string} certificateId - Certificate ID
   * @param {Object} certificateData - Updated certificate data
   * @param {string} userId - User ID for ownership validation
   * @returns {Promise<Object>} Updated certificate
   */
  async updateCertificate(certificateId, certificateData, userId) {
    try {
      const certificate = await Certificate.findOne({
        where: { 
          id: certificateId,
          user_id: userId 
        }
      });

      if (!certificate) {
        throw new Error('Certificate not found or access denied');
      }

      const { title, issuer, issue_date, credential_url, icon } = certificateData;

      // Validate issue_date if provided
      let issueDate = certificate.issue_date;
      if (issue_date) {
        issueDate = new Date(issue_date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (issueDate > today) {
          throw new Error('Issue date cannot be in the future');
        }
      }

      // Update certificate
      await certificate.update({
        title: title ? title.trim() : certificate.title,
        issuer: issuer ? issuer.trim() : certificate.issuer,
        issue_date: issue_date ? issueDate : certificate.issue_date,
        credential_url: credential_url !== undefined ? credential_url : certificate.credential_url,
        icon: icon !== undefined ? icon : certificate.icon
      });

      return {
        id: certificate.id,
        title: certificate.title,
        issuer: certificate.issuer,
        issue_date: certificate.issue_date,
        credential_url: certificate.credential_url,
        icon: certificate.icon,
        created_at: certificate.created_at
      };
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      throw new Error(`Failed to update certificate: ${error.message}`);
    }
  }

  /**
   * Delete a certificate
   * @param {string} certificateId - Certificate ID
   * @param {string} userId - User ID for ownership validation
   * @returns {Promise<boolean>} Success status
   */
  async deleteCertificate(certificateId, userId) {
    try {
      const certificate = await Certificate.findOne({
        where: { 
          id: certificateId,
          user_id: userId 
        }
      });

      if (!certificate) {
        throw new Error('Certificate not found or access denied');
      }

      await certificate.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete certificate: ${error.message}`);
    }
  }

  /**
   * Get certificates grouped by issuer
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Certificates grouped by issuer
   */
  async getCertificatesByIssuer(userId) {
    try {
      const certificates = await Certificate.findAll({
        where: { user_id: userId },
        order: [['issue_date', 'DESC'], ['title', 'ASC']],
        attributes: ['id', 'title', 'issuer', 'issue_date', 'credential_url', 'icon', 'created_at']
      });

      // Group certificates by issuer
      const groupedCertificates = certificates.reduce((acc, certificate) => {
        const issuer = certificate.issuer;
        if (!acc[issuer]) {
          acc[issuer] = [];
        }
        acc[issuer].push(certificate);
        return acc;
      }, {});

      return groupedCertificates;
    } catch (error) {
      throw new Error(`Failed to retrieve certificates by issuer: ${error.message}`);
    }
  }

  /**
   * Get certificate statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Certificate statistics
   */
  async getCertificateStats(userId) {
    try {
      const certificates = await Certificate.findAll({
        where: { user_id: userId },
        attributes: ['issue_date', 'issuer']
      });

      const totalCertificates = certificates.length;
      const uniqueIssuers = [...new Set(certificates.map(cert => cert.issuer))];
      
      // Calculate certificates by year
      const currentYear = new Date().getFullYear();
      const thisYearCertificates = certificates.filter(cert => 
        new Date(cert.issue_date).getFullYear() === currentYear
      ).length;

      // Find most recent certificate
      const mostRecentCertificate = certificates.length > 0 
        ? certificates.reduce((latest, cert) => 
            new Date(cert.issue_date) > new Date(latest.issue_date) ? cert : latest
          )
        : null;

      return {
        totalCertificates,
        uniqueIssuers: uniqueIssuers.length,
        thisYearCertificates,
        mostRecentIssueDate: mostRecentCertificate ? mostRecentCertificate.issue_date : null,
        topIssuers: uniqueIssuers.slice(0, 5) // Top 5 issuers
      };
    } catch (error) {
      throw new Error(`Failed to retrieve certificate statistics: ${error.message}`);
    }
  }

  /**
   * Get certificates by date range
   * @param {string} userId - User ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Certificates within date range
   */
  async getCertificatesByDateRange(userId, startDate, endDate) {
    try {
      const whereClause = {
        user_id: userId,
        issue_date: {
          [Op.between]: [startDate, endDate]
        }
      };

      const certificates = await Certificate.findAll({
        where: whereClause,
        order: [['issue_date', 'DESC']],
        attributes: ['id', 'title', 'issuer', 'issue_date', 'credential_url', 'icon', 'created_at']
      });

      return certificates;
    } catch (error) {
      throw new Error(`Failed to retrieve certificates by date range: ${error.message}`);
    }
  }

  /**
   * Search certificates by title or issuer
   * @param {string} userId - User ID
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching certificates
   */
  async searchCertificates(userId, query) {
    try {
      const whereClause = {
        user_id: userId,
        [Op.or]: [
          {
            title: {
              [Op.iLike]: `%${query}%`
            }
          },
          {
            issuer: {
              [Op.iLike]: `%${query}%`
            }
          }
        ]
      };

      const certificates = await Certificate.findAll({
        where: whereClause,
        order: [['issue_date', 'DESC']],
        attributes: ['id', 'title', 'issuer', 'issue_date', 'credential_url', 'icon', 'created_at']
      });

      return certificates;
    } catch (error) {
      throw new Error(`Failed to search certificates: ${error.message}`);
    }
  }
}

module.exports = new CertificateService();