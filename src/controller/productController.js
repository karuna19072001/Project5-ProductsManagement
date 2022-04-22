const productModel = require('../models/productModel')
const validate = require('../validator/validators')
const aws = require('../validator/awsS3')


/********************** CREATE PRODUCT *************************/

const createProduct = async (req, res) => {
    try {

        if (!validate.isValidRequestBody(req.body)) {
            return res.status(400).send({
                status: false,
                message: `invalid request params`
            })
        }

        let files = req.files
        if (files && files.length > 0) {
            if (!validate.isValidImage(files[0])) {
                return res.status(400).send({
                    status: false,
                    message: `invalid image type`
                })
            }

        }
        else {
            return res.status(400).send({
                status: false,
                msg: "No file to write"
            });
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

        if (!validate.isValid(title)) {
            return res.status(400).send({
                status: false,
                message: `title is required`
            })
        }

        let titleUsed = await productModel.findOne({ title })
        if (titleUsed) {
            return res.status(400).send({
                status: false,
                message: "title must be Unique"
            })
        }


        if (!validate.isValid(description)) {
            return res.status(400).send({
                status: false,
                message: `invalid Discription`
            })
        }

        if (!validate.isValidNumber(parseInt(price))) {
            return res.status(400).send({
                status: false,
                message: `price attribute should be Number/ decimal Number Only`
            })
        }

        if (!validate.isValid(currencyId)) {
            return res.status(400).send({
                status: false,
                message: `please Provide Currency Id Field`
            })
        }

        if (currencyId != 'INR') {
            return res.status(400).send({
                status: false,
                message: `${currencyId} is Not A Valid Currency Id`
            })
        }

        if (!validate.isValid(currencyFormat)) {
            return res.status(400).send({
                status: false,
                message: `please Provide CurrencyFormat Field`
            })
        }

        if (currencyFormat != '₹') {
            return res.status(400).send({
                status: false,
                message: `${currencyFormat} Is Not A Valid Curency Format`
            })
        }

        if (!validate.isValid(isFreeShipping)) {
            return res.status(400).send({
                status: false,
                message: `Freeshipping Field Should Be Present`
            })
        }

        if (!validate.isValidBoolean(isFreeShipping)) {
            return res.status(400).send({
                status: false,
                message: `is Free Shipping Should Be a Boolean value`
            })
        }

        if (!validate.isValid(style)) {
            return res.status(400).send({
                status: false,
                message: `This style should not be available`
            })
        }

        if (!availableSizes) {
            return res.status(400).send({
                status: false,
                message: `please Provide Avilable Sizes`
            })
        }

        if (availableSizes.length === 0) {
            return res.status(400).send({
                status: false,
                message: ` In Valid Input`
            })
        }

        const SizesEnum = function (availableSizes) {
            return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) !== -1
        }
        if (!SizesEnum(availableSizes)) {
            return res.status(400).send({
                status: false,
                msg: "Is not valid available Sizes provide S, XS, M, X, L, XXL, XL "
            })
        }

        if (installments) {
            if (!parseInt(installments)) {
                return res.status(400).send({
                    status: false,
                    message: `Invalid installments`
                })
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
            productImage: uploadedFileURL,
            style,
            availableSizes,
            installments
        }

        const newProduct = await productModel.create(finalData)
        return res.status(201).send({
            status: true,
            message: 'Success',
            Data: newProduct
        })

    } catch (err) {
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}



/******************************GET PRODUCT******************************/

const getProduct = async function (req, res) {
    try {
        const queryParams = req.query
        const body = req.body

        if (validate.isValidRequestBody(body)) {
            return res.status(400).send({
                status: false,
                message: `Don't you understand about query params`
            })
        }

        const { name, priceGreaterThan, priceLessThan, priceSort, size } = queryParams

        const product = {}

        if (size) {

            const searchSize = await productModel.find({ availableSizes: size, isDeleted: false }).sort({ price: priceSort })

            if (searchSize.length !== 0) {
                return res.status(200).send({
                    status: true,
                    message: 'Success',
                    data: searchSize
                })
            }
            else {
                return res.status(400).send({
                    status: false,
                    message: `product not found with this ${size}`
                })
            }
        }

        if (name) {
            const searchName = await productModel.find({ title: { $regex: name }, isDeleted: false }).sort({ price: priceSort })

            if (searchName.length !== 0) {
                return res.status(200).send({
                    status: true,
                    message: 'Success',
                    data: searchName
                })
            }
            else {
                return res.status(400).send({
                    status: false,
                    message: `product not found with this ${name}`
                })
            }
        }

        if (priceGreaterThan) {
            product["$gt"] = priceGreaterThan
        }

        if (priceLessThan) {
            product["$lt"] = priceLessThan
        }

        if (priceLessThan || priceGreaterThan) {
            const searchPrice = await productModel.find({ price: product, isDeleted: false }).sort({ price: priceSort })

            if (searchPrice.length !== 0) {
                return res.status(200).send({
                    status: true,
                    message: 'Success',
                    data: searchPrice
                })
            }
            else {
                return res.status(400).send({
                    status: false,
                    message: 'product not found with this range'
                })
            }
        }

        const Products = await productModel.find({ data: product, isDeleted: false }).sort({ price: priceSort })
        if (Products !== 0) {
            return res.status(200).send({
                status: true,
                message: 'Success',
                count: Products.length,
                data: Products
            })
        }
        else {
            return res.status(404).send({
                status: false,
                message: 'No product exist in database'
            })
        }
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}




/**************************** UPDATE PRODUCT BY ID **********************************/

const updateProductById = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/.test(productId.trim()))) {
            return res.status(400).send({
                status: false,
                message: 'Please provide valid product id in Params'
            })
        }

        let product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) {
            return res.status(400).send({
                status: false,
                message: `Provided ProductId ${productId} Does not exists`
            })
        }

        let updateBody = req.body

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = updateBody

        let files = req.files
        if (files) {
            if (Object.keys(files).length != 0) {
                const updateProductImage = await aws.uploadFile(files[0]);
                updateBody.productImage = updateProductImage;
            }
        }

        if (!validate.isValidRequestBody(updateBody)) {
            return res.status(400).send({
                status: false,
                message: 'Please, provide some data to update'
            })
        }

        if (!validate.validString(title)) {
            return res.status(400).send({
                status: false,
                message: 'Title cannot be empty'
            })
        }

        let duplicateTitle = await productModel.findOne({ title: title })

        if (duplicateTitle) {
            return res.status(400).send({
                status: false,
                message: 'Title is already exist'
            })
        }

        if (!validate.validString(description)) {
            return res.status(400).send({
                status: false,
                message: 'Description cannot be empty'
            })
        }

        if (!validate.validString(currencyId)) {
            return res.status(400).send({
                status: false,
                message: 'currencyId cannot be empty'
            })
        }

        if (currencyId) {
            if (!(currencyId == 'INR')) {
                return res.status(400).send({
                    status: false,
                    message: 'currencyId should be a INR'
                })
            }
        }
        if (!validate.validString(style)) {
            return res.status(400).send({
                status: false,
                message: 'style cannot be empty'
            })
        }

        if (!validate.validString(installments)) {
            return res.status(400).send({
                status: false,
                message: 'installments cannot be empty'
            })
        }

        if (installments) {
            if (installments % 1 != 0) {
                return res.status(400).send({
                    status: false,
                    message: 'installments cannot be a decimal value'
                })
            }
        }
        if (!validate.validString(price)) {
            return res.status(400).send({
                status: false,
                message: 'price cannot be empty'
            })
        }

        if (Number(price) <= 0) {
            return res.status(400).send({
                status: false,
                message: 'Price should be a valid number'
            })
        }

        if (!validate.validString(isFreeShipping)) {
            return res.status(400).send({
                status: false,
                message: 'isFreeShipping cannot be empty'
            })
        }
        if (isFreeShipping) {
            if (!((isFreeShipping === 'true') || (isFreeShipping === 'false'))) {
                return res.status(400).send({
                    status: false,
                    message: 'isFreeShipping should be a boolean value'
                })
            }
        }

        let arr = ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']
        if (availableSizes == 0) {
            return res.status(400).send({
                status: false,
                message: 'availableSizes cannot be empty'
            })
        }
        if (availableSizes) {
            let sizeArr = availableSizes.split(',').map(x => x.trim())
            for (let i = 0; i < sizeArr.length; i++) {
                if (!(arr.includes(sizeArr[i]))) {
                    return res.status(400).send({
                        status: false,
                        message: `availableSizes should be among [${arr}]`
                    })
                }
            }
            updateBody.availableSizes = sizeArr
        }

        let updatedProduct = await productModel.findOneAndUpdate({ _id: productId },
            {
                $set:
                {
                    title: title,
                    description: description,
                    price: price,
                    currencyId: currencyId,
                    isFreeShipping: isFreeShipping,
                    style: style,
                    availableSizes: availableSizes,
                    productImage: updateBody.productImage,
                    installments: installments
                }
            }, { new: true })
        return res.status(201).send({
            status: true,
            product: updatedProduct
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            error: error.message
        })
    }
}



