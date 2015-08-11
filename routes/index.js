var express = require('express');
var passport = require('passport');
var basicAuth = require("../auth/basic");
var router = express.Router();

/* GET home page. */
router.get('/', basicAuth.isAuthenticated, function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.send(req.user);
});

module.exports = router;
