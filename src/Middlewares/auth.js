// import { request } from "express";

import { verify } from "jsonwebtoken";
import { findById } from "../Models/userModel";

const checker = async function (req, res, next) {
    try {
        let token 
        if (req.headers.authorization) {
            if (req.headers.authorization.startsWith("Bearer")){
                 token = req.headers.authorization.split(" ")[1];
            }
            else token = req.headers.authorization
            // console.log(token)
            const decodedToken=verify(token,process.env.JWT_SECRET_KEY)

            req.user = await findById({_id:decodedToken}).select("-password")

            next()
        }
        else{
           return res.status(401).send({ status: false, message: "No token"})
        }
    } catch (e) {
        res.status(401).send({ status: false, message:"Authorization failed  " + e.message})
    }

}

export default { checker };