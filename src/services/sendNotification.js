require('dotenv').config();

module.exports = async(userEmail, queue, name) => {
    try {
        const sender = CreateTransport();

        const receiver = CreateReceiver(userEmail, queue, name);

        sender.sendMail(receiver, (error) => {
            if (error) return { error }
        });
        return { error: false }

    } catch (error) {
        return { error };
    }
}

function CreateReceiver(userEmail, queue, name) {
    return {
        from: process.env.MAIL_USER,
        to: userEmail,
        subject: `${queue}`,
        html: `<h1 style="color:green;">${name} is Active!</h1>`
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