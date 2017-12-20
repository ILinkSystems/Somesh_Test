var express = require('express'),
    router = express.Router(),
    NestApi = require('nest-api'),
    Blink = require('node-blink-security'),
    fs = require('fs'),
    solc = require('solc'),
    Web3 = require('web3');


const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const input = fs.readFileSync('contracts/devicemetadata.sol');
const output = solc.compile(input.toString(), 1);
const bytecode = output.contracts[':DeviceMetaData'].bytecode;
const abi = JSON.parse(output.contracts[':DeviceMetaData'].interface)
const contract = web3.eth.contract(abi);
const contractInstance = contract.new({
    data: '0x' + bytecode,
    from: web3.eth.coinbase,
    gas: 3000000
}, (err, res) => {
    if (err) {
        console.log(err);
        return;
    }

    // Log the tx, you can explore status with eth.getTransaction()
    console.log('Transaction Hash: ' + res.transactionHash);

    // If we have an address property, the contract was deployed
    if (res.address) {
        console.log('Contract address: ' + res.address);
        testContract(res.address);
    }
});


/* GET users listing. */
router.post('/', function(req, res, next) {
    const deviceId = contractInstance.getDeviceData.call().toLocaleString()
    console.log(deviceId);
    nestApi = new NestApi(req.body.username, req.body.password)
    nestApi.login(function(data) {
        nestApi.get(function(data) {
            res.json({
                success: true,
                responseData: data
            });
        });
    });
});

function testContract(address) {
    console.log(address)
    const contractInstance = contract.at(address);
    contractInstance.addDeviceData('TestIoTDevice', 152, '0767868', '14.0', { from: web3.eth.coinbase, gas: 900000 })    
}

module.exports = router;
