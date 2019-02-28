var express = require('express');
var router = express.Router();

const ensure = require('connect-ensure-login');
const bcrypt = require('bcrypt');

const User = require('../model/User');
const validateUserInfo = require('../common/utilities').validateUserInfo;
const constMessage = require('../common/message');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/profile', ensure.ensureLoggedIn(), function (req, res, next) {
  let message = {
    error: req.flash('error'),
    success: req.flash('success'),
    errorPwd: req.flash('error_password'),
    successPwd: req.flash('success_password')
  }
  // console.log(`${JSON.stringify(message, null, 4)} and ${(message.error === undefined || message.error == 0)}`)
  return res.render('profile', {
    pageName: "User profile",
    user: req.session.passport.user,
    message: message
  });
})



router.post('/edit', ensure.ensureLoggedIn(), function (req, res, next) {
  User.findById(req.body.userid, function (error, user) {
    let updateUser = new User(user)
    updateUser.firstname = req.body.firstname;
    updateUser.lastname = req.body.lastname;

    updateUser.save(function (error, user) {
      if (user) {
        req.flash('success', constMessage.successMessage.EDIT_PROFILE)
        return res.redirect("back")
      } else {
        req.flash('error', constMessage.errorMessage.EDIT_PROFILE_FAIL + " " + error)
        return res.redirect("back")
      }
    });
  })
})

router.post('/changepassword', ensure.ensureLoggedIn(), function (req, res, next) {
  User.findById(req.body.userid, function (error, user) {
    if (bcrypt.compareSync(req.body.current_password, user.password)) {
      let validateUserInput = validateUserInfo(user.email, req.body.password, req.body.confirm_password, req.body.current_password)
      if (!validateUserInput.error) {
        let updateUser = new User(user)
        updateUser.password = req.body.password;
        updateUser.save(function (error, user) {
          if (user) {
            req.flash('success_password', constMessage.successMessage.CHANGE_PASSWORD)
            return res.redirect("back")
          } else {
            req.flash('error_password', constMessage.errorMessage.EDIT_PROFILE_FAIL + " " + error)
            return res.redirect("back")
          }
        });
      } else {
        req.flash('error_password', validateUserInput.errorMessage)
        return res.redirect("back")
      }
    } else {
      req.flash('error_password', constMessage.errorMessage.PASSWORD_CURRENT_INCORRECT)
      return res.redirect("back")
    }
  })
})




module.exports = router;