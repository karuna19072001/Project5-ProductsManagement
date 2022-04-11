const express = require('express');
const router = express.Router();

const middleware=require("../middleware/auth")

const url1= require("../controller/userController")

router.post("/write-file-aws", url1.pic)

router.post("/register", url1.createUSer)

router.post("/logIn",url1.logIn)





module.exports= router;