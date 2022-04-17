
const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const userAuth = require('../middleware/auth')

router.post('/register', userController.register)
router.post('/login', userController.useLogin)
router.get('/user/:userId/profile',  userController.getUserById)
router.put('/user/:userId/profile',  userController.updateProfile)

router.post('/products', productController.createProduct)
router.get("/products", productController.getProduct);
router.get("/products/:productId", productController.getProductById);
router.put("/products/:productId", productController.updateProduct);
router.delete("/products/:productId", productController.deleteProductById);

router.post("/users/:userId/cart", cartController.createCart )
router.put("/users/:userId/cart", cartController.removeProduct)
router.get("/users/:userId/cart", cartController.getCart)
router.delete("/users/:userId/cart", cartController.deleteCart)

module.exports = router