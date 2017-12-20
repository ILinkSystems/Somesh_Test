var express = require('express'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    connection = require('../helpers/mongo_connections.js'),
    smart_contract = require('../helpers/smart_contract.js'),
    https = require('https');

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
});

router.post('/:isNew', function (req, res) {
    var authToken = '';
    var options = {
        host: 'portal.itraq.com',
        path: '/api/login',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var itraqReq = https.request(options, function (itraqRes) {
        if (itraqRes.statusCode === 200) {
            authToken = itraqRes.headers['x-auth-token'];
            var options = {
                host: 'portal.itraq.com',
                path: '/api/devices',
                method: 'get',
                headers: {
                    'X-AUTH-TOKEN': authToken,
                    'Content-Type': 'application/json'
                }
            };

            var itraqReq = https.request(options, function (itraqRes) {
                if (itraqRes.statusCode === 200) {
                    itraqRes.setEncoding('utf8');
                    itraqRes.on('data', function (body) {
                        var device = JSON.parse(body).data.content[0];
                        var itraqDevice = {
                            deviceName: device.name,
                            deviceId: device.id.toString(),
                            serialNumber: device.serialId,
                            firmwareVersion: device.firmwareVersion.toString(),
                            batteryLevel: device.batteryCharge,
                            imei: device.imei,
                            location: {
                                lat: device.lastLocation.latitude,
                                lon: device.lastLocation.longitude
                            },
                            deviceTypeId: req.body.selectedDeviceType.id
                        }
                        var contractInstance = smart_contract.contract.at(smart_contract.deployedAddress);
                        contractInstance.addDeviceData(itraqDevice.deviceName, itraqDevice.deviceId, itraqDevice.serialNumber, itraqDevice.firmwareVersion, {
                            from: smart_contract.web3.eth.coinbase,
                            gas: 900000
                        }, (err, transactionHash) => {
                            req.body.transactionHash = transactionHash;
                            req.body.deviceId = itraqDevice.deviceId;
                            if (req.params.isNew === 'true') {
                                connection.db.collection('apidetails').insertOne(req.body, function (err, result) {
                                    if (err) throw err;
                                    connection.db.collection('devices').insertOne(itraqDevice, function (err, result) {
                                        if (err) throw err;
                                        res.json({
                                            success: true,
                                            itraqDevice: itraqDevice
                                        });
                                    });
                                });
                            } else {
                                connection.db.collection('apidetails').updateOne({
                                    "selectedDeviceType.id": 1
                                }, req.body, function (err, result) {
                                    if (err) throw err;
                                    connection.db.collection('devices').updateOne({
                                        deviceId: itraqDevice.deviceId
                                    }, itraqDevice, function (err, result) {
                                        if (err) throw err;
                                        res.json({
                                            success: true,
                                            itraqDevice: itraqDevice
                                        });
                                    });
                                });
                            }
                        });
                    });
                }
            });
            itraqReq.on('error', function (e) {
                res.json({
                    success: false,
                    result: e.message
                });
            });

            itraqReq.write('');
            itraqReq.end();
        }
    });
    itraqReq.on('error', function (e) {
        res.json({
            success: false,
            result: e.message
        });
    });
    var obj = {
        email: req.body.username,
        password: req.body.password,
        apiKey: req.body.apiKey
    }
    itraqReq.write(JSON.stringify(obj));
    itraqReq.end();
});

router.get('/blockchain', function (req, res) {
    var contractInstance = smart_contract.contract.at(smart_contract.deployedAddress);
    var device = contractInstance.getDeviceData.call('14334');
    if (device[0] == '') throw new Error('Not Found');
    itraqDevice = {
        deviceName: device[0],
        deviceId: device[1],
        serialNumber: device[2],
        firmwareVersion: device[3]
    }
    res.json({
        success: true,
        itraqDevice: itraqDevice
    });
});



router.get('/', function (req, res) {
    connection.db.collection('devices').findOne({
        deviceTypeId: 1
    }, function (err, itraqDevice) {
        if (err) throw err;
        res.json({
            success: true,
            itraqDevice: itraqDevice
        });
    });
});

module.exports = router;