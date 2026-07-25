const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {

    const transporter = nodemailer.createTransport({

      service: "gmail",

      auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS,

      },

    });

    const info = await transporter.sendMail({

      from: `"MERN Authentication" <${process.env.EMAIL_USER}>`,

      to: email,

      subject: title,

      html: body,

    });

    return info;

  } catch (error) {

    console.log(error);

  }
};

module.exports = mailSender;