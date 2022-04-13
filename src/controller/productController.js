const productModel = require("../models/productModel")
const aws = require("aws-sdk");
//const validation = require("../validation/validation")
//const currencyFormatter = require("currency-formatter")

const jwt = require("jsonwebtoken")

/**********************************************************************************************88 */

const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim.length === 0) return false
    return true

}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

/******************************************************************************************************** */
aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)


let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: "2006-03-01" })

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "group10/" + file.originalname,
            Body: file.buffer
        }
        console.log(uploadFile)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }

            return resolve(data.Location)
        }
        )

    }
    )
}


const pic = async function (req, res) {
    try {
        let files = req.files
        if (files && files.length > 0) {
            let profileImage = await uploadFile(files[0])
            res.status(201).send({ msg: "file uploaded succesfully", data: profileImage })
        }
        else {
            res.status(400).send({ msg: "No file found" })
        }
    }
    catch (err) {
        res.status(500).send({ msg: err })
    }
}


const createProduct = async function (req, res) {
    try {
        let data = req.body
        let files = req.files
        let finalData = req.body
        //let address = JSON.parse(req.body.address)

        //const { fname, lname, email, phone, password } = data
        let productImagessweetselfie
        if (files && files.length > 0) {
            productImagessweetselfie = await uploadFile(files[0])
        }
        console.log(productImagessweetselfie)
        const { title, description, price, currencyId, currencyFormat, productImage, style, availableSizes, installments } = finalData
        console.log(finalData)
        data.productImage = productImagessweetselfie
        finalData.productImage = productImagessweetselfie
        //data.address = address

        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, msg: "Please Enter some data" })

        if (!isValid(title)) {
            return res.status(404).send({ status: false, msg: "Title is required" })
        }
        const alreadyExsit = await productModel.findOne({ title: title })
        if (alreadyExsit) {
            return res.status(400).send({ status: false, msg: "Title already exit" })
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, msg: "Description is required" })
        }

        if (!isValid(price)) {
            return res.status(400).send({ status: false, msg: "Price is required" })
        }

        if (isValid(price))
            if (!(/(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/)) {
                return res.status(400).send({ status: false, msg: "Please Enter Valid Amount" })
            }

        if (!isValid(currencyId))
            return res.status(400).send({ status: false, msg: "CurrencyId is required" })

        // if(isValid(data.currencyId))
        // if(!(INR))
        // return res.status(400).send({ status: false, msg: "INR is required" })

        if (!isValid(currencyFormat))
            return res.status(400).send({ status: false, msg: "CurrencyFormat is required" })

        // if(!currencyFormatter(isValid(currencyFormat)))
        // return res.status(400).send({ status: false, msg:"Please provide the Indian Currency"})

        // if (!isValid(productImage)) {
        //     return res.status(400).send({ status: false, msg: "ProductImage is Required" })
        // }

        const availableSizesEnum = function (availableSizes) {
            return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) !== -1
        }

        if (!availableSizesEnum(availableSizes)) {
            return res.status(400).send({ status: false, msg: "Is not valid size provide S, XS, M, X, L, XXL, XL" })
        }

        const output = await productModel.create(data)
        return res.status(201).send({ msg: "Data uploaded succesfully", data: output })

    } catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}


// const getProduct = async function (req, res) {
//     try {
//         const Query = { isDeleted: false, deletedAt: null }
//         const queryParams = req.query
//         const { price, productName, size } = queryParams
//         if (isValid(price)) {
//             Query['price'] = price                 //crate data in array form
//         }
//         if (isValid(productName)) {
//             Query['productName'] = productName
//         }
//         if (isValid(size)) {
//             Query['size'] = size
//         }
//         const product = await productModel.find(Query).select({ product_id: 1, title: 1, description: 1, price: 1, size: 1, currencyId: 1, currencyFormat: 1, isFreeShipping: 1, style: 1, availableSizes:1, installments:1,})
//         if (product.length === 0) {
//             return res.status(404).send({ status: false, msg: "Invalid Data" })
            
//         } 
        
//         if (price || productName || size) {
//             let sortedProduct = await productModel.find({ $and: [{ isDeleted: false, deletedAt: null }, { $or: [{ price: price, isDeleted: false }, { productName: productName }, { size: size }] }] }).sort({ "price": 1}  || {"price": -1})
//             return res.status(200).send({ status: true, data: sortedProduct})
//         }
        

//         return res.status(200).send({ status: true,  data: product });

//     } catch (error) {
//         return res.status(500).send({ status: "failed", msg: error.message })
//     }

// }


const getProduct = async function (req, res) {
    try {
        const input = req.query
        let filters = {}
        let { size, name, priceGreaterThan, priceLessThan } = input

        if (isValid(size)) {
            filters[availableSizes] = size
        }

        if (name) {
            filters[title] = name
        }
        if (!priceGreaterThan) {
            priceGreaterThan = 0
        }

        if(!price){
            price = 0
        }

        if (priceLessThan) {
            const products = await productModel.find({ isDeleted: false }, filters, { price: { $gt: priceGreaterThan, $lt: priceLessThan } }).sort({ price: 1 })
            return res.status(200).send({ status: true, msg: "Results", data: products })
        }
        else if (!priceLessThan) {
            const products = await productModel.find({ isDeleted: false }, filters, { price: { $gt: priceGreaterThan } }).sort({ price: 1 })
            return res.status(200).send({ status: true, msg: "Results", data: products })
        }

        // const product = await productModel.find(input).select({ product_id: 1, title: 1, description: 1, price: 1, size: 1, currencyId: 1, currencyFormat: 1, isFreeShipping: 1, style: 1, availableSizes:1, installments:1,})
        // if (product.length === 0) {
        //     return res.status(404).send({ status: false, msg: "Invalid Data" })
            
        // } 
        
        // if (price || productName || size) {
        //     let sortedProduct = await productModel.find({ $and: [{ isDeleted: false, deletedAt: null }, { $or: [{ price: price, isDeleted: false }, { productName: productName }, { size: size }] }] }).sort({ "price": 1}  )
        //     return res.status(200).send({ status: true, data: sortedProduct})
        //}
        

        return res.status(200).send({ status: true,  data: product });



    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }

}







const deleteproduct = async (req, res) =>  {
    try {
        let product_Id = req.params.productId
        //Validate: The productId is valid or not.
        let product = await productModel.findById(product_Id)
        if (!product) return res.status(404).send({ status: false, message: "product does not exists" })

        //Validate: If the productId exists (must have isDeleted false)
        let is_Deleted = product.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, message: "product is already deleted" })

        //Deleting a product document by its product_Id
        let deletedproduct = await productModel.findOneAndUpdate({ _id: product_Id },
            {
                $set: {
                   isDeleted: true , deletedAt: new Date()
                }
            }, { new: true })

        return res.status(200).send({ status: true, message: "Your product details have been successfully deleted", data: deletedproduct })
    }

    //Exceptional error handling
    catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { pic, createProduct, getProduct, deleteproduct }