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
});

router.post('/:isNew', function (req, res) {
    const arlo = new ArloApi(req.body.username, req.body.password);
    arlo.getDevices().then(deviceArray => {
        for (var i = 0; i < deviceArray.length; i++) {
            if (deviceArray[i].deviceType === 'camera') {
                var arloCamera = {
                    deviceName: deviceArray[i].deviceName,
                    deviceId: deviceArray[i].deviceId,
                    serialNumber: deviceArray[i].uniqueId,
                    firmwareVersion: deviceArray[i].firmwareVersion,
                    deviceTypeId: req.body.selectedDeviceType.id
                }
            }
        }
        arlo.getCameras(deviceArray[0].deviceId, deviceArray[0].xCloudId).then(cameras => {
            for (var i = 0; i < cameras.properties.length; i++) {
                if (arloCamera.deviceId === cameras.properties[i].serialNumber) {
                    arloCamera.batteryLevel = cameras.properties[i].batteryLevel
                }
            }
            var contractInstance = smart_contract.contract.at(smart_contract.deployedAddress);
            contractInstance.addDeviceData(arloCamera.deviceName, arloCamera.deviceId, arloCamera.serialNumber, arloCamera.firmwareVersion, {
                from: smart_contract.web3.eth.coinbase,
                gas: 900000
            }, (err, transactionHash) => {
                req.body.transactionHash = transactionHash;
                req.body.deviceId = arloCamera.deviceId;
                if (req.params.isNew === 'true') {
                    connection.db.collection('apidetails').insertOne(req.body, function (err, result) {
                        if (err) throw err;
                        connection.db.collection('devices').insertOne(arloCamera, function (err, result) {
                            if (err) throw err;
                            res.json({
                                success: true,
                                arloDevice: arloCamera
                            });
                        });
                    });
                } else {
                    connection.db.collection('apidetails').updateOne({
                        "selectedDeviceType.id": 3
                    }, req.body, function (err, result) {
                        if (err) throw err;
                        connection.db.collection('devices').updateOne({
                            deviceId: arloCamera.deviceId
                        }, req.body, function (err, result) {
                            if (err) throw err;
                            res.json({
                                success: true,
                                arloDevice: arloCamera
                            });
                        });
                    });
                }
            });
        });
    });
});

router.get('/blockchain', function (req, res) {
    var contractInstance = smart_contract.contract.at(smart_contract.deployedAddress);
    var device = contractInstance.getDeviceData.call('52M17B7PAAE79');
    if (device[0] == '') throw new Error('Not Found');
    arloDevice = {
        deviceName: device[0],
        deviceId: device[1],
        serialNumber: device[2],
        firmwareVersion: device[3]
    }
    res.json({
        success: true,
        arloDevice: arloDevice
    });
});

router.get('/', function (req, res) {
    connection.db.collection('devices').findOne({
        deviceTypeId: 3
    }, function (err, arloDevice) {
        if (err) throw err;
        res.json({
            success: true,
            arloDevice: arloDevice
        });
    });
});

module.exports = router;