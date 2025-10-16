const { Profile, User } = require('../models');

class ProfileService {
  /**
   * Get profile by user ID
   * @param {string} userId - User ID
   * @returns {Object} - Profile object
   */
  async getProfileByUserId(userId) {
    const profile = await Profile.findByUserId(userId);
    if (!profile) {
      const error = new Error('Profile not found');
      error.statusCode = 404;
      error.code = 'PROFILE_NOT_FOUND';
      throw error;
    }

    return profile.toJSON();
  }

  /**
   * Create a new profile for a user
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data
   * @returns {Object} - Created profile object
   */
  async createProfile(userId, profileData) {
    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Check if profile already exists
    const existingProfile = await Profile.findByUserId(userId);
    if (existingProfile) {
      const error = new Error('Profile already exists for this user');
      error.statusCode = 409;
      error.code = 'PROFILE_EXISTS';
      throw error;
    }

    // Validate profile data
    const validation = this.validateProfileData(profileData);
    if (!validation.isValid) {
      const error = new Error('Invalid profile data');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    // Create profile
    const profile = await Profile.create({
      user_id: userId,
      ...profileData
    });

    return profile.toJSON();
  }

  /**
   * Update profile by user ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile update data
   * @returns {Object} - Updated profile object
   */
  async updateProfile(userId, updateData) {
    // Find existing profile
    const profile = await Profile.findByUserId(userId);
    if (!profile) {
      const error = new Error('Profile not found');
      error.statusCode = 404;
      error.code = 'PROFILE_NOT_FOUND';
      throw error;
    }

    // Validate update data
    const validation = this.validateProfileData(updateData, true);
    if (!validation.isValid) {
      const error = new Error('Invalid profile data');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    // Update profile using the model's updateProfile method
    await profile.updateProfile(updateData);
    
    // Fetch and return updated profile
    const updatedProfile = await Profile.findByUserId(userId);
    return updatedProfile.toJSON();
  }

  /**
   * Delete profile by user ID
   * @param {string} userId - User ID
   * @returns {boolean} - Success status
   */
  async deleteProfile(userId) {
    const profile = await Profile.findByUserId(userId);
    if (!profile) {
      const error = new Error('Profile not found');
      error.statusCode = 404;
      error.code = 'PROFILE_NOT_FOUND';
      throw error;
    }

    await profile.destroy();
    return true;
  }

  /**
   * Get profile with user information
   * @param {string} userId - User ID
   * @returns {Object} - Profile with user data
   */
  async getProfileWithUser(userId) {
    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role', 'created_at']
      }]
    });

    if (!profile) {
      const error = new Error('Profile not found');
      error.statusCode = 404;
      error.code = 'PROFILE_NOT_FOUND';
      throw error;
    }

    return profile.toJSON();
  }

  /**
   * Check if profile exists for user
   * @param {string} userId - User ID
   * @returns {boolean} - Profile existence status
   */
  async profileExists(userId) {
    const profile = await Profile.findByUserId(userId);
    return !!profile;
  }

  /**
   * Validate profile data
   * @param {Object} profileData - Profile data to validate
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} - Validation result
   */
  validateProfileData(profileData, isUpdate = false) {
    const errors = [];

    // Name validation (required for create, optional for update)
    if (!isUpdate && !profileData.name) {
      errors.push('Name is required');
    } else if (profileData.name !== undefined) {
      if (typeof profileData.name !== 'string') {
        errors.push('Name must be a string');
      } else if (profileData.name.trim().length === 0) {
        errors.push('Name cannot be empty');
      } else if (profileData.name.length > 255) {
        errors.push('Name must not exceed 255 characters');
      }
    }

    // Avatar validation (optional)
    if (profileData.avatar !== undefined && profileData.avatar !== null) {
      if (typeof profileData.avatar !== 'string') {
        errors.push('Avatar must be a string URL');
      } else if (profileData.avatar && !/^https?:\/\/.+/.test(profileData.avatar)) {
        errors.push('Avatar must be a valid URL');
      }
    }

    // Bio validation (optional)
    if (profileData.bio !== undefined && profileData.bio !== null) {
      if (typeof profileData.bio !== 'string') {
        errors.push('Bio must be a string');
      } else if (profileData.bio.length > 2000) {
        errors.push('Bio must not exceed 2000 characters');
      }
    }

    // Contact validation (optional)
    if (profileData.contact !== undefined && profileData.contact !== null) {
      const contactValidation = this.validateContactData(profileData.contact);
      if (!contactValidation.isValid) {
        errors.push(...contactValidation.errors);
      }
    }

    // Social links validation (optional)
    if (profileData.social_links !== undefined && profileData.social_links !== null) {
      const socialLinksValidation = this.validateSocialLinksData(profileData.social_links);
      if (!socialLinksValidation.isValid) {
        errors.push(...socialLinksValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate contact data
   * @param {Object} contactData - Contact data to validate
   * @returns {Object} - Validation result
   */
  validateContactData(contactData) {
    const errors = [];

    if (typeof contactData !== 'object' || Array.isArray(contactData)) {
      errors.push('Contact must be an object');
      return { isValid: false, errors };
    }

    const allowedFields = ['email', 'phone', 'location', 'website'];
    const providedFields = Object.keys(contactData);
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      errors.push(`Invalid contact fields: ${invalidFields.join(', ')}`);
    }

    // Validate email format if provided
    if (contactData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      errors.push('Contact email must be a valid email address');
    }

    // Validate website URL if provided
    if (contactData.website && !/^https?:\/\/.+/.test(contactData.website)) {
      errors.push('Contact website must be a valid URL');
    }

    // Validate phone format if provided (basic validation)
    if (contactData.phone && typeof contactData.phone !== 'string') {
      errors.push('Contact phone must be a string');
    }

    // Validate location if provided
    if (contactData.location && typeof contactData.location !== 'string') {
      errors.push('Contact location must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate social links data
   * @param {Object} socialLinksData - Social links data to validate
   * @returns {Object} - Validation result
   */
  validateSocialLinksData(socialLinksData) {
    const errors = [];

    if (typeof socialLinksData !== 'object' || Array.isArray(socialLinksData)) {
      errors.push('Social links must be an object');
      return { isValid: false, errors };
    }

    const allowedPlatforms = ['github', 'linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'portfolio'];
    const providedPlatforms = Object.keys(socialLinksData);
    const invalidPlatforms = providedPlatforms.filter(platform => !allowedPlatforms.includes(platform));
    
    if (invalidPlatforms.length > 0) {
      errors.push(`Invalid social platforms: ${invalidPlatforms.join(', ')}`);
    }

    // Validate URLs
    Object.entries(socialLinksData).forEach(([platform, url]) => {
      if (url && typeof url !== 'string') {
        errors.push(`${platform} URL must be a string`);
      } else if (url && !/^https?:\/\/.+/.test(url)) {
        errors.push(`${platform} URL must be a valid URL`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get all profiles (admin function)
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @returns {Object} - Paginated profiles
   */
  async getAllProfiles(options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await Profile.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role', 'created_at']
      }],
      order: [['created_at', 'DESC']]
    });

    return {
      profiles: rows.map(profile => profile.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  }
}

module.exports = new ProfileService();