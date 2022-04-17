const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const validator = require('../validator/validators')
const aws = require('../validator/awsS3')
//const ObjectId = mongoose.Schema.Types.ObjectId
const mongoose = require('mongoose')


const createCart = async function (req, res) {
  try {

      let requestBody = req.body
      let cartId = req.body.cartId
      let userId = req.params.userId
      let userIdFromToken = req.userId

      //----------------Validation Starts-------------------------------------//

      if (!validator.isValidRequestBody(requestBody)) {
          return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide cart details.' })
      }

      // body validation
      if (!validator.isValidObjectId(userId)) {
          return res.status(400).send({ status: false, message: "Invalid userId in body" })
      }
      // do authorisation here

      

      let isUserIdExists = await userModel.findOne({ _id: userId })
     
     
      if (!isUserIdExists) {
          return res.status(400).send({ status: false, message: "UserId does not exits" })
      }
      
      // if (isUserIdExists._id.toString() !== userIdFromToken) {
      //     res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
      //     return
      // }
      let cart = await cartModel.findOne({ userId: userId })

      // Extract body
      const { productId, quantity } = requestBody

      if (!validator.isValidObjectId(productId)) {
          return res.status(400).send({ status: false, message: "Invalid productId provided" })
      }
      let product = await productModel.findOne({ _id: productId, isDeleted: false })
      if (!product) {
          return res.status(400).send({ status: false, message: `No such product present ,unable to add product ${productId} to cart.` })
      }


      if (!(!isNaN(Number(quantity)))) {
          return res.status(400).send({ status: false, message: `Quantity should be a valid number` })
      }
      if (quantity <= 0 || !validator.isValidInteger(quantity)) {
          return res.status(400).send({ status: false, message: `Quantity must be greater than zero and must be an integer ` })
      }


      let isAlredyCartExists = await cartModel.findOne({ userId: userId })

      if (isAlredyCartExists) {

          //---------Total price
          let priceSum = isAlredyCartExists.totalPrice + (product.price * quantity)

          //----------------
          
          let arr = isAlredyCartExists.items
          
          for (i in arr) {
              if (arr[i].productId.toString() === productId) {
                  arr[i].quantity = quantity.length + 1

                 
                  const updatedCart = {
                      items: arr,
                      totalPrice: priceSum,
                      totalItems: arr.length
                  }
                

                  let data = await cartModel.findOneAndUpdate({ _id: isAlredyCartExists._id }, updatedCart, { new: true })
                  return res.status(201).send({ status: true, data: data })
              }
         
          }

          arr.push({ productId: productId, quantity: quantity })
          const updatedCart = {
              items: arr,
              totalPrice: priceSum,
              totalItems: arr.length
          }

          let data = await cartModel.findOneAndUpdate({ _id: isAlredyCartExists._id }, updatedCart, { new: true })
          return res.status(201).send({ status: true, data: data })

      }
     
      // TODO----------------------------create new cart

      let priceSum = product.price * quantity
      let itemArr = [{ productId: productId, quantity: quantity }]

      const updatedCart = {
          userId: userId,
          items: itemArr,
          totalPrice: priceSum,
          totalItems: 1
      }

      let data = await cartModel.create(updatedCart)
      res.status(201).send({ status: true, data: data })

  }
  catch (error) {
      console.log(error)
      res.status(500).send({ status: false, data: error.message });
  }

}



