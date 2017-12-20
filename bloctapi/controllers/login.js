var express = require('express'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    connection = require('../helpers/mongo_connections.js');

router.post('/authenticate', function (req, res) {
    connection.db.collection('users').findOne({
        loginName: req.body.username
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({
                success: false,
                message: 'Authentication failed. User not found.'
            });
        } else if (user) {
            if (user.password != req.body.password) {
                res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password.'
                });
            } else {
                var token = jwt.sign({
                    name: user.loginName,
                    password: user.password
                }, 'shhhhh', {
                    expiresIn: 60 * 60
                });
                res.json({
                    success: true,
                    message: 'Authenticated successfully',
                    token: token,
                    user: user
                });
            }

        }
    });
})

module.exports = router