const nodemailer = require('nodemailer');
const { GoogleGenAI } = require("@google/genai");

// Initialize the Gemini client for email generation
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Configure the Nodemailer transporter using Mailtrap credentials from .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Generates and sends a personalized welcome email to a new user.
 * @param {object} user - The user object containing name, email, and health goals.
 */
const sendWelcomeEmail = async (user) => {
  // 1. Create a personalized prompt for the AI
  const prompt = `You are the voice of "Luna Health", a smart AI health companion. Write a short, exciting, and welcoming email to a new user.
    - The user's name is ${user.name}.
    - Their primary health goal is: "${user.healthGoals || 'live a healthier life'}".
    - Make the email feel personal, inspiring, and smart.
  - Mention their specific health goal and how Luna can help them achieve it.
    - Keep it concise (around 3-4 short paragraphs).
  - Sign off as "Your personal health companion, Luna".
    - DO NOT include a subject line.`;

  try {
    // 2. Call the Gemini API to generate the email body
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const emailBody = result.text; // The AI-generated text

    // 3. Send the email using Nodemailer
    const mailOptions = {
      from: '"Luna Health" <welcome@lunahealth.com>',
      to: user.email,
      subject: `Welcome to Luna Health, ${user.name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #212121;">Welcome to Luna Health!</h2>
          ${emailBody.replace(/\n/g, '<br/>')}
        </div>
      `, // Convert newlines to <br> for HTML
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error(`Error sending welcome email:`, error);
  }
};

/**
 * Sends an appointment confirmation email.
 * @param {object} user - The user object.
 * @param {object} appointment - The appointment object.
 */
const sendAppointmentConfirmationEmail = async (user, appointment) => {
  const mailOptions = {
  from: '"Luna Health" <no-reply@lunahealth.com>',
    to: user.email,
    subject: 'Your Appointment has been Confirmed!',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello ${user.name},</h2>
        <p>This is a confirmation that your appointment has been successfully booked.</p>
        <h3>Appointment Details:</h3>
        <ul>
          <li><strong>Title:</strong> ${appointment.title}</li>
          <li><strong>Date & Time:</strong> ${new Date(appointment.date).toLocaleString()}</li>
        </ul>
        <p>We look forward to assisting you.</p>
  <p>Sincerely,<br/>The Luna Health Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error(`Error sending confirmation email:`, error);
  }
};

/**
 * Sends an appointment cancellation email.
 * @param {object} user - The user object.
 * @param {object} appointment - The appointment object.
 */
const sendAppointmentCancellationEmail = async (user, appointment) => {
  const mailOptions = {
  from: '"Luna Health" <no-reply@lunahealth.com>',
    to: user.email,
    subject: 'Your Appointment has been Canceled',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello ${user.name},</h2>
        <p>This is a confirmation that the following appointment has been canceled as per your request:</p>
        <h3>Canceled Appointment Details:</h3>
        <ul>
          <li><strong>Title:</strong> ${appointment.title}</li>
          <li><strong>Date & Time:</strong> ${new Date(appointment.date).toLocaleString()}</li>
        </ul>
        <p>If this was a mistake, please feel free to book a new appointment at any time.</p>
  <p>Sincerely,<br/>The Luna Health Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Cancellation email sent to ${user.email}`);
  } catch (error) {
    console.error(`Error sending cancellation email:`, error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentCancellationEmail,
};