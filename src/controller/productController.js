const productModel = require('../models/productModel')
const validate = require('../validator/validators')
const aws = require('../validator/awsS3')

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
        return res.status(400).send({status:false, msg:"Is not valid available Sizes provide S, XS, M, L, XXL, XL "})
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
        availableSizes, //: newArr,
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


const getProduct = async (req, res) => {

    let {size, name, priceGreaterThan, priceLessThan} = req.query
    let filters ={}

    if(!validate.isValidRequestBody(req.query)) {
        let allData = await productModel.find( { isDeleted : false , deletedAt : null } )
        return res
        .status(200)
        .send({ status: true, message: `Success`, Data: allData })
    }

    if(req.query.hasOwnProperty('size')) {

        let validSizes = validate.isValidSize(size)
        if(!validSizes) {
            return res
            .status(400)
            .send({ status: false, message: `please Provide Available Size from ${["S", "XS","M","X", "L","XXL", "XL"]}` })
        }
        filters['availableSizes'] = { $in : validSizes }
    }

    if( 'name' in req.query ) {

        if(!validate.isValid(name)) {
            return res
            .status(400)
            .send({ status: false, message: `invalid Input - Name` })
        }
        filters['title'] = { $regex : name }

    }

    if( 'priceGreaterThan' in req.query && 'priceLessThan' in req.query  ) {

        if(!validate.isValidNumber(priceGreaterThan )) {
            return res
            .status(400)
            .send({ status: false, message: `invalid price - Enterd` })
        }

        if(!validate.isValidNumber(priceLessThan)) {
            return res
            .status(400)
            .send({ status: false, message: `invalid price - Enterd` })
        }
        
        filters['price'] = { $gt : priceGreaterThan, $lt : priceLessThan }
        
    }else if( 'priceGreaterThan' in req.query ) {

        if(!validate.isValidNumber(priceGreaterThan)) {
            return res
            .status(400)
            .send({ status: false, message: `invalid price - Enterd` })
        }

        filters['price'] = { $gt : priceGreaterThan }

    }else if( 'priceLessThan' in req.query ) {

        if(!validate.isValidNumber(priceLessThan)) {
            return res
            .status(400)
            .send({ status: false, message: `invalid price - Enterd` })
        }

        filters['price'] = { $lt : priceLessThan }

    }

    // console.log(filters)

    const dataByFilters = await productModel.find(filters)
    return res
    .status(200)
    .send({ status: true, message: `Success`, Data: dataByFilters })

}

module.exports.getProduct = getProduct

//...............................................................................

const updateProductById = async (req, res) => {
try {
    
    let requestBody = req.body;
    let productId = req.params.productId;
    let files = req.files;
  
    if (!validate.isValidObjectId(productId)) {
    return res
        .status(404)
        .send({ status: false, msg: "productId not found" });
    }
    let product = await productModel.findOne({ productId, isDeleted: false });
  
    if (!product) {
    return res
        .status(404)
        .send({ status: false, msg: "product not registered" });
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
        installments,
    } = requestBody;
  
    let updatedproductData = {};

    if (validate.isValid(style)) {
        if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
          updatedproductData["$set"] = {};
  
        updatedproductData["$set"]["style"] = style;
    }
  
      // description
    if (validate.isValid(price)) {
        if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
          updatedproductData["$set"] = {};
  
        updatedproductData["$set"]["price"] = price;
    }
  
    if (validate.isValid(title)) {
        if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
          updatedproductData["$set"] = {};
  
        updatedproductData["$set"]["title"] = title;
    }
      // description
    if (validate.isValid(description)) {
        if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
          updatedproductData["$set"] = {};
  
        updatedproductData["$set"]["description"] = description;
    }
  
    if (validate.isValid(currencyFormat)) {
        if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
          updatedproductData["$set"] = {};
  
        updatedproductData["$set"]["currencyFormat"] = currencyFormat;
    }
  
    if (validate.isValid(currencyId)) {
        if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
          updatedproductData["$set"] = {};
  
        updatedproductData["$set"]["currencyId"] = currencyId;
    }

    if (validate.isValid(isFreeShipping)) {
        if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
            updatedproductData["$set"] = {};
  
            updatedproductData["$set"]["isFreeShipping"] = isFreeShipping;
    }
  
    if (validate.isValid(availableSizes)) {
        if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
            updatedproductData["$set"] = {};
  
            updatedproductData["$set"]["availableSizes"] = availableSizes;
    }
  
    if (validate.isValid(installments)) {
        if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
          updatedproductData["$set"] = {};
  
        updatedproductData["$set"]["installments"] = installments;
    }
  
    let productImage = await aws.uploadFile(files[0]);
  
    if (!productImage) {
    res
    .status(400)
    .send({ status: false, msg: "error in uploading the files" });
    return
    }

    if (validate.isValid(productImage)) {
        if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};
  
        updatedproductData["$set"]["productImage"] = productImage;
    }
  
    let upadateduser = await productModel.findOneAndUpdate(
        { _id: productId },
         updatedproductData,
        { new: true }
    )
  
    return res
    .status(200)
    .send({status: true,message: "Product updated successfully", data: upadateduser });

} catch (error) {
    res.status(500)
    .send({ status: false, mesage: error.messege })
}
}

module.exports.updateProductById = updateProductById

//.........................................................................

const getProductById = async function (req, res) {
    try {
        let pid = req.params.productId
        if (!validate.isValidObjectId(req.params.productId)) {
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

//.....................................................................

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