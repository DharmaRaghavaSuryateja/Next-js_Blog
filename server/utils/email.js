const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Dharma Raghava Suryateja <abcd@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const sendEmail=async options=>{
//   const msg = {
//     to: options.email, // recipient's email address
//     from: 'dharmaraghavasurya@gmail.com', // sender's email address
//     subject: options.subject, // email subject
//     text: options.message, // plain text version of the email
//   };
  
//   sgMail.send(msg)
//     .then(() => console.log('Email sent successfully'))
//     .catch(error => console.error(error.toString()));
// }
module.exports = sendEmail;