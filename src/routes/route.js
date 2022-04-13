const express = require('express');
const router = express.Router();
const middleware=require("../middleware/auth")
const url1= require("../controller/userController")
const url2 = require("../controller/productController")



router.post("/write-file-aws", url1.pic)

router.post("/register", url1.createUser)

router.post("/login",url1.logIn)


router.get("/user/:userId/profile",middleware.auhtentication,url1.getProfile)

router.put("/user/:userId/profile",middleware.auhtentication, url1.updateUser)

router.post("/products" , url2.createProduct )

router.get("/products", url2.getProduct)

router.get("/products/:productId", url2.getProductById)

router.delete("/products/:productId" , url2.deleteproduct)

module.exports= router;