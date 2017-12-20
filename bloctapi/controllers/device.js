var express = require('express'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    connection = require('../helpers/mongo_connections.js'),
    smart_contract = require('../helpers/smart_contract.js'),
    ArloApi = require('node-arlo-api/arlo-api');

router.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, 'shhhhh', function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });

    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
})

router.get('/deviceTypes', function (req, res) {
    connection.db.collection('devicetypes').find().toArray(function (err, deviceTypes) {
        if (err) throw err;
        res.json({
            success: true,
            deviceTypes: deviceTypes
        });
    });
});

router.get('/apiDetails', function (req, res) {
    connection.db.collection('apidetails').find().toArray(function (err, apiDetails) {
        if (err) throw err;
        res.json({
            success: true,
            apiDetails: apiDetails
        });
    });
});

module.exports = router;