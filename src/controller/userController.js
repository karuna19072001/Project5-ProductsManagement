const userModel = require("../models/userModel")
const aws = require("aws-sdk");
//const validator = require("../validator/validator")
const bcrypt = require('bcrypt')
//const validator = require("validator")

const validator = require("../Validator/validator");
const jwt = require("jsonwebtoken")
//const aws = require('../Validator/aws')


//const jwt = require("jsonwebtoken")




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


// const salt = async bcrypt.genSalt(10);
// password = await bcrypt.hash(password, salt)


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

const createUser = async function (req, res) {
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
        const finalData = { fname, lname, email, phone, password, address }
        console.log(finalData)
        data.profileImage = profileImagessweetselfie
        finalData.profileImage = profileImagessweetselfie
        data.address = address
        // const output = await userModel.create(data,address)

        /*********************************************************************************8 */
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
     if (isValid(data.password))
{
     res.status(400).send({ status: false, msg: "please provide the password" });
  }
if (!/^(?=.[0-9])(?=.[A-Z])(?=.[a-z])(?=.[!@#$%^&])[a-zA-Z0-9!@#$%^&]{8,16}$/.test(password)) {
   res.status(400).send({status: false,msg: "Please enter Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character",});
}
   let saltRounds = 10;
   const salt = await bcrypt.genSalt(saltRounds)
   console.log(salt)
   let hash = await bcrypt.hash(req.body.password,salt)
   console.log(hash)
    if (!isValid(data.profileImage)) {
        return res.status(400).send({ status: false, msg: "ProfileImage is Required" })
    }
    if (!isValid(data.address.shipping.street)) {
        return res.status(400).send({ status: false, msg: "street is Required" })
    }
    if (!isValid(data.address.shipping.city)) {
        return res.status(400).send({ status: false, msg: "city is Required" })
    }
    // if (!isValid(data.address.shipping.pincode)) {
    //     return res.status(400).send({ status: false, msg: "pincode is Required" })
    // }
    // if (isValid(data.address.shipping.pincode))

    //     if (!(/^([+]\d{2})?\d{6}$/.test(data.address.shipping.pincode)))
    //         return res.status(400).send({ status: false, msg: "Please Enter  a Valid pincode Number" })

    if (!isValid(data.address.billing.street)) {
        return res.status(400).send({ status: false, msg: "billing street is Required" })
    }
    if (!isValid(data.address.billing.city)) {
        return res.status(400).send({ status: false, msg: "billing city is Required" })
    }
    // if (!isValid(data.address.billing.pincode)) {
    //     return res.status(400).send({ status: false, msg: " billing pincode is Required" })
    // }
    // if (!(/^([+]\d{2})?\d{6}$/.test(data.address.billing.pincode)))
    //     return res.status(400).send({ status: false, msg: "Please Enter  a Valid billing  pincode Number" })


        /************************************************************************************************* */

        // const finalData = { fname, lname, email, phone, password, address }
        // console.log(finalData)
        // data.profileImage = profileImagessweetselfie
        // finalData.profileImage = profileImagessweetselfie
        // data.address = address
        //console.log(profileImage)
        const output = await userModel.create(data)
        return res.status(201).send({ msg: "Data uploaded succesfully", data: output })

    }//address[shipping][street]

    catch (err) {
        console.log(err)
        return res.status(500).send({ msg: err.message })
    }
}


// const createUser = async (req, res) => {
//     try {
//       let files = req.files
//       let requestBody = req.body
  
//       if (!validator.isValidRequestBody(requestBody))
//         return res.status(400).send({status: true, msg: "Invalid request parameters ,please provide the user details",
//           });
  
//      let  { fname, lname, email, phone, password,address ,profileImage} = requestBody;
  
//       if (!validator.isValid(fname && lname))
//        return res.status(400).send({ status: false, msg: "please provide the valid name" });
  
//       if (!validator.isValid(email))
//         return res.status(400).send({ status: false, msg: "email is not present in input request" });
        
//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
//         return res.status(400).send({ status: false, msg: "please provide a valid email address" });
      
      
//         let isEmailUsed = await userModel.findOne({ email });
  
//        if (isEmailUsed)
//         return res.status(400).send({ status: false, msg: `${email} is already exists` });
  
      
//          // if(!aws(profileImage))
//          // return res.status1(400).json({status:false,msg: `please requried aws link`})    
//          profileImage = await 
//          uploadFile(files[0])
//          console.log(profileImage)
//          // profileImage = await config.uploadFile(req.files[0]);
  
//       if (!validator.isValid(phone))
//         return res.status(400).send({ status: false, msg: "please provide the  phone number" });
  
//       if (!/^[1-9]{1}\d{9}$/.test(phone))
//         return res.status(400).send({ status: true, msg: "please enter 10 digit number which does not contain 0 at starting position",
//           });
          
//       let isPhoneUsed = await userModel.findOne({ phone });
  
//       if (isPhoneUsed)
//         return res.status(400).send({ status: false, msg: `${phone} is already exists` });
  
//       //The Phone Numbers will be of 10 digits, and it will start from 6,7,8 and 9 and remaing 9 digits
  
//       if (!validator.isValid(password))
//         return res.status(400).send({ status: false, msg: "please provide the password" });
  
//         if (
//           !/^(?=.[0-9])(?=.[A-Z])(?=.[a-z])(?=.[!@#$%^&])[a-zA-Z0-9!@#$%^&]{8,16}$/.test(
//             password
//           )
//         ) {
//           return res.status(400).send({
//             status: false,
//             msg: "Please enter Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character",
//           });
//         }
//            let saltRounds = 10;
//            const salt = await bcrypt.genSalt(saltRounds)
//            console.log(salt)
//            let hash = await bcrypt.hash(req.body.password,salt)
//            console.log(hash)
  
//     // let hasedPassword = await bcrypt.hash(password, saltRounds);
  
//   if (!validator.isValid(address))
//   return res.status(400).send({ status: false, msg: "address is required" });
  
//   if (!validator.isValidRequestBody(req.body.address.shipping))
//   return res.status(400).send({ status: false, msg: "please provide shipping details" });
  
//   if (address.shipping) {
//   if (!validator.isValid(address.shipping.street))
//     return res.status(400).send({ status: false, msg: "please provide street details" });
  
//   if (!validator.isValid(address.shipping.city))
//     return res.status(400).send({ status: false, msg: "please provide street details" });
  
//   if (!validator.isValid(address.shipping.pincode))
//     return res.status(400).send({ status: false, msg: "please provide street details" });
//   }
  
//   if (!validator.isValidRequestBody(req.body.address.billing))
//   return res.status(400).send({ status: false, msg: "please provide billing details" });
  
//   if (address.billing) {
//   if (!validator.isValid(address.billing.street))
//     return res.status(400).send({ status: false, msg: "please provide street details" });
  
//   if (!validator.isValid(address.billing.city))
//     return res.status(400).send({ status: false, msg: "please provide street details" });
  
//   if (!validator.isValid(address.billing.pincode))
//     return res.status(400).send({ status: false, msg: "please provide street details" });
//   }
  
       
//       //    profileImage = await aws.uploadFile(files[0])
//       //     console.log(profileImage,"gshjghjg")
//           const updatedBody = { fname, lname, email,phone, password:hash, address ,profileImage}
//           let user = await userModel.create(updatedBody)
//           res.status(201).send({ status: true, message: 'User created successfully', data: user })
  
          
//       // userData = { fname, lname, email, phone, address,password :hash};
//       // const newUser = await userModel.create(userData);
//       // res.status(201).json({ status: true,msg: "New user registered successfully",data: newUser,
//       //   });
//     } catch (err) {
//       res.status(500).send({ status: false, msg: err.message });
//     }
//   }



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

            group: "28",
            iat: Math.floor(Date.now() / 1000),         //doubt clear about this after some time   //payload
            exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60    //1 hourds:minute:second

        }, "group28")//secret key
        //const userId: input._id.toString(),
        res.setHeader("x-api-key", token) // look ion the postman body header


        return res.status(200).send({ status: true, msg: "user loing successfully", data: token })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}



