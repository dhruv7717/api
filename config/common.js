var nodemailer = require('nodemailer');
var con = require("../config/connection")



var common = {

    // mail sender:
    sendMail: function (to_email, subject, message, callback) {
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        var mailOptions = {
            from: process.env.EMAIL_ID,
            to: to_email,
            subject: subject,
            html: message
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                callback(false)
            } else {
                console.log('Email sent: ' + info.response);
                callback(true)
            }
        });
    },

    // product code ganrate: 
    updateproductcode: function () {
        var randomtoken = require('rand-token').generator();
        return productcode = randomtoken.generate(12, "abcdefghijklmnopqrstuvwxyz");     
    },

    // token update:
    checkupdatetoken: function (user_id, request, callback) {
        var randomtoken = require('rand-token').generator();
        var usersession = randomtoken.generate(64, "0123456789abcdefghijklmnopqrstuvwxyz");
        con.query("select * from tbl_user_deviceinfo where user_id = ?", [user_id], function (error, result) {
            if (!error && result.length > 0) {
                // update
                var insertdeviceparams = {
                    device_type: (request.device_type != undefined) ? request.device_type : 'A',
                    device_token: (request.device_token != undefined) ? request.device_token : '0',
                    token: usersession
                }
                con.query("update tbl_user_deviceinfo set ? where user_id = ? ", [insertdeviceparams, user_id], function (err, response) {
                    callback(usersession);
                });
            } else {
                // insert
                var insertdeviceparams = {
                    device_type: (request.device_type != undefined) ? request.device_type : 'A',
                    device_token: (request.device_token != undefined) ? request.device_token : '0',
                    token: usersession,
                    user_id: user_id
                }
                con.query("insert into tbl_user_deviceinfo set ?", [insertdeviceparams], function (err, response) {
                    callback(usersession);
                })
            }
        })

    },

    //  randomk token generator:
    randomotpgenerator: function () {
        return Math.floor(1000 + Math.random() * 9000);
        // return '4456';
    },




};

module.exports = common;