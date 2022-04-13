const bcrypt = require("bcryptjs/dist/bcrypt")

const isValid = (value) => {
    if (typeof value != 'string'){return false}
       
    if (typeof value === 'undefined' || typeof value === null){return false}
        
    if (typeof value === 'string' && value.trim().length == 0){return false}
       
    return true
}

const isValidRequestBody = (body) => {
    if (Object.keys(body).length == 0)
        return false
    else
        return true
}

const isValidEmail = (email) => {
    return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email);
}

const isValidPincode = (pincode) => {
    return /^[1-9][0-9]{5}$/.test(pincode);
}

const isValidPhone = (phone) => {
    return /^([+]\d{2})?\d{10}$/.test(phone)
}

const hashedPassword = async (password) => {
   let p1 =  await bcrypt.hash(password, 10)
   return p1
}

const isValidImage = (image) => {
    if ( /.*\.(jpeg|jpg|png)$/.test(image.originalname) ) {
        return true
    }
    return false
}

const isvalidPass = (password) => {
    return /^(?=.\d)(?=.[a-z])(?=.*[A-Z]).{8,15}$/.test(password)
    //this regex we can use for validating password
    //6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter  
}

const isValidNumber = (value) => {
    return (!isNaN(value) && value > 0)
}


const isValidBoolean = (value) => {
    return ( value === "true" || value === "false" )
}

const isValidFiles = (requestFiles) => {
    return requestFiles.length > 0 
}

const isValidSize = (Arr) => {
    let newArr = []
    if(!Arr.length > 0)
    return false

    for(let i =  0 ; i< Arr.length ; i++) {
        if(!["S", "XS","M","X", "L","XXL", "XL"].includes(Arr[i].toUpperCase())) {
        return false
    }
    newArr.push(Arr[i].toUpperCase())
    }
return newArr
}

module.exports = {
    isValid,
    isValidEmail,
    isValidPincode,
    isValidRequestBody,
    isValidPhone,
    hashedPassword,
    isvalidPass,
    isValidImage,
    isValidNumber,
    isValidBoolean,
    isValidFiles,
    isValidSize
}