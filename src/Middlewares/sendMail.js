const nodemailer = require('nodemailer');
const sendMail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465, // port for secure SMTP
    secure: true, //ssl
    auth: {
      user: process.env.RESET_MAILID,
      pass: process.env.RESET_MAILPASS,
      method: 'LOGIN'
    },
    tls: {
        rejectUnauthorized: false,
        // secureProtocol: 'TLSv1_2', // Set the TLS version to TLS 1.2
    },
  });
  var mailOptions = {
    from: process.env.RESET_MAILID,
    to: email,
    subject: subject,
    text: text,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log("Error in sending mail", error);
    else console.log("Email sent:" + info.response);
  });
}
module.exports = {sendMail}