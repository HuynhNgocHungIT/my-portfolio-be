const { About, User } = require('../models');

class AboutService {
  /**
   * Get about information by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} About data or null if not found
   */
  async getAboutByUserId(userId) {
    try {
      const about = await About.findByUserId(userId);
      return about;
    } catch (error) {
      throw new Error(`Failed to retrieve about data: ${error.message}`);
    }
  }

  /**
   * Get about information for the authenticated user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} About data or null if not found
   */
  async getAbout(userId) {
    try {
      const about = await About.findByUserId(userId);
      return about;
    } catch (error) {
      throw new Error(`Failed to retrieve about data: ${error.message}`);
    }
  }

  /**
   * Create or update about information
   * @param {string} userId - User ID
   * @param {Object} aboutData - About data to create/update
   * @param {string} aboutData.introduction - Introduction text
   * @param {Array<string>} aboutData.highlights - Array of highlight strings
   * @param {string} aboutData.image - Image URL
   * @returns {Promise<Object>} Created or updated about data
   */
  async createOrUpdateAbout(userId, aboutData) {
    try {
      // Validate user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if about already exists
      let about = await About.findByUserId(userId);

      if (about) {
        // Update existing about
        await about.updateAbout(aboutData);
        await about.reload();
        return about;
      } else {
        // Create new about
        about = await About.create({
          user_id: userId,
          ...aboutData
        });
        return about;
      }
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      throw new Error(`Failed to create/update about data: ${error.message}`);
    }
  }

  /**
   * Update about information
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated about data
   */
  async updateAbout(userId, updateData) {
    try {
      const about = await About.findByUserId(userId);
      if (!about) {
        throw new Error('About data not found');
      }

      await about.updateAbout(updateData);
      await about.reload();
      return about;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      throw new Error(`Failed to update about data: ${error.message}`);
    }
  }

  /**
   * Delete about information
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteAbout(userId) {
    try {
      const about = await About.findByUserId(userId);
      if (!about) {
        throw new Error('About data not found');
      }

      await about.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete about data: ${error.message}`);
    }
  }
}

module.exports = new AboutService();