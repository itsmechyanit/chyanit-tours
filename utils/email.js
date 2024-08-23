const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Chyanit Singh <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    //if in production
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SENDGRID',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    //if in dev

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //render HTML based on a pug Template

    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );
    //mail options

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome', "Welcome to the Chyanit's Tours Family");
  }

  async sendPasswordReset() {
    if (this.url.includes('api')) {
      await this.send(
        'passwordReset',
        'Password reset token valid for 10 minutes',
      );
    } else {
      await this.send(
        'passwordResetWebsite',
        'Password reset token valid for 10 minutes',
      );
    }
  }
}

module.exports = Email;
