var express = require('express');
var router = express.Router();

const ensure = require('connect-ensure-login');

const Application = require('../model/Application');
const User = require('../model/User');
const constMessage = require('../common/message');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/create-client', function (req, res, next) {
    if (req.body.user_id) {
        let user_id;
        User.findById(req.body.user_id, function (error, result) {
            if (error) {
                return res.json(error);
            }
            user_id = result;
            let newApplication = new Application({
                title: req.body.title,
                oauth_id: req.body.clientid,
                oauth_secret: req.body.clientsecret,
                domains: req.body.domains,
                owner: user_id
            })
            newApplication.save((error, application) => {
                if (error) {
                    return res.json(error)
                }
                return res.json(newApplication)
            });

        })


    }
})



module.exports = router;