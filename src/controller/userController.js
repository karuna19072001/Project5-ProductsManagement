const userModel = require("../models/userModel")
const aws = require("aws-sdk");
const validation=require("../validation/validation")


const jwt = require("jsonwebtoken")




/**********************************************************************************************88 */



const isValid = function (value) {
    if (typeof value == undefined || value == null ) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if(typeof value === 'number' && value.toString().trim.length === 0) return false
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

const createUSer = async function(req,res){
    try{
        let data = req.body
        const { fname, lname, phone, email, password,profileImage, address,billing } = data 

        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, msg: "Please Enter some data" })

        if (!isValid(data.fname)) {
            return res.status(400).send({ status: false, msg: "fname is Required" })

        }
        if (!isValid(data.lname)) {
            return res.status(400).send({ status: false, msg: "lname is Required" }) 
    }
    if (!isValid(data.phone)) {
        return res.status(400).send({ status: false, msg: "phone is Required" })
}
const alreadyExsit = await userModel.findOne({ phone: data.phone })
        if (alreadyExsit) {
            return res.status(400).send({ status: false, msg: "phone already exit" })
        }
        if (isValid(data.phone))

            if (!(/^([+]\d{2})?\d{10}$/.test(data.phone)))
                return res.status(400).send({ status: false, msg: "Please Enter  a Valid Phone Number" })

        if (!isValid(data.email)) {
            return res.status(400).send({ status: false, msg: "email is Required" })
        }
        if (isValid(data.email))
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(data.email)))
                return res.status(400).send({ status: false, msg: "is not a valid email" })

                let alreadyExistEmail = await userModel.findOne({ email: data.email })
                if (alreadyExistEmail) {
          return res.status(400).send({ status: false, msg: "email already exit" })
                }

if (!isValid(data.password)) {
            return res.status(400).send({ status: false, msg: "Password is Required" })
        }
        if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(data.password))) {
            return res.status(400).send({ status: false, msg: "please provide valid password" })
        }
        if(!isValid(data.password)) {
            return res.status(400).send({ status: false, msg: "Password is Required" })
        }
        if(!isValid(data.profileImage)) {
            return res.status(400).send({ status: false, msg: "ProfileImage is Required" })
        }
        if(!isValid(data.address.shipping.street)) {
            return res.status(400).send({ status: false, msg: "street is Required" })
        }
        if(!isValid(data.address.shipping.city)) {
            return res.status(400).send({ status: false, msg: "city is Required" })
        }
        if(!(data.address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "pincode is Required" })
        }
        if (isValid(data.address.shipping.pincode))

        if (!(/^([+]\d{2})?\d{6}$/.test(data.address.pincode)))
            return res.status(400).send({ status: false, msg: "Please Enter  a Valid pincode Number" })

if(!isValid(data.billing.street)) {
            return res.status(400).send({ status: false, msg: "billing street is Required" })
        }
        if(!isValid(data.billing.city)) {
            return res.status(400).send({ status: false, msg: "billing city is Required" })
        }
        if(!(data.billing.pincode)) {
            return res.status(400).send({ status: false, msg: " billing pincode is Required" })
        }
        if (!(/^([+]\d{2})?\d{6}$/.test(data.billing.pincode)))
        return res.status(400).send({ status: false, msg: "Please Enter  a Valid billing  pincode Number" })
        
        let savedData = await userModel.create(data)
        res.status(201).send({ msg: savedData })

    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


// const createUSer = async function (req, res) {
//     try {
//         let data = req.body

//         const { fname, lname, email, phone,profileImage, password, address, billing } = data

//         const output = await userModel.create( data)
// //console.log(output)
//         const finalData = { fname, lname, email, profileImage, phone, password, address, billing }
// console.log(finalData)
//         return res.status(201).send({ msg: "Data uploaded succesfully", data: finalData })

//     }
//     catch (err) {
//         return res.status(500).send({ msg: err })
//     }
// }


const getProfie = async function(req,res){
  try{
        const data = req.params.userId
    
    
    
    const getProfiileData= await userModel.findOne({_id:data})
    
    console.log(getProfiileData)
    
    return res.send(getProfiileData)
}
    catch (err){
        return res.status(500).send({staus:false, message:err.message})
    }}
   








const updateUser = async function (req, res){
    try{
  let userId = req.params.userId
  
  let data = req.body



  if(!(userId)){
      return res.status(400).send({status:false, msg:"plz provide userId in params"})
  }
  const alreadyExsit = await userModel.findOne({ phone: data.phone })
  if (alreadyExsit) {
      return res.status(400).send({ status: false, msg: "phone already exit" })
  }
  if (isValid(data.phone))

      if (!(/^([+]\d{2})?\d{10}$/.test(data.phone)))
          return res.status(400).send({ status: false, msg: "Please Enter  a Valid Phone Number" })

      if (isValid(data.email))
      if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(data.email)))
          return res.status(400).send({ status: false, msg: "is not a valid email" })

          let alreadyExistEmail = await userModel.findOne({ email: data.email })
          if (alreadyExistEmail) {
    return res.status(400).send({ status: false, msg: "email already exit" })
          }
  
//   let userID = await userModel.findById({userId:userId})
//   if(!userID)
const { fname, lname, email, phone,profileImage, password, address, billing } = data

let updateUser = await userModel.findByIdAndUpdate({ _id: userId}, data, { new: true })
if(!updateUser){
    return res.status(400).send({status:false, msg:"User id not found/invalid user Id"})
}
res.status(200).send({ status: true, data: updateUser })

    }
    catch (err) {
        return res.status(500).send({ msg: err })
    }
}




const logIn = async (req, res) => {
    try {
        let body = req.body
        if (!validation.isrequestBody(body))
            return res.status(400).send({ status: false, msg: "invalid request parameter, please provide login details" })

        const { email, password } = body

        if (!validation.isValid(email))
            return res.status(400).send({ status: false, msg: "please enter email" })

        if (!validation.isValid(password))
            return res.status(400).send({ status: false, msg: "please enter password" })

        var input = await userModel.findOne({ email, password })

        if (!input)
            return res.status(404).send({ status: false, msg: "user not found please enter valid credentials" })

        var token = jwt.sign({

            userId: input._id.toString(),
            
            group: "10",
            iat: Math.floor(Date.now() / 1000),         //doubt clear about this after some time   //payload
            exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60    //1 hourds:minute:second

        }, "group10")//secret key
        //const userId: input._id.toString(),
        res.setHeader("x-api-key", token) // look ion the postman body header
        
        
        return res.status(200).send({ status: true,msg: "user loing successfully", data: token })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}







module.exports.logIn = logIn

module.exports.createUSer = createUSer;

module.exports.pic=pic
module.exports.getProfie = getProfie
module.exports.updateUser=updateUser