const getProfile = async function (req, res) {
    try {
        const data = req.params.userId

       //const {fname, lname, email, phone, password, profileImage, address} = data

        let token = req.headers["x-api-key"];
        let decodedToken = jwt.verify(token, "group28");
      let userId  = decodedToken.userId
       if(userId != data ){
           return res.status(400).send({status:false , msg:"You are not allowed to modify requested user's data"})
       }

        const getProfiileData = await userModel.findOne({ data: data })

        console.log(getProfiileData)

        return res.status(200).send({ status: true, message: "User profile details", data:getProfiileData})
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ msg: false, msg: err.message })
    }
}




const getProductById = async (req, res) => {
  //try {
    const productId = req.params.productId;
    if (!validator.isValid(req.params)) {
      return res
        .status(400)
        .send({ status: false, message: "productId required" });
    }

    if (!validator.isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid ObjectId" });
    }

    const productData = await productModel.findOne({ _id: productId, isDeleted: false });

    if (!validator.isValid(productData)) {
      return res.status(404).send({
        status: false,
        message: `Product is not found with this ID: ${productId}`,
      });
    }
  
    if(productId){
      return res
      .status(200)
      .send({ status: true, msg:" Great ProductData found " });

    }
    //catch (err) {
    //   return res.status(500).send({ status: false, msg: err.message });
    // }
  }








const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
/******************************************************************************************** */

let token = req.headers["x-api-key"];
let decodedToken = jwt.verify(token, "group10");
let userId1  = decodedToken.userId
if(userId1 != userId){
   return res.status(400).send({status:false , msg:"You are not allowed to modify requested user's data"})
}
/***************************************************** */
        const { fname, lname, email, phone, profileImage, password, address, billing } = data
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

        let UpdateUser = await userModel.findByIdAndUpdate({ _id: userId }, data, { new: true })
        res.status(200).send({ status: true, data: UpdateUser })


    }
    catch (err) {
        return res.status(500).send({ msg: err })
    }
}
  






module.exports.createUser = createUser
module.exports.updateUser = updateUser
module.exports.pic = pic
module.exports.logIn = logIn
module.exports.getProfile = getProfile
module.exports.getProductById = getProductById