var express = require('express');
var router = express.Router();

const validateUserInfo = require('../common/utilities').validateUserInfo;

const User = require('../model/User')


router.get('/setup/superadmin', function (req, res, next) {
  User.count({
    superAdmin: true
  }, function (error, count) {
    if (count === 0) {
      let message = {
        error: req.flash('error'),
        success: req.flash('success')
      }
      // console.log(`${JSON.stringify(message, null, 4)} and ${(message.error === undefined || message.error == 0)}`)
      return res.render('admin/wizard-page', {
        pageName: "Setup Applicaion",
        message: message,
        userReq: req.session.registerUser
      });
    } else {
      console.log('Super Admin is already exist');
      return res.redirect('/')
    }
  })
});

router.post('/setup/createuser', function (req, res, next) {
  User.count({
    superAdmin: true
  }, function (error, count) {
    if (count === 0) {

      let validateUser = validateUserInfo(req.body.email, req.body.password, req.body.confirm_password);
      if (validateUser.error) {
        req.session.registerUser = req.body;
        req.flash('error', validateUser.errorMessage);
        return res.redirect("back");
      }

      let superAdmin = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.email,
        email: req.body.email,
        password: req.body.password,
        superAdmin: true,
        userStatus: true,
      });
      superAdmin.save(function (error, user) {
        //there a bug here
        if (error) {
          console.log('There some error' + error);
        }
        console.log('Super Admin was created successfully');
        return res.redirect('/')
      });
    } else {
      console.log('Super Admin is already exist');
      return res.redirect('/')
    }

  })
});


router.get('/home', function (req, res, next) {
  return res.render('admin/homepage')
});

router.get('/users', function (req, res, next) {
  let pageNo = parseInt(req.query.pageNo);
  let size = parseInt(req.query.size);
  let query = {};
  if (isNaN(pageNo)) {
    pageNo = 1;
  }
  if (isNaN(size)) {
    size = 10;
  }
  if (pageNo < 0 || pageNo === 0) {
    return res.render('error', {
      error: {
        status: 'Error: ',
        stack: "Oopp! There are some error with the page number value"
      },
      message: "Incorrect page number"
    })
  }
  query.skip = size * (pageNo - 1)
  query.limit = size
  User.count({}, function (err, totalCount) {
    if (err) {
      return res.render('error', {
        error: {
          status: 'Error: ',
          stack: "Oopp! There are some error while get data"
        },
        message: "Error while fetching data"
      })
    }
    var totalPages = Math.ceil(totalCount / size)
    User.find({}, {}, query, function (err, users) {
      // Mongo command to fetch all data from collection.
      if (err) {
        return res.render('error', {
          error: {
            status: 'Error: ',
            stack: "Oopp! There are some error while get data"
          },
          message: "Error while fetching data"
        })
      }
      return res.render('admin/manage-user', {
        users,
        size,
        totalPages,
        totalCount,
        pageNo
      })
    });
  })
});

router.get('/user/:email', function (req, res, next) {
  User.find({
    email: req.params.email
  }, (error, user) => {
    if (error) {
      return res.render('error', {
        error: {
          status: 'Error: ',
          stack: "Oopp! There are some error with the page number value"
        },
        message: "Incorrect page number"
      })
    }
    return res.render('admin/edit-user', user)
  })
});


module.exports = router;