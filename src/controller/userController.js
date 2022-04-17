const userModel = require('../models/userModel')
const validate = require('../validator/validators')
const aws = require('../validator/awsS3')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
    try {
        
        if (!validate.isValidRequestBody(req.body)) {
            return res
            .status(400)
            .send({ status: false, message: 'invalid Input Parameters' })
        }
    
        let { fname, lname, email, phone, password, address } = req.body
    
        let files = req.files;
        let uploadedFileURL
        
        if (!validate.isValid(fname)) {
            return res
            .status(400)
            .send({ Status: false, Message: 'invalid First Name' })
        }
    
        if (!validate.isValid(lname)) {
            return res
            .status(400)
            .send({ Status: false, message: 'invalid last Name' })
        }
    
        if (!validate.isValid(email)) {
            return res
            .status(400)
            .send({ status: false, message: 'email is required' })
        }
    
        if (!validate.isValidEmail(email)) {
            return res
            .status(400)
            .send({ status: false, message: 'please enter a valid email' })
        }
    
        let isEmailExist = await userModel.findOne({ email })
            if(isEmailExist) {
            return res
            .status(400)
            .send({ status: false, message: `This email ${email} is Already In Use` })
        }
    
        if (!validate.isValidPhone(phone)) {
            return res
            .status(400)
            .send({ status: false, message: 'Enter A valid Mobile Nummber' })
        }
    
        let isPhoneExist = await userModel.findOne({ phone })
        if(isPhoneExist) {
            return res
            .status(400)
            .send({ status: false, message: `This Phone ${phone} No. is Already In Use`})
        }
    
        if (!validate.isValid(password)) {
            return res
            .status(400)
            .send({ status: false, message: 'password Is Required' })
        }
    
        // if(!validator.isvalidPass(password)) {
        //     return res
        //     .status(400)
        //     .send({ status: false, message: `password Should Be In Beetween 8-15 ` })
        // }
        
        let hashedPassword = await validate.hashedPassword(password)
            console.log(hashedPassword.length)
    
        if (!address) {
            return res
            .status(400)
            .send({ status: false, message: 'address is required' })
        }
    
        if (!validate.isValid(address['shipping']['street'])) {
            return res
            .status(400)
            .send({ status: false, message: 'invalid Shipping Street' })
        }
    
        if (!validate.isValid(address['shipping']['city'])) {
            return res
            .status(400)
            .send({ status: false, message: 'invalid Shipping city' })
        }
    
        if (!validate.isValidPincode(parseInt(address['shipping']['pincode']))) {
            return res
            .status(400)
            .send({ status: false, message: 'invalid Shipping Pincode' })
        }
    
        if (!validate.isValid(address['billing']['street'])) {
            return res
            .status(400)
            .send({ status: false, message: 'invalid billing Street' })
        }
    
        if (!validate.isValid(address['billing']['city'])) {
            return res.status(400).send({ status: false, message: 'invalid billing city' })
        }
    
        if (!validate.isValidPincode(parseInt(address['billing']['pincode']))) {
            return res
            .status(400)
            .send({ status: false, message: 'invalid billing Pincode' })
        }
    
    //UploadingFile..............................................................
    
        if (files && files.length > 0) {
            if(!validate.isValidImage(files[0])) {
                return res
                .status(400)
                .send({ status: false, message: `invalid image type` })
            }
            uploadedFileURL = await aws.uploadFile( files[0] );  
        } 
        else {
          return res
          .status(400)
          .send({ status: false, msg: "No file to write" });
        }
    
        let finalData = {
            fname,
            lname,
            email,
            profileImage : uploadedFileURL,
            phone,
            password: hashedPassword,
            address
        }
    
        const newUser = await userModel.create(finalData)
        return res
        .status(201)
        .send({ status: true, message: 'Success', Data:newUser })
    
    } catch (error) {
        res
        .status(500)
        .send({ status: false, message: error.message })  
    }
    }





//..............................................................................

const useLogin = async function(req, res){
try{
    let data = req.body
    if(!data){
        return res
        .status(400)
        .send({status:false, msg:"data required for login"})
    }
    let email = req.body.email
    let password = req.body.password

    if(!validate.isValid(email)){
        return res
        .status(400)
        .send({status:false, msg:"email is requires"})
    }

    if(!validate.isValidEmail(email)) {
        return res
        .status(400)
        .send({ status: false, message: 'Please Enter a Valid Email' })
    }

    let isUserExist = await userModel.findOne({email})

    if(!isUserExist){
        return res
        .status(404)
        .send({status:false, msg:" User Not Found Please Check Email"})
    }

    if(!validate.isValid(password)){
        return res
        .status(400)
        .send({status:false, msg:"password is required"})
    }

    // if(!validator.isvalidPass(password)) {
    //     return res
    //     .status(400)
    //     .send({ status: false, message: 'Please Enter A Valid Password' })
    // }


    let passwordMatch = bcrypt.compareSync(password, isUserExist.password)
    if(!passwordMatch) {
        return res
        .status(404)
        .send({ status: false, message: `user Not Found Please Check Password` })
    }


    let token = jwt.sign(
        {
            userId:isUserExist._id.toString(),
        },
        "fifth project",
        {
            expiresIn:"30m"
        }
    );
    res.setHeader("x-api-key", token)
    res
    .status(201)
    .send({status:true, message: 'user Login SuccessFull', data:{ userId:isUserExist._id, token }})

}catch(err){
    res.status(500).send({ status: false, message: err.message })
}
}


