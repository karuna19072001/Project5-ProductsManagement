const userModel = require("../models/userModel")
const aws = require("aws-sdk");
const validation = require("../validation/validation")


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
        let address = JSON.parse(req.body.address)

        const { fname, lname, email, phone, password } = data
        let profileImagessweetselfie
        if (files && files.length > 0) {
            profileImagessweetselfie = await uploadFile(files[0])
        }
        console.log(profileImagessweetselfie)
        const finalData = { title, description, price, currencyId, currencyFormat, productImage, style, availableSizes,  installments }
        console.log(finalData)
        data.profileImage = profileImagessweetselfie
        finalData.profileImage = profileImagessweetselfie
        data.address = address

        if (!isValidRequestBody(data))
        return res.status(400).send({ status: false, msg: "Please Enter some data" })

        if (!isValid(title)){
            return res.status(404).send({ status: false, msg:"Title is required" })
        }


    }catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}



module.exports.pic = pic;