require('dotenv').config();

module.exports = async(userEmail, subject, html) => {
    try {
        const sender = CreateTransport();
        console.log(sender.options)
        const receiver = CreateReceiver(userEmail, subject, html);

        sender.sendMail(receiver, (error) => {
            console.log('receiver: ', receiver);
            console.log('error: ', error);
            if (error) return { error }
        });
        return { error: false }

    } catch (error) {
        return { error };
    }
}

function CreateReceiver(userEmail, subject, html) {
    return {
        from: process.env.MAIL_USER,
        to: userEmail,
        subject,
        html
    }
};

function CreateTransport() {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    });
    return transporter;
}


// await sendEmail(process.env.MAIL_USER, 'Teacher', messageParse.name);