const express = require('express');
const router = express.Router();

const url1= require("../controller/userController")

router.post("/write-file-aws", url1.pic)

router.post("/register", url1.createUSer)

router.get("/user/:userId/profile", url1.getProfie)

router.put("/user/:userId/profile", url1.updateUser)





module.exports= router;