const userModel = require("../models/userModel")
const aws = require("aws-sdk");


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
            res.status(201).send({ msg: "file uploaded succesfully", data: uploadedFileURL })
        }
        else {
            res.status(400).send({ msg: "No file found" })
        }
    }
    catch (err) {
        res.status(500).send({ msg: err })
    }
}




const createUSer = async function (req, res) {
    try {
        let data = req.body

       // const { fname, lname, email, phone,profileImage, password, address, billing } = data

        const output = await userModel.create( data)
//console.log(output)
        const finalData = { fname, lname, email, profileImage, phone, password, address, billing }
console.log(finalData)
        return res.status(201).send({ msg: "Data uploaded succesfully", data: finalData })

    }
    catch (err) {
        return res.status(500).send({ msg: err })
    }
}

module.exports.createUSer = createUSer;
module.exports.pic=pic