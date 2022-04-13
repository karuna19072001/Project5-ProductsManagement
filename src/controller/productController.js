const productModel = require('../models/productModel')
const validate = require('../validator/validators')
const aws = require('../validator/awsS3')
//////////////////////////////////////////////////////////////////////////////////////
const createProduct = async (req, res) => {
try {
    
    if(!validate.isValidRequestBody(req.body)) {
        return res
        .status(400)
        .send({ status: false, message: `invalid request params` })
    }

    let files = req.files
    if (files && files.length > 0) {
        if(!validate.isValidImage(files[0])) {
            return res
            .status(400)
            .send({ status: false, message: `invalid image type` })
        }

    } 
    else {
      return res
      .status(400)
      .send({ status: false, msg: "No file to write" });
    }

    let {
        title,
        description,
        price,
        currencyId,
        currencyFormat,
        isFreeShipping,
        style,
        availableSizes,
        installments
    } = req.body
    
    if(!validate.isValid(title)) {
        return res
        .status(400)
        .send({ status: false, message: `title is required` })
    }

    if(!validate.isValid(description)) {
        return res
        .status(400)
        .send({ status: false, message:`invalid Discription` })
    }

    if(!validate.isValidNumber(parseInt(price))) {
        return res
        .status(400)
        .send({ status: false, message: `price attribute should be Number/ decimal Number Only` })
    }

    if(!validate.isValid(currencyId)) {
        return res
        .status(400)
        .send({ status: false, message: `please Provide Currency Id Field` })
    }

    if(currencyId != 'INR') {
        return res
        .status(400)
        .send({ status: false, message: `${currencyId} is Not A Valid Currency Id` })
    }

    if(!validate.isValid(currencyFormat)) {
        return res
        .status(400)
        .send({ status: false, message: `please Provide CurrencyFormat Field` })
    }

    if(currencyFormat != '₹') {
        return res
        .status(400)
        .send({ status: false, message: `${currencyFormat} Is Not A Valid Curency Format` })
    }

    if(!validate.isValid(isFreeShipping)) {
        return res
        .status(400)
        .send({ status: false, message: `Freeshipping Field Should Be Present` })
    }

    if(!validate.isValidBoolean(isFreeShipping)) {
        return res
        .status(400)
        .send({ status: false, message: `is Free Shipping Should Be a Boolean value` })
    }
   
    if(!availableSizes) {
        return res
        .status(400)
        .send({ status: false, message: `please Provide Avilable Sizes` })
    }

    if(availableSizes.length === 0) {
        return res
        .status(400)
        .send({ status: false, message: ` In Valid Input` })
    }
   
    const SizesEnum = function (availableSizes) {
  return ["S", "XS","M","X", "L","XXL", "XL"].indexOf(availableSizes) !== -1
}
   if(!SizesEnum(availableSizes)){
return res.status(400).send({status:false, msg:"Is not valid available Sizes provide S, XS, M, X, L, XXL, XL "})
}

    if(installments) {
        if(!parseInt(installments) ) {
            return res.status(400).send({ status: false, message: `Invalid installments`})
        }
    }
     
    let uploadedFileURL = await aws.uploadFile(files[0])
    console.log(uploadedFileURL)


    let finalData = {
        title,
        description,
        price,
        currencyId,
        currencyFormat,
        isFreeShipping,
        productImage : uploadedFileURL,
        style,
        availableSizes,
        installments
    }

    const newProduct = await productModel.create(finalData)
    return res
    .status(201)
    .send({ status: true, mesage:'Success', Data: newProduct })

} catch (err) {
    res
    .status(500)
    .send({ status: false, message: err.message })
}
}

module.exports.createProduct = createProduct

///////////////////////////////////////////////////////////////////////////////
const getProduct = async function (req, res) {
    try {


        let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query


        let filters = { isDeleted: false }

        if (size != null) {
            if (!validate.validForEnum(size)) {
                return res.status(400).send({ status: false, msg: 'No Such Size Exist in our Filters ... Select from ["S", "XS", "M", "X", "L", "XXL", "XL"]' })
            }
            filters["availableSizes"] = size
        }

        let arr = []

        if (name != null) {

            const random = await productModel.find({ isDeleted: false }).select({ title: 1, _id: 0 })
            for (let i = 0; i < random.length; i++) {
                var checkTitle = random[i].title

                let check = checkTitle.includes(name)
                if (check) {
                    arr.push(random[i].title)
                }

            }
            filters["title"] = arr

        }
        if (priceGreaterThan != null && priceLessThan == null) {
            filters["price"] = { $gt: priceGreaterThan }
        }


        if (priceGreaterThan == null && priceLessThan != null) {
            filters["price"] = { $lt: priceLessThan }
        }

        if (priceGreaterThan != null && priceLessThan != null) {
            filters["price"] = { $gte: priceGreaterThan, $lte: priceLessThan }
        }

        if (priceSort != null) {
            if (priceSort == 1) {
                const products = await productModel.find(filters).sort({ price: 1 })
                if (products.length == 0) {
                    return res.status(404).send({ status: false, message: "No data found that matches your search" })
                }
                return res.status(200).send({ status: true, message: "Results",count: products.length, data: products })
            }

            if (priceSort == -1) {
                const products = await productModel.find(filters).sort({ price: -1 })
                if (products.length == 0) {
                    return res.status(404).send({ status: false, message: "No data found that matches your search" })
                }
                return res.status(200).send({ status: true, message: "Results", count: products.length, data: products })
            }

        }

        const products = await productModel.find(filters)
        if (products.length == 0) {
            return res.status(404).send({ status: false, message: "No data found that matches your search" })
        }
        return res.status(200).send({ status: true, message: "Results",count: products.length, data: products })


    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }

}

