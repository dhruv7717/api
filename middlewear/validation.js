const Validator = require('Validator');
const { default: localizify } = require('localizify')
const { t } = require('localizify');
var con = require("../config/connection")
var cryptoLib = require('cryptlib')
var shakey = cryptoLib.getHashSha256(process.env.key,32)
var en = require("../language/en")
var hi = require("../language/hi")


var middleware = {

        
    checkvalidationrules: function (request, res, rules, message) {
        const v = Validator.make(request, rules, message);

        if (v.fails()) {
            const errors = v.getErrors();
            var error = "";
            for (var key in errors) {
                error = errors[key][0];
                console.log(error);
                break;
            }
            response_data = {
                code: '0',
                message: error
            }
            middleware.encryption(response_data, function (response) {
                res.send(response)
            })
        }
        else {
            return true;
        }
    },

    send_response: function (req, res, code, message, data) {
        // console.log(req.headers);
        this.getmessage(req.lang, message, function (translated_message) {

            if (data == null) {
                response_data = {
                    code: code,
                    message: translated_message
                }
                middleware.encryption(response_data, function (response) {
                    res.status(200);
                    res.send(response)
                })
            } else {
                response_data = {
                    code: code,
                    message: translated_message,
                    data: data
                }
                middleware.encryption(response_data, function (response) {
                    res.status(200);
                    res.send(response)
                })
            }
        })

    },

    getmessage: function (language, keywords, callback) {
        // console.log(language)
        localizify
            .add('en', en)
            .add('hi', hi)
            .setLocale(language);
        callback(t(keywords));

    },

    extractHeaderLauguage: function (req, res, callback) {
        var hearderlang = (req.headers['accept-language'] != undefined && req.headers['accept-language'] != "") ? req.headers['accept-language'] : 'en';
        req.lang = hearderlang;
        // console.log(hearderlang);
        req.language = (hearderlang == "hi") ? hi : en;

        callback();
        //    console.log(req.lang);
    },

    validateApiKey: function (req, res, callback) {
        var url_end_point = req.path.split('/');
        var unique_url_end_point = new Array('reset', 'resetpass')
        var api_key = (req.headers['api-key'] != undefined && req.headers['api-key'] != "") ? req.headers['api-key'] : '';

        if (unique_url_end_point.includes(url_end_point[4])) {
            callback()

        }
        else {
            if (api_key != "") {
                try {
                    var dec_apikey = cryptoLib.decrypt(api_key, shakey, process.env.iv)
                    if (dec_apikey != "" && dec_apikey == process.env.api_key) {
                        callback()
                    } else {
                        var response_data = {
                            code: '0',
                            message: "Invalid Api Key"
                        }
                        middleware.encryption(response_data, function (response) {
                            res.status(401);
                            res.send(response)
                        })
                    }
                } catch (error) {
                    response_data = {
                        code: '0',
                        message: "Invalid Api Key"
                    }
                    middleware.encryption(response_data, function (response) {
                        res.status(401);
                        res.send(response)
                    })
                }
            } else {
                response_data = {
                    code: '0',
                    message: "Invalid Api Key"
                }
                middleware.encryption(response_data, function (response) {
                    res.status(401);
                    res.send(response)
                })
            }
        }
    },

    validateHedertoken: function (req, res, callback) {
        // console.log(req.headers['token']);
        var url_end_point = req.path.split('/');
        var unique_url_end_point = new Array("userlogin","useradd","reset","resetpass","listglass","validuser")
        var unique_token = (req.headers['token'] != undefined && req.headers['token'] != "") ? req.headers['token'] : '';

        if (unique_url_end_point.includes(url_end_point[4])) {
            callback()
        }
        else {
            if (unique_token != "") {
                try {
                    var dec_token = cryptoLib.decrypt(unique_token,shakey,process.env.IV)
                    if (dec_token != "") {
                        
                        con.query("select * from tbl_user_deviceinfo where token =?", [dec_token], function (error, result) {
                            if (!error && result.length > 0) {
                                req.user_id = result[0].user_id;
                                callback();
                            } else {
                                response_data = {
                                    code: '0',
                                    message: "Invalid token"
                                }
                                middleware.encryption(response_data, function (response) {
                                    res.status(401);
                                    res.send(response)
                                })
                            }

                        })
                    } else {
                        var response_data = {
                            code: '0',
                            message: "Invalid token"
                        }
                        middleware.encryption(response_data, function (response) {
                            res.status(401);
                            res.send(response)
                        })
                    }
                } catch (error) {
                    var response_data = {
                        code: '0',
                        message: "Invalid token"
                    }
                    middleware.encryption(response_data, function (response) {
                        res.status(401);
                        res.send(response)
                    })
                }
            } else {
                var response_data = {
                    code: '0',
                    message: "Invalid token"
                }
                middleware.encryption(response_data, function (response) {
                    res.status(401);
                    res.send(response)
                })
            }
        }
    },

    decryption: function (req, callback) {
        // console.log(req);
        if (req != undefined && Object.keys(req).length !== 0) {
            try {
                var request = JSON.parse(cryptoLib.decrypt(req, shakey, process.env.IV));
                console.log(request);
                callback(request);
            } catch {
                callback({});
            }
        } else {
            callback({});
        }
    },

    encryption: function (response_data, callback) {
        var response = cryptoLib.encrypt(JSON.stringify(response_data), shakey, process.env.IV);
        callback(response);
    }

}

module.exports = middleware;