const userModel = require('../models/userModel')
const validator = require('../validator/validators')
const aws = require('../validator/awsS3')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")


/********************** USER REGISTER ******************/

const register = async (req, res) => {
  try {

    if (!validator.isValidRequestBody(req.body)) {
      return res.status(400).send({
        status: false,
        message: 'invalid Input Parameters'
      })
    }

    let {
      fname,
      lname,
      email,
      phone,
      password,
      address
    } = req.body

    let files = req.files;
    let uploadedFileURL



    if (!validator.isValid(fname)) {

      return res
        .status(400)
        .send({
          Status: false,
          Message: 'invalid First Name'
        })
    }

    if (!validator.isValidCharacters(fname.trim())) {
      return res.status(400).send({
        Status: false,
        msg: "This attribute can only have letters as input"
      })
    }



    if (!validator.isValid(lname.trim())) {
      return res.status(400).send({
        Status: false,
        message: 'invalid last Name'
      })
    }

    if (!validator.isValidCharacters(lname)) {
      return res.status(400).send({
        Status: false,
        msg: "This attribute can only have letters as input"
      })
    }



    if (!validator.isValid(email)) {
      return res.status(400).send({
        status: false,
        message: 'email is required'
      })
    }

    if (!validator.isValidEmail(email)) {
      return res.status(400).send({
        status: false,
        message: 'please enter a valid email'
      })
    }

    let isEmailExist = await userModel.findOne({
      email
    })
    if (isEmailExist) {
      return res.status(400).send({
        status: false,
        message: `This email ${email} is Already In Use`
      })
    }

    if (!validator.isValid(phone)) {
      return res.status(400).send({
        Status: false,
        msg: "Please provide phone number"
      })
    }
    if (!validator.isValidPhone(phone)) {
      return res.status(400).send({
        status: false,
        message: 'Enter A valid phone Nummber'
      })
    }

    let isPhoneExist = await userModel.findOne({
      phone
    })
    if (isPhoneExist) {
      return res.status(400).send({
        status: false,
        message: `This Phone ${phone} No. is Already In Use`
      })
    }

    if (!validator.isValid(password)) {
      return res.status(400).send({
        status: false,
        message: 'password Is Required'
      })
    }

    if (!validator.isvalidPass(password.trim())) {
      return res.status(400).send({
        status: false,
        message: `password Should Be In Beetween 8-15 `
      })
    }

    let hashedPassword = await validator.hashedPassword(password.trim())
    console.log(hashedPassword.length)

    if (!address) {
      return res.status(400).send({
        status: false,
        message: 'address is required'
      })
    }

    if (!validator.isValid(address['shipping']['street'])) {
      return res.status(400).send({
        status: false,
        message: 'Shipping Street is required'
      })
    }

    if (!validator.isValid(address['shipping']['city'])) {
      return res.status(400).send({
        status: false,
        message: 'Shipping city is required'
      })
    }



    if (!validator.isValid(address['shipping']['pincode'])) {
      return res.status(400).send({
        status: false,
        message: 'Shipping Pincode is required'
      })
    }
    if (!validator.isValidPincode(parseInt(address['shipping']['pincode']))) {
      return res.status(400).send({
        status: false,
        message: 'Invalid pincode'
      })
    }

    if (!validator.isValid(address['billing']['street'])) {
      return res.status(400).send({
        status: false,
        message: 'Billing Street is required'
      })
    }

    if (!validator.isValid(address['billing']['city'])) {
      return res.status(400).send({
        status: false,
        message: 'Billing city is required'
      })
    }

    if (!validator.isValid(address['billing']['pincode'])) {
      return res.status(400).send({
        status: false,
        message: 'Billing Pincode is required'
      })
    }
    if (!validator.isValidPincode(parseInt(address['billing']['pincode']))) {
      return res.status(400).send({
        status: false,
        message: 'Invalid pincode'
      })
    }

    //UploadingFile..............................................................

    if (validator.isValidFiles(files)) {
      if (!validator.isValidImage(files[0])) {
        return res.status(400).send({
          status: false,
          msg: `invalid image type`
        })
      }
      uploadedFileURL = await aws.uploadFile(files[0]);
    } else {
      return res.status(400).send({
        status: false,
        msg: "Please provide a profile image"
      });
    }

    let finalData = {
      fname: fname,
      lname,
      email,
      profileImage: uploadedFileURL,
      phone,
      password: hashedPassword,
      address
    }

    const newUser = await userModel.create(finalData)
    return res.status(201).send({
      status: true,
      message: 'Success',
      Data: newUser
    })

  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}


/******************* USER LOGIN ************************/

const userLogin = async function (req, res) {
  try {

    if (!validator.isValidRequestBody(req.body)) {
      return res.status(400).send({
        status: false,
        msg: "data required for login"
      })
    }
    let email = req.body.email
    let password = req.body.password.trim()

    if (!validator.isValid(email)) {
      return res.status(400).send({
        status: false,
        msg: "email is required"
      })

    }

    if (!validator.isValidEmail(email)) {
      return res.status(400).send({
        Status: false,
        msg: "please provide valid email id"
      })
    }


    if (!validator.isValid(password)) {
      return res.status(400).send({
        status: false,
        msg: "password is required"
      })
    }

    let user = await userModel.findOne({
      email
    })

    if (!user) {
      return res.status(404).send({
        status: false,
        msg: "email not found"
      })
    }


    let match = await bcrypt.compare(password, user.password)

    if (match) { //after decrypting

      let token = jwt.sign({
        userId: user._id.toString(),
      },
        "fifth project", {
        expiresIn: "3 hrs"
      }
      );
      // res.setHeader("Authorization", "Bearer"+" "+token)
      res.status(200).send({
        status: true,
        data: {
          userId: user._id,
          token: token
        }
      })

    } else {
      return res.status(400).send({
        Status: false,
        msg: "Incorrect Password"
      })
    }
  } catch (err) {
    return res.status(500).send({
      Status: false,
      msg: err.message
    })

  }
}



/********************** GET USER BY ID *********************/

const getUserById = async function (req, res) {
  try {
    const userParams = req.params.userId.trim()

    //validating userId.

    if (!validator.isValidObjectId(userParams)) {
      return res.status(400).send({
        status: false,
        message: "Inavlid userId.Please enter a correct objectId"
      })
    }

    //finding user in db

    const findUser = await userModel.findOne({
      _id: userParams
    })
    if (!findUser) {
      return res.status(404).send({
        status: false,
        message: `User ${userParams} does not exist.`
      })
    }


    if ((userParams == req.userId)) { //Authorization
      return res.status(200).send({
        status: true,
        msg: "granted",
        data: findUser
      })


    } else {
      return res.status(403).send({
        Status: false,
        msg: "User not authorized to access requested id"
      })
    }

  } catch (err) {
    return res.status(500).send({
      status: false,
      msg: err.message
    })
  }
}



/********************* UPDATE USER **********************/

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params
    if (!validator.isValidObjectId(userId)) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid user ID"
      })
    }
    const data = req.body //JSON.parse(JSON.stringify(req.body)) 
    const files = req.files
    const { password } = data

    if (!Object.keys(data).length > 0)
      return res.send({
        status: false,
        message: "Please enter data for updation"
      })

    const isUserExist = await userModel.findById(userId)
    if (!isUserExist) {
      return res.status(404).send({
        status: false,
        message: "user not found"
      })
    }

    if (data._id) {
      return res.status(400).send({
        status: false,
        message: "can not update user id"
      })
    }
    if (data.email) {
      // const isEmailInUse = await userModel.findOne({ email: data.email })
      if (!validate.isValidEmail) {
        return res.status(400).send({
          status: false,
          message: "email already registered, enter different email"
        })
      }
    }
    if (data.phone) {
      if (!validate.isValidPhone) {
        return res.status(400).send({
          status: false,
          message: "phone number already registered, enter different number"
        })
      }
    }

    if (files.length > 0) {
      if (files[0].mimetype.indexOf('image') == -1)
        return res.status(400).send({
          status: false,
          msg: "Only image files are allowed !"
        })

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
          if (!validator.isValid(data.address.shipping.street)) {
            return res.status(400).send({
              status: false,
              message: "please enter shipping street name"
            })
          }
          add.shipping.street = data.address.shipping.street
        }

        if (data.address.shipping.city) {
          if (!validator.isValid(data.address.shipping.city)) {
            return res.status(400).send({
              status: false,
              message: "please enter shipping city name"
            })
          }
          add.shipping.city = data.address.shipping.city
        }
        if (data.address.shipping.pincode) {
          if (!validator.isValid(data.address.shipping.pincode)) {
            return res.status(400).send({
              status: false,
              message: "please enter shipping pincode"
            })
          }
          if (!(/^([+]\d{2})?\d{6}$/.test(address['shipping']['pincode'])))
            return res.status(400).send({
              status: false,
              msg: "Please Enter  a Valid billing  pincode Number"
            })
          add.shipping.pincode = data.address.shipping.pincode
        }
      }
      if (data.address.billing) {
        if (data.address.billing.street) {
          if (!validator.isValid(data.address.billing.street)) {
            return res.status(400).send({
              status: false,
              message: "please enter billing street name"
            })
          }
          add.billing.street = data.address.billing.street
        }
        if (data.address.billing.city) {
          if (!validator.isValid(data.address.billing.city)) {
            return res.status(400).send({
              status: false,
              message: "please enter billing city name"
            })
          }
          add.billing.city = data.address.billing.city
        }
        if (data.address.billing.pincode) {
          if (!validator.isValid(data.address.billing.pincode)) {
            return res.status(400).send({
              status: false,
              message: "please enter billing pincode"
            })
          }
          add.billing.pincode = data.address.billing.pincode
        }
      }

      data.address = add
    }
    // return res.send(data.address)
    const updateUser = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
    return res.status(200).send({
      status: true,
      msg: `updated successfully !`,
      data: updateUser
    })
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

module.exports = { register, userLogin, getUserById, updateProfile }