const getUserById = async function (req, res) {
    try {
        const data = req.params.userId


        if (!validate.isValid(data)) {
            return res.status(400).send({ status: false, message: "Please , provide userId in path params" })

        }

        if (!validate.isValidObjectId(data)) {
            return res.status(400).send({ status: false, msg: 'please provide a valid userId' })
        }
        const isPresent = await userModel.findById({ _id: data })

        if (!isPresent) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
        const userData = await userModel.findOne({ userId: data })

        return res.status(200).send({ status: true, message: "User profile details", data: userData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params
        if (!validate.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid ID" })
        }
        const data = req.body //JSON.parse(JSON.stringify(req.body)) 
        const files = req.files
        const { password } = data

        if (!Object.keys(data).length > 0) return res.send({ status: false, message: "Please enter data for updation" })

        const isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
        if (data._id) {
            return res.status(400).send({ status: false, message: "can not update user id" })
        }
        if (data.email) {
            // const isEmailInUse = await userModel.findOne({ email: data.email })
            if (!validate.isValidEmail) {
                return res.status(400).send({ status: false, message: "email already registered, enter different email" })
            }
        }
        if (data.phone) {
            if (!validate.isValidPhone) {
                return res.status(400).send({ status: false, message: "phone number already registered, enter different number" })
            }
        }

        if (files.length > 0) {
            if (files[0].mimetype.indexOf('image') == -1)
                return res.status(400).send({ status: false, msg: "Only image files are allowed !" })
            const link = await uploadFile(files[0])
            data.profileImage = link

            // console.log(link)
        }
        let salt = 10
        if (password) {
            const hash = await bcrypt.hash(password, salt)
            data.password = hash
        }
        const add = JSON.parse(JSON.stringify(isUserExist.address))
        // return res.send(add)
        if (data.address) {
            //data.address = JSON.parse(data.address)
            // return res.send(data)
            if (data.address.shipping) {
                if (data.address.shipping.street) {
                    if (!validate.isValid(data.address.shipping.street)) {
                        return res.status(400).send({ status: false, message: "please enter shipping street name" })
                    }
                    add.shipping.street = data.address.shipping.street
                }
                if (data.address.shipping.city) {
                    if (!validate.isValid(data.address.shipping.city)) {
                        return res.status(400).send({ status: false, message: "please enter shipping city name" })
                    }
                    add.shipping.city = data.address.shipping.city
                }
                if (data.address.shipping.pincode) {
                    if (!validate.isValid(data.address.shipping.pincode)) {
                        return res.status(400).send({ status: false, message: "please enter shipping pincode" })
                    }
                    // if (!(/^([+]\d{2})?\d{6}$/.test(address['shipping']['pincode'])))
                    // return res.status(400).send({ status: false, msg: "Please Enter  a Valid billing  pincode Number" })
                    add.shipping.pincode = data.address.shipping.pincode
                }
            }
            if (data.address.billing) {
                if (data.address.billing.street) {
                    if (!validate.isValid(data.address.billing.street)) {
                        return res.status(400).send({ status: false, message: "please enter billing street name" })
                    }
                    add.billing.street = data.address.billing.street
                }
                if (data.address.billing.city) {
                    if (!validate.isValid(data.address.billing.city)) {
                        return res.status(400).send({ status: false, message: "please enter billing city name" })
                    }
                    add.billing.city = data.address.billing.city
                }
                if (data.address.billing.pincode) {
                    if (!validate.isValid(data.address.billing.pincode)) {
                        return res.status(400).send({ status: false, message: "please enter billing pincode" })
                    }
                    add.billing.pincode = data.address.billing.pincode
                }
            }

            data.address = add
        }
        // return res.send(data.address)
        const updateUser = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
        return res.status(200).send({ status: true, msg:  `updated successfully !`, data: updateUser })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


    






module.exports.register = register
module.exports.updateProfile = updateProfile
module.exports.getUserById = getUserById;
module.exports.useLogin = useLogin ;