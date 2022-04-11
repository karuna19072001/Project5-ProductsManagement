const jwt=require("jsonwebtoken")

const userModel=require("../models/userModel")


const auhtentication=(req,res,next)=>{
    try{
        const token=req.headers["x-api-key"]
        if(!token){
            return res.status(400).send({status:false,msg:"please enter token "})
        }
        
         let decoded=jwt.verify(token,"group10")
    
        if(!decoded){
            return res.status(403).send({status:false,mag:"token is not valid"})
        }
        next()
    }
    catch(err){
        return res.status(500).send({status:false,msg:err.message})
    }

}



// const authorization = async function (req, res, next) {
//     try {
//       let token = req.headers["x-api-key"];
//       let decodedToken = jwt.verify(token, "group10");
//       let userLoggingIn = req.params.userId
//       let userLoggedIn = decodedToken.userId
//      // userLoggingIn = decodedToken.userId
//      let value =await userModel.findOne({_id: userLoggingIn })
//     // if(!value){return res.status(404).send({status:false, message: "user not recognized/not found"})}
//       if (value!=userLoggingIn  ) return res.status(403).send({ status: false, msg: "You are not allowed to modify requested user's data" })
//     }//value.authorId
//     catch (err) {
//       console.log(err)
//      return res.status(500).send({ msg: err.message })
//     }
//     next()
  
//   }


module.exports.auhtentication=auhtentication

//module.exports.authorization=authorization