require('dotenv').config();
const express = require('express');
const app = express();
var con = require('./config/connection');
    
app.use(express.text());    //engine = text/json (encript & decript)
app.use(express.urlencoded({extended:false}))

// app.use('/v1/api_document/', require('./module/v1/api_document/index'));  //api document paTH
var auth = require("./module/v1/auth/route");   //user route path
var product = require("./module/v1/product/route");    //product route path 


app.use('/', require('./middlewear/validation').extractHeaderLauguage)  //Language path
app.use('/', require('./middlewear/validation').validateApiKey)         //..api_key path
app.use('/', require('./middlewear/validation').validateHedertoken)    //..token path

app.use('/api/v1/auth',auth);
app.use('/api/v1/product',product);
app.engine('html',require('ejs').renderFile)
app.set('view engine','html')

app.listen(process.env.PORT,()=>{
    console.log('server is connected',process.env.PORT)
})