const removeProduct = async function (req, res) {

    try {
        const requestBody = req.body

        const userId = req.params.userId

        const userIdFromToken = req.UserId


        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request , cart unmodified ' })
            return
        }

        // if (!validator.isValidObjectId(userIdFromToken)) {
        //     res.status(400).send({ status: false, message: `${userIdFromToken} is not a valid token id` })
        //     return
        // }

        // if (!(userId === userIdFromToken)) {
        //     res.status(403).send({ status: false, message: `Not Authorised` })
        //     return
        // }
        
       

        let { productId, cartId, quantity, removeProduct } = requestBody

        // Validation stats
        if (!validator.isValid(productId)) {
            res.status(400).send({ status: false, message: `ProductId is required` })
            return
        }

        if (!validator.isValid(removeProduct)) {
            res.status(400).send({ status: false, message: `RemoveProduct is required` })
            return
        }

        if (!validator.isValid(cartId)) {
            res.status(400).send({ status: false, message: ` cartId is required` })
            return
        }

        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
            return
        }

       

        let product = await productModel.findOne({ _id: productId, isDeleted: false, deletedAt: null })

        if (!product) {
            res.status(404).send({ Status: false, msg: "product doesn't exist" })
            return
        };

        let cart = await cartModel.findOne({ _id: cartId })

        if (!cart) {
            res.status(404).send({ Status: false, msg: "cart doesn't exist" })
            return
        };

        if (!validator.isValidNumber(removeProduct)) {
            res.status(400).send({ Status: false, msg: "removeProduct should be a Number" })
            return
        }

        // if (!(removeProduct === 1 || removeProduct === 0)) {
        //     res.status(400).send({ Status: false, msg: "removeProduct should be either 0 or 1" })
        //     return
        // }

        let items = cart.items

        let updatePrice = 0

        if (removeProduct === 1) {

            if (cart) {
                for (let i = 0; i < items.length; i--) {
                    if (productId == items[i].productId) {
                        updatePrice = items[i].quantity * product.price
                        items.splice(items[i], 1)
                    }
                }
            }
        }

        if (removeProduct === 0) {

            if (cart) {
                for (let i = 0; i < items.length; i++) {
                    if (productId == items[i].productId) {
                        items[i].quantity = items[i].quantity -1
                        updatePrice = product.price
                    }
                }
            }
        }
      

        let update = { $set: { items: items } };

        update['$inc'] = {}

        update['$inc']= updatePrice;

        const updatedcart = await cartModel.findOneAndUpdate({ _id: cartId },   update, { new: true })

        res.status(200).send({ status: true, message: 'cart Details Updated', data: updatedcart });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}




const getCart = async function (req, res) {
    try {
        const userId = req.params.userId

        const userIdFromToken = req.UserId

        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
            return
        }

        // if (!validator.isValidObjectId(userIdFromToken)) {
        //     res.status(400).send({ status: false, message: `${userIdFromToken} is not a valid token id` })
        //     return
        // }

        // if (!(userId === userIdFromToken)) {
        //     res.status(403).send({ status: false, message: `Not Authorised` })
        //     return
        // }

        const user = await userModel.findOne({ _id: userId })

        if (!user) {
            res.status(404).send({ status: false, message: "User not found" })

        }


        const cart = await cartModel.find({ userId: userId })
        res.status(200).send({ status: true, message: "cart Details", data: cart })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const deleteCart = async (req, res) => {
  try {
    const userIdFromParams = req.params.userId;
    const userIdFromToken = req.userId;

    if (!validator.isValid(userIdFromParams)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter the userId" });
    }
    if (!validator.isValidObjectId(userIdFromParams)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a valid userId" });
    }

    // if (!validator.isValidObjectId(userIdFromToken)) {
    //   return res
    //     .status(400)
    //     .send({ status: "FAILURE", msg: "token user id not valid" });
    // }

    // if (userIdFromParams !== userIdFromToken) {
    //   return res
    //     .status(400)
    //     .send({ status: "FAILURE", msg: "user not authorised" });
    // }

    const user = await userModel.findOne({ _id: userIdFromParams });

    if (!user) {
      return res.status(404).send({ status: "FAILURE", msg: "user not found" });
    }

const deletedCart = await cartModel.findOneAndUpdate(
  {
    userId: userIdFromParams,
  },
  { $set: { items: null, totalItems: 0, totalPrice: 0, isDeleted: true , deletedAt : Date.now() } },
  { new: true }
);

if (!deletedCart) {
  return res
    .status(404)
    .send({ status: "FAILURE", msg: "cart not found!! add some products" });
}



res.status(200).send({ status: "SUCCESSFULLY DELETED ", data: deletedCart });
} catch (error) {
res.status(500).send({ status: "FAILURE", msg: error.message });
}
};
      


module.exports = {
    createCart,
    removeProduct,
    getCart,
    deleteCart
}





