var express = require('express');
var route = express.Router();
var product = require('./product');
var middleware = require("../../../middlewear/validation");
var multer = require('multer');
var path = require('path');
// var localizify = require('localizify');
const { t } = require('localizify');
const { log } = require('console');
const { request } = require('http');























module.exports = route