var express = require('express');
var router = express.Router();

router.use('/api/login', require('./login'))
router.use('/api/device', require('./device'))
router.use('/api/device/itraq', require('./itraq'))
router.use('/api/device/arlo', require('./arlo'))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BLOCT' });
});

module.exports = router;
