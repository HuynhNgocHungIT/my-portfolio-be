const { MailQueue } = require('../models');

/**
 * Service for generating and storing 360 Feedback request emails
 */
class Feedback360EmailService {
  /**
   * Generate email head section
   * @param {Object} data - Email data
   * @param {string} data.recipientName - Name of the recipient
   * @returns {string} - HTML head section
   */
  generateEmailHead(data) {
    const { recipientName = 'Colleague' } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>360 Feedback Request</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4a90e2;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border: 1px solid #ddd;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-radius: 0 0 5px 5px;
      border: 1px solid #ddd;
      border-top: none;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4a90e2;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #357abd;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>360 Feedback Request</h1>
  </div>
  <div class="content">
    <p>Dear ${recipientName},</p>
`;
  }

  /**
   * Generate email body section
   * @param {Object} data - Email data
   * @param {string} data.employeeName - Name of the employee requesting feedback
   * @param {string} data.feedbackUrl - URL to submit feedback (optional)
   * @param {string} data.dueDate - Due date for feedback submission (optional)
   * @param {string} data.additionalInstructions - Additional instructions (optional)
   * @returns {string} - HTML body section
   */
  generateEmailBody(data) {
    const {
      employeeName,
      feedbackUrl,
      dueDate,
      additionalInstructions
    } = data;

    let bodyContent = `
    <p>You have been selected to provide 360-degree feedback for <strong>${employeeName || 'a colleague'}</strong>.</p>
    
    <p>Your feedback is valuable and will help in their professional development and performance evaluation. We appreciate you taking the time to provide honest and constructive feedback.</p>
    
    <h3>What is 360 Feedback?</h3>
    <p>360-degree feedback is a comprehensive evaluation method that gathers input from multiple sources, including peers, supervisors, and subordinates, to provide a well-rounded view of an individual's performance and behavior.</p>
    
    <h3>How to Submit Your Feedback</h3>
    <p>Please provide your feedback by following the instructions below:</p>
    <ul>
      <li>Be honest and constructive in your responses</li>
      <li>Focus on specific examples and behaviors</li>
      <li>Provide balanced feedback highlighting both strengths and areas for improvement</li>
      <li>Ensure your feedback is professional and respectful</li>
    </ul>
`;

    if (feedbackUrl) {
      bodyContent += `
    <p style="text-align: center;">
      <a href="${feedbackUrl}" class="button">Submit Feedback</a>
    </p>
`;
    }

    if (dueDate) {
      bodyContent += `
    <p><strong>Please submit your feedback by: ${dueDate}</strong></p>
`;
    }

    if (additionalInstructions) {
      bodyContent += `
    <h3>Additional Instructions</h3>
    <p>${additionalInstructions}</p>
`;
    }

    bodyContent += `
    <p>If you have any questions or need assistance, please don't hesitate to contact the HR department.</p>
    
    <p>Thank you for your participation in this important process.</p>
`;

    return bodyContent;
  }

  /**
   * Generate email bottom section
   * @param {Object} data - Email data
   * @param {string} data.companyName - Company name (optional)
   * @param {string} data.hrContactEmail - HR contact email (optional)
   * @param {string} data.hrContactPhone - HR contact phone (optional)
   * @returns {string} - HTML bottom section
   */
  generateEmailBottom(data) {
    const {
      companyName = 'Our Organization',
      hrContactEmail,
      hrContactPhone
    } = data;

    let footerContent = `
  </div>
  <div class="footer">
    <p><strong>${companyName}</strong></p>
`;

    if (hrContactEmail || hrContactPhone) {
      footerContent += `    <p>For questions or support, please contact:</p>`;
      if (hrContactEmail) {
        footerContent += `    <p>Email: <a href="mailto:${hrContactEmail}">${hrContactEmail}</a></p>`;
      }
      if (hrContactPhone) {
        footerContent += `    <p>Phone: ${hrContactPhone}</p>`;
      }
    }

    footerContent += `
    <p style="margin-top: 20px; font-size: 11px; color: #999;">
      This is an automated message. Please do not reply directly to this email.
    </p>
    <p style="font-size: 11px; color: #999;">
      © ${new Date().getFullYear()} ${companyName}. All rights reserved.
    </p>
  </div>
</body>
</html>
`;

    return footerContent;
  }

  /**
   * Generate complete email content with head, body, and bottom sections
   * @param {Object} emailData - Complete email data
   * @returns {string} - Complete HTML email content
   */
  generateEmailContent(emailData) {
    const head = this.generateEmailHead(emailData);
    const body = this.generateEmailBody(emailData);
    const bottom = this.generateEmailBottom(emailData);
    
    return head + body + bottom;
  }

  /**
   * Generate email subject line
   * @param {Object} data - Email data
   * @param {string} data.employeeName - Name of the employee requesting feedback
   * @returns {string} - Email subject
   */
  generateEmailSubject(data) {
    const { employeeName = 'Colleague' } = data;
    return `360 Feedback Request - ${employeeName}`;
  }

  /**
   * Generate and store 360 Feedback request email data in mail queue
   * @param {Object} feedbackData - Feedback request data
   * @param {string} feedbackData.recipientEmail - Email address of the recipient (co-worker)
   * @param {string} feedbackData.recipientName - Name of the recipient (optional)
   * @param {string} feedbackData.employeeName - Name of the employee requesting feedback
   * @param {string} feedbackData.feedbackUrl - URL to submit feedback (optional)
   * @param {string} feedbackData.dueDate - Due date for feedback submission (optional)
   * @param {string} feedbackData.additionalInstructions - Additional instructions (optional)
   * @param {string} feedbackData.companyName - Company name (optional)
   * @param {string} feedbackData.hrContactEmail - HR contact email (optional)
   * @param {string} feedbackData.hrContactPhone - HR contact phone (optional)
   * @param {number} feedbackData.priority - Email priority (optional, defaults to 0)
   * @param {Date} feedbackData.scheduledAt - Scheduled sending time (optional)
   * @param {Object} feedbackData.metadata - Additional metadata to store (optional)
   * @returns {Object} - Created mail queue record
   */
  async generateAndStore360FeedbackEmail(feedbackData) {
    // Validate required fields
    if (!feedbackData.recipientEmail) {
      const error = new Error('Recipient email is required');
      error.statusCode = 400;
      error.code = 'MISSING_RECIPIENT_EMAIL';
      throw error;
    }

    if (!feedbackData.employeeName) {
      const error = new Error('Employee name is required');
      error.statusCode = 400;
      error.code = 'MISSING_EMPLOYEE_NAME';
      throw error;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(feedbackData.recipientEmail)) {
      const error = new Error('Invalid recipient email format');
      error.statusCode = 400;
      error.code = 'INVALID_EMAIL_FORMAT';
      throw error;
    }

    // Generate email content
    const emailContent = this.generateEmailContent(feedbackData);
    const emailSubject = this.generateEmailSubject(feedbackData);

    // Prepare metadata
    const metadata = {
      type: '360_feedback_request',
      employeeName: feedbackData.employeeName,
      recipientName: feedbackData.recipientName,
      feedbackUrl: feedbackData.feedbackUrl,
      dueDate: feedbackData.dueDate,
      ...feedbackData.metadata
    };

    // Create mail queue record
    const mailQueueRecord = await MailQueue.create({
      recipient: feedbackData.recipientEmail.toLowerCase().trim(),
      subject: emailSubject,
      message: emailContent,
      status: 'pending',
      priority: feedbackData.priority || 0,
      scheduled_at: feedbackData.scheduledAt || null,
      metadata: metadata
    });

    return mailQueueRecord.toJSON();
  }

  /**
   * Generate and store multiple 360 Feedback request emails
   * @param {Array} feedbackDataArray - Array of feedback request data objects
   * @returns {Array} - Array of created mail queue records
   */
  async generateAndStoreMultiple360FeedbackEmails(feedbackDataArray) {
    const results = [];
    const errors = [];

    for (let i = 0; i < feedbackDataArray.length; i++) {
      try {
        const result = await this.generateAndStore360FeedbackEmail(feedbackDataArray[i]);
        results.push(result);
      } catch (error) {
        errors.push({
          index: i,
          data: feedbackDataArray[i],
          error: error.message
        });
      }
    }

    if (errors.length > 0) {
      const error = new Error(`Failed to create ${errors.length} email(s) out of ${feedbackDataArray.length}`);
      error.statusCode = 400;
      error.code = 'PARTIAL_EMAIL_CREATION_FAILED';
      error.details = errors;
      throw error;
    }

    return results;
  }
}

module.exports = new Feedback360EmailService();