/**************************** GET PRODUCT BY ID ********************************/

const getProductById = async function (req, res) {
    try {
        let pid = req.params.productId
        if (!validate.isValidObjectId(pid)) {
            return res.status(400).send({
                Status: false,
                msg: "Please provide valid Product id"
            })

        }

        let product = await productModel.findById(pid)
        if (!product) {
            return res.status(404).send({
                Status: false,
                msg: "No product with this id exists"
            })
        }

        if (product.isDeleted === true) {
            return res.status(400).send({
                Status: false,
                msg: "Product is deleted"
            })
        }


        return res.status(200).send({
            Status: true,
            message: "Success",
            Data: product
        })



    } catch (err) {
        return res.status(500).send({
            Status: false,
            msg: err.message
        })
    }

}


/************************ DELETE PRODUCT BY ID **************************/

const deleteProductById = async function (req, res) {
    try {
        let pid = req.params.productId
        if (!validate.isValidObjectId(pid)) {
            return res.status(400).send({
                Status: false,
                msg: "Please provide valid Product id"
            })
        }


        let product = await productModel.findById(pid)

        if (!product) {
            return res.status(404).send({
                Status: false,
                msg: "Product not found"
            })
        }

        if (product.isDeleted === true) {
            return res.status(400).send({
                Status: false,
                msg: "Product already deleted"
            })
        }


        let deletedProduct = await productModel.findByIdAndUpdate(pid, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

        return res.status(200).send({
            Status: true,
            message: "Success",
            Data: deletedProduct
        })


    } catch (err) {
        return res.status(500).send({
            Status: false,
            msg: err.message
        })
    }

}


module.exports = { createProduct, getProduct, updateProductById, getProductById, deleteProductById }