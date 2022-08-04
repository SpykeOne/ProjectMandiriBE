const nodemailer = require("nodemailer")

const NODE_MAILER_EMAIL = "alexstanislaus12@gmail.com"
const NODE_MAILER_PASSWORD = "pcbinyxywexwbxts"

const transport = nodemailer.createTransport({
    auth:{
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_PASSWORD
    },
    host: "smtp.gmail.com",
})

const mailer = async({subject, html, to ,text}) => {
    await transport.sendMail({
        subject: subject || "test subject email",
        html: html || "<h1>This is sent through express API</h1>",
        to: to || "alexstanislaus12@gmail.com",
        text: text ||  "test nodemailer"
    })
}

module.exports = mailer