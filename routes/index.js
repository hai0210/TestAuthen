var express = require('express');
var router = express.Router();

const passport = require('passport');
const ensure = require('connect-ensure-login');
const uid = require('uid2');

const validateUserInfo = require('../common/utilities').validateUserInfo;
const constMessage = require('../common/message');
const {
  sendVerificationMail,
  sendResetPasswordMail,
  sendNewPassword
} = require('../common/utilities')

const Users = require('../model/User');
const VerifyCode = require('../model/VerificationEmail');


/* GET home page. */
router.get('/', ensure.ensureLoggedOut('/home'), function (req, res, next) {
  let message = {
    error: req.flash('error')
  }
  res.render('index', {
    pageName: "Login",
    message: message,
  });
});

/* GET registration page. */
router.get('/register', ensure.ensureLoggedOut('/home'), function (req, res, next) {
  let message = {
    error: req.flash('error'),
    success: req.flash('success')
  }
  // console.log(`${JSON.stringify(message, null, 4)} and ${(message.error === undefined || message.error == 0)}`)
  return res.render('registration', {
    pageName: "Register",
    message: message,
    userReq: req.session.registerUser
  });
})

/* POST register an user infomation. */
router.post('/register', ensure.ensureLoggedOut('/home'), function (req, res, next) {

  //validate data
  let validateUser = validateUserInfo(req.body.email, req.body.password, req.body.confirm_password);
  validateUser.userReq = req.body;
  if (validateUser.error) {
    req.session.registerUser = req.body;
    req.flash('error', validateUser.errorMessage);
    return res.redirect("back");
  }

  let newUser = new Users({
    username: req.body.email,
    email: req.body.email,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname
  })
  newUser.save(function (error, user) {

    if (error) {
      if (error.code === 11000) {
        req.flash('error', constMessage.errorMessage.EMAIL_EXIST);
        req.session.registerUser = req.body;
      }
      return res.redirect('back');
    }

    let code = new VerifyCode({
      user: user
    });

    code.save(function (error, codeSaved) {
      if (error) {
        console.log(`this is an error: ${error}`)
      }

      // async..await is not allowed in global scope, must use a wrapper
      sendVerificationMail(user.email, codeSaved.code).catch(console.error);
      res.render('registration-success', {
        userInfo: user.email,
        pageName: "Register Successful"
      });
    });
  });
})

/* GET verify account */
router.get('/verify/:id', ensure.ensureLoggedOut('/home'), function (req, res, next) {
  VerifyCode.findOne({
    code: req.params.id
  }).then((code) => {
    if (code && code.active) {
      Users.findByIdAndUpdate(code.user, {
        userStatus: true
      }).then((user) => {
        if (user) {
          VerifyCode.findByIdAndRemove(code._id).then((result) => {
            if (result)
              console.log("remove successful");
            else
              console.log("there some error happening");
          })
          return res.render('verify-success', {
            pageName: "Verify account",
            user: code.user
          })
        }
        next();
      })
    } else {
      if (!code.active) {
        Users.findByIdAndRemove(code.user).then((result) => {
          VerifyCode.findByIdAndRemove(code._id).then((code_result) => {
            if (result && code_result)
              console.log("remove successful");
            else
              console.log("there some error happening");
            next();
          })
        })
      }
      return res.render('verify-failure', {
        pageName: "Verify account",
      })
    }
  })
})

/* GET verify account */
router.get('/home', ensure.ensureLoggedIn(), function (req, res, next) {
  // console.log(JSON.stringify(req.user, null, 4));
  // console.log(`session: ${JSON.stringify(req.session)}`);
  return res.render('homepage', {
    pageName: "Home",
    user: req.session.passport.user
  });
})

router.get('/login', ensure.ensureLoggedOut('/home'), function (req, res, next) {
  let message = {
    error: req.flash('error')
  }
  res.render('index', {
    pageName: "Login",
    message: message,
  });
});

