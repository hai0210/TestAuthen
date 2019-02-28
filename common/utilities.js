const errorMessage = require('./message').errorMessage;

const nodemailer = require("nodemailer");
const validator = require("validator");


let transporter = nodemailer.createTransport({
    service: process.env.MAILER,
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});
async function sendVerificationMail(userEmail, code) {

    // setup email data with unicode symbols
    let mailOptions = {
        from: process.env.MAIL_FROM_NAME + process.env.MAIL_FROM_ADDR, // sender address
        to: userEmail, // list of receivers
        subject: "OAuth2 Server verify account email", // Subject line
        text: `Someone is using your email to register an account on Authorization Server Application; if it is you please click to the click to verify your email: ${process.env.HOST_DOMAIN}:${process.env.PORT}/verify/${code}`, // plain text body
        html: `<b>Someone is using your email to register an account on Authorization Server Application; if it is you please click to the click to verify your email: ${process.env.HOST_DOMAIN}:${process.env.PORT}/verify/${code}</b>` // html body
    };
    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)
}

async function sendResetPasswordMail(userEmail, code) {

    // setup email data with unicode symbols
    let mailOptions = {
        from: process.env.MAIL_FROM_NAME + process.env.MAIL_FROM_ADDR, // sender address
        to: userEmail, // list of receivers
        subject: "OAuth2 Server reset password", // Subject line
        text: `We have recive a request for reset password. If it was you please link to the following url: ${process.env.HOST_DOMAIN}:${process.env.PORT}/resetpassword/${code}`, // plain text body
        html: `<b>We have recive a request for reset password. If it was you please link to the following url: ${process.env.HOST_DOMAIN}:${process.env.PORT}/resetpassword/${code}</b>` // html body
    };
    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)
}

async function sendNewPassword(userEmail, newPassword) {

    // setup email data with unicode symbols
    let mailOptions = {
        from: process.env.MAIL_FROM_NAME + process.env.MAIL_FROM_ADDR, // sender address
        to: userEmail, // list of receivers
        subject: "OAuth2 Server reset password", // Subject line
        text: `This is your new password: ${newPassword}. You can change it when you login successful`, // plain text body
        html: `<b>This is your new password: <i>${newPassword}</i>. You can change it when you login successful</b>` // html body
    };
    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)
}

function validateUserInfo(email, password, confirm_password, old_password) {
    if (validator.isEmpty(email)) {
        return {
            error: true,
            errorMessage: errorMessage.EMAIL_EMPTY
        };
    }

    //validate email format is correct
    if (!validator.isEmail(email)) {
        return {
            error: true,
            errorMessage: errorMessage.EMAIL_NOT_VALID
        };
    }
    if (old_password) {
        if (validator.equals(old_password, password)) {
            return {
                error: true,
                errorMessage: errorMessage.PASSWORD_SHOULD_NOT_AS_OLD
            };
        }
    }
    if (validator.isEmpty(password) || validator.isEmpty(confirm_password)) {
        return {
            error: true,
            errorMessage: errorMessage.PASSWORD_EMPTY
        }
    }

    //validate password and confirmation password is matched
    if (!validator.equals(password, confirm_password)) {
        return {
            error: true,
            errorMessage: errorMessage.PASSWORD_NOT_MATCH
        };
    }

    //validate password complexity
    var passwordRegExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{6,}/;
    if (!passwordRegExp.test(password)) {
        return {
            error: true,
            errorMessage: errorMessage.PASSWORD_NOT_MEET_COMPLEXITY
        };
    }

    if (validator.equals(password, email)) {
        return {
            userReq: req.body,
            error: true,
            errorMessage: errorMessage.PASSWORD_SHOULD_NOT_AS_EMAIL
        };
    }

    return {
        error: false,
        errorMessage: ""
    }

}

function validatePasswordPolicys(email, password, confirm_password, old_password) {
    if (old_password) {
        if (validator.equals(old_password, password)) {
            return {
                error: true,
                errorMessage: errorMessage.PASSWORD_SHOULD_NOT_AS_OLD
            };
        }
    }
    if (validator.isEmpty(password) || validator.isEmpty(confirm_password)) {
        return {
            error: true,
            errorMessage: errorMessage.PASSWORD_EMPTY
        }
    }

    //validate password and confirmation password is matched
    if (!validator.equals(password, confirm_password)) {
        return {
            error: true,
            errorMessage: errorMessage.PASSWORD_NOT_MATCH
        };
    }

    //validate password complexity
    var passwordRegExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{6,}/;
    if (!passwordRegExp.test(password)) {
        return {
            error: true,
            errorMessage: errorMessage.PASSWORD_NOT_MEET_COMPLEXITY
        };
    }

    if (validator.equals(password, email)) {
        return {
            userReq: req.body,
            error: true,
            errorMessage: errorMessage.PASSWORD_SHOULD_NOT_AS_EMAIL
        };
    }

    return {
        error: false,
        errorMessage: ""
    }

}

function validateEmailPolicys(email) {
    if (validator.isEmpty(email)) {
        return {
            error: true,
            errorMessage: errorMessage.EMAIL_EMPTY
        };
    }

    //validate email format is correct
    if (!validator.isEmail(email)) {
        return {
            error: true,
            errorMessage: errorMessage.EMAIL_NOT_VALID
        };
    }
    return {
        error: false,
        errorMessage: ""
    }
}

module.exports = {
    validateUserInfo,
    sendVerificationMail,
    sendResetPasswordMail,
    sendNewPassword,
    validatePasswordPolicys,
    validateEmailPolicys,

}