const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");


const authentication = async (req, res, next) => {
    try {
        let token = req.headers["x-api-key"];
        if (!token){
            return res.status(401).send({ status: false, message: "token is required" })
        }
        let decodedToken = jwt.verify(token, 'projectfiveshoppingkart')
        if (!decodedToken) return res.status(401).send({ status: false, message: 'token is not valid' })
        // console.log(decodedToken.exp)
        // console.log("now", Math.floor(Date.now() / 1000))
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
    next()
}

const authorisation = async (req, res, next) => {
    try {
        let token = req.headers["x-api-key"];
        let decodedToken = jwt.verify(token, "projectfiveshoppingkart");
        let userLoggingIn = req.params.userId
        let userLoggedIn = decodedToken._id
        let value = await UserModel.findById(userLoggingIn)
        if (!value) return res.status(404).send({status:false, message: "user not found"})
        if (value.userId != userLoggedIn) return res.status(403).send({ status: false, message: "You are not allowed to modify requested  data" })
    }
    catch (error) {
        return res.status(500).send({status: false, message: error.message })
    }
    next()
}


module.exports.authentication = authentication
module.exports.authorisation = authorisation