module.exports.getProduct = getProduct

///////////////////////////////////////////////////////////////////////////////////////////////////////////


const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!(validate.isValid(productId))) {
            return res.status(400).send({ status: false, message: "Product Id is required" })
        }
        if (!(validate.isValidObjectId(productId))) {
            return res.status(400).send({ status: false, message: "Product Id is invalid" })
        }
        let updateData = req.body
        let objectData = {}

        if (Object.keys(updateData) == 0) {
            return res.status(400).send({ status: false, message: "enter data to update" })
        }

        if (validate.isValid(updateData.title)) {
            let findTitle = await productModel.findOne({ title: updateData.title })
            if (findTitle) {
                return res.status(400).send({ status: false, message: " Title already in use. Enter a unique title" })
            }
            objectData.title = updateData.title
        }
        if (validate.isValid(updateData.description)) {
            objectData.description = updateData.description
        }
        if (validate.isValid(updateData.price)) {
            if (!(validate.isRightFormatprice(updateData.price))) {
                return res.status(400).send({ status: false, message: `${updateData.price} is not a valid price. Please provide input in numbers.` })
            }

            objectData.price = updateData.price
        }
        if (validate.isValid(updateData.currencyId)) {
            if (updateData.currencyId.trim() !== "INR") {
                return res.status(400).send({ status: false, message: "Please provide Indian Currency Id" })
            }
            objectData.currencyId = updateData.currencyId
        }
        if (validate.isValid(updateData.currencyFormat)) {
            if (data.currencyFormat.trim() !== "₹") {
                return res.status(400).send({ status: false, message: "Please provide right format for currency" })
            }
            objectData.currencyFormat = updateData.currencyFormat
        }
        let files = req.files
        if (files && files.length > 0) {
            if(!validate.isValidImage(files[0])) {
                return res
                .status(400)
                .send({ status: false, message: `invalid image type` })
            }
        }
        if (validate.isValid(updateData.availableSizes)) {
            updateData.availableSizes = JSON.parse(updateData.availableSizes)
            if (!(validate.validForEnum(updateData.availableSizes))) {
                return res.status(400).send({ status: false, message: "Please provide a valid size" })
            }
            if (!(validate.isValidArray(updateData.availableSizes))) {
                return res.status(400).send({ status: false, message: "Please provide available size for your product" })
            }

        }
        if (validate.isValid(updateData.installments)) {
            objectData.installments = updateData.installments
        }

        const updateProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, objectData, { new: true })
        if (!updateProduct) {
            return res.status(404).send({ status: false, msg: "This product is not available or has been deleted" })
        }
        return res.status(200).send({ status: true, msg: "Product updated successfully", data: updateProduct })


    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.updateProduct = updateProduct

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getProductById = async function (req, res) {
    try {
        let pid = req.params.productId
        if (!validate.isValidObjectId(pid)) {
            return res
                .status(400)
                .send({ Status: false, msg: "Please provide valid Product id" })

        }

        let product = await productModel.findById(pid)
        if (!product) {
            return res
                .status(404)
                .send({ Status: false, msg: "No product with this id exists" })
        }

        if (product.isDeleted === true) { return res.status(400).send({ Status: false, msg: "Product is deleted" }) }


        return res.status(200).send({ Status: true, message: "Success", Data: product })



    } catch (err) { return res.status(500).send({ Status: false, msg: err.message }) }

}

module.exports.getProductById = getProductById

///////////////////////////////////////////////////////////////////////////////////////////

const deleteProductById = async function (req, res) {
    try {
        let pid = req.params.productId
        if (!validate.isValidObjectId(pid)) {
            return res
                .status(400)
                .send({ Status: false, msg: "Please provide valid Product id" })
        }


        let product = await productModel.findById(pid)

        if (!product) {
            return res
                .status(404)
                .send({ Status: false, msg: "Product not found" })
        }

        if (product.isDeleted === true) {
            return res
                .status(400)
                .send({ Status: false, msg: "Product already deleted" })
        }


       let deletedProduct= await productModel.findByIdAndUpdate(pid, { $set: { isDeleted: true, deletedAt: Date.now() } },{new:true})

        return res.status(200).send({Status:true , message:"Success" ,Data:deletedProduct })


    } catch (err) { return res.status(500).send({ Status: false, msg: err.message }) }

}

module.exports.deleteProductById = deleteProductById