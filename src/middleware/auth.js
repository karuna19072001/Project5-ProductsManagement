const jwt=require("jsonwebtoken")

const userModel=require("../models/userModel")


const auhtentication=(req,res)=>{
    try{
        const token=req.hearders["x-api-key"]
        if(!token){
            return res.status(400).send({status:false,msg:"please enter token "})
        }
        
         let decoded=jwt.verify(token,"group10")
    
        if(!decoded){
            return res.status(400).send({status:false,mag:"token is not valid"})
        }
        next()
    }
    catch(err){
        return res.status(500).send({status:false,msg:err.message})
    }

}
module.exports.auhtentication=auhtentication