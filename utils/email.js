const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // create a transporter
  // 
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // define the email address
  const mailOptions = {
    from: "Jane Doe <hello@janedoe.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