router.post('/login',
  passport.authenticate('local', {
    successReturnToOrRedirect: '/home',
    failureRedirect: '/'
  })
)

router.get('/logout/', ensure.ensureLoggedIn(), function (req, res, next) {
  var redirectURL = req.query.redirectURL;
  req.logOut();
  if (redirectURL) {
    return res.redirect(redirectURL);
  }
  return res.redirect('/');
});

router.get('/resetpassword', ensure.ensureLoggedOut('/home'), function (req, res, next) {
  let message = {
    error: req.flash('error'),
    success: req.flash('success')
  }
  return res.render('password-reset', {
    pageName: "Reset password",
    message: message,
  })
});

router.post('/resetpassword', ensure.ensureLoggedOut('/home'), function (req, res, next) {
  Users.findOne({
    username: req.body.username
  }, function (error, result) {
    let expiresDate = function () {
      let today = new Date();
      let length = 3 * 24 * 60;
      return new Date(today.getTime() + length * 60000);
    }
    let updateUser = new Users(result)
    updateUser.resetPassword = {
      code: uid(125),
      expires: expiresDate(),
      active: true,
    }
    updateUser.save(function (error, user) {
      if (user) {
        sendResetPasswordMail(user.email, user.resetPassword.code).catch(console.error);
        req.flash('success', constMessage.successMessage.RESET_PASSWORD_URL)
        return res.redirect("back")
      } else {
        req.flash('error', constMessage.errorMessage.RESET_PASSWORD_FAIL + " " + error)
        return res.redirect("back")
      }
    })
  });
})

// router.get('/resetpassword/:id', ensure.ensureLoggedOut('/home'), function (req, res, next) {
//   Users.findOne({
//     'resetPassword.code': req.params.id
//   }, function (error, result) {
//     if (result && result.resetPassword.active) {
//       let updateUser = new Users(result)
//       let newPassword = uid(8);
//       updateUser.password = newPassword;
//       updateUser.resetPassword = {};
//       updateUser.save(function (error, user) {
//         if (user) {
//           sendNewPassword(user.email, newPassword).catch(console.error);
//           return res.render('password-reset-success', {
//             pageName: "Reset Password"
//           })
//         }
//       })
//     } else {
//       return res.render('password-reset-failure', {
//         pageName: "Reset Password"
//       })
//     }
//   })
// })

router.get('/resetpassword/:id', ensure.ensureLoggedOut('/home'), function (req, res, next) {
  Users.findOne({
    'resetPassword.code': req.params.id
  }, function (error, result) {
    if (result && result.resetPassword.active) {
      let message = {
        error: req.flash('error'),
        success: req.flash('success')
      }
      return res.render('password-reset-form', {
        userInfo: {
          id: result.id,
          resetPasswordCode: result.resetPassword.code
        },
        pageName: "Reset Passsword",
        message: message,
      })
    } else {
      return res.render('password-reset-failure', {
        pageName: "Reset Password"
      })
    }
  })
})

router.post('/resetpassword/:id', ensure.ensureLoggedOut('/home'), function (req, res, next) {
  Users.findById(req.body.userid, function (error, user) {
    let validateUserInput = validateUserInfo(user.email, req.body.password, req.body.confirm_password)
    if (!validateUserInput.error) {
      let updateUser = new Users(user)
      updateUser.password = req.body.password;
      updateUser.resetPassword = {};
      updateUser.save(function (error, user) {
        if (user) {
          req.flash('success', constMessage.successMessage.CHANGE_PASSWORD)
          return res.render('password-reset-success', {
            pageName: "Reset Password"
          })
        } else {
          req.flash('error', constMessage.errorMessage.EDIT_PROFILE_FAIL + " " + error)
          return res.redirect("back")
        }
      });
    } else {
      req.flash('error', validateUserInput.errorMessage)
      return res.redirect("back")
    }
  })
})

router.get('/testPage', function (req, res, next) {
  return res.render('testPage')
})

module.exports = router;