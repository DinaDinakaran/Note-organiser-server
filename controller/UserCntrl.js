import UserModel from "../schma/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import randomstring from "randomstring"
import dotenv from "dotenv"
dotenv.config();
//nodemailer

const key = process.env.EMAIL_SECRET_KEY;
const mail = process.env.EMAIL_OWNER
let random_key = randomstring.generate();

let forgetmailer = async(name,email,token)=>{
    //console.log(key,mail)
        try {
           let transport = nodemailer.createTransport({
               host:'smtp.gmail.com',
               port:587,
               secure:false,
               requireTLS:true,
               auth:{
                   user:mail,
                   pass:key
               }
           })
       
           let message={
               from:process.env.EMAIL_OWNER,
               to:email,
               subject:"Reset Password",
               text:"please click the link for reset your password",
               html:
               `<p> Hi ${name} !
                  please click  <a href ="http://localhost:3000/rest-password/${token}"  target="_blank"   >here</a> to rest your password
               `
           }
       
           transport.sendMail(message).then((data)=>{
               console.log('Mail is Send you in box')
           }).catch((err)=>{
               console.log(err,"error on node mailer");
               console.log('somthing went worng');
           })
        } catch (error) {
           console.log(error,"error on node mailer")
        }
        }

export const UsersignUp =async(req,res)=>{
     let payload = req.body;
     try {
        let already_user = await UserModel.findOne({email:payload.email})
        if(already_user){
           res.json({message:"User Already Exist",isOk:0})
        }else{
                let hashedpassword = await bcrypt.hash(payload.password,10);
                payload.hashedpassword=hashedpassword;

                let user = new UserModel(payload);
                user.save()
                res.status(201).json({message:"User is Created Successfully",isOk:1})
            
        }
         
     } catch (error) {
        console.log(error);
        res.json({message:"Somthing went worng ! please try  again",isOk:0})
     }
}
export const UsersignIn =async(req,res)=>{
        let payload = req.body;
    try {
        let already_user = await UserModel.findOne({email:payload.email})
        if(!already_user){
                res.json({message:"User not Exist",isOk:0});
        }else{
              await UserModel.findOne({email:payload.email}).then(async(user_data)=>{
                        let valid_user = await bcrypt.compare(payload.password,user_data.hashedpassword);
                        if(valid_user){
                                let user= {name:valid_user.name,email:valid_user.email};
                                let token = jwt.sign(user,process.env.SECRET_KEY,{expiresIn:"90m"});
                                res.cookie("t",token);
                                const {name,email,role,data,_id} = user_data
                                res.status(200).json({details:{name,email,role,data,id:_id},token,isOk:1});
                        }else{
                            res.json({message:"Password is worng !",isOk:0});
                        }
                })
        }
    } catch (error) {
        console.log(error);
        res.json({message:"Somthing went worng ! please try  again",isOk:0})
    }
}

export const Userforget =async(req,res)=>{
        let payload = req.body;
        try {
            let valid_user = await UserModel.findOne({email:payload.email})
            if(!valid_user){
                return res.json({message:"User is Not Exist",isOk:0})
            }
            let token = jwt.sign({name:valid_user.name,email:valid_user.email,id:valid_user._id},process.env.REST_PASSWORD_KEY,{expiresIn:"10m"});
            console.log("token",token)
            valid_user.token=token;
             await UserModel.findOneAndUpdate({email:valid_user.email},{$set:valid_user}).then((data)=>{
                forgetmailer(valid_user.name,valid_user.email,token);
                res.json({message:"Email has been Sent successfully !",isOk:1})
             }).catch((err)=>{
                console.log(err)
                return res.json({message:"Somthing is Went Worng Please Try Again",isOk:0});
             })
        } catch (error) {
            console.log(error)
            return res.json({message:"Somthing is Went Worng Please Try Again",isOk:1});
        }
}
export const UserPasswordRest =async(req,res)=>{
    let {token}= req.params
      let payload=req.body;
     // console.log(token,payload,"hello")
      try {
        let valid_user = await UserModel.findOne({token:token});
        if(!valid_user){
            return res.json({message:"User Not exist",isOk:0})
        }

         const decoded = jwt.verify(token,process.env.REST_PASSWORD_KEY);
         //console.log(decoded,"decode");
         const expirationTime = decoded.exp * 1000; // Convert to milliseconds
       
         const currentTime = new Date().getTime();
         if (currentTime > expirationTime) {
           console.log('Token has expired.');
           return res.json({message:"Link Expired",isOk:0})
         } else {
          //  console.log(payload.password);
            let hashedpassword = await bcrypt.hash(payload.password,10);
          valid_user.hashedpassword=hashedpassword;
          valid_user.token=''
         // console.log("valid user",valid_user)
          await UserModel.findOneAndUpdate({email:decoded.email},{$set:valid_user}).then(()=>{
            res.status(201).json({message:"Password Upadated successfully",isOk:1})
          }).catch((err)=>{
            console.log(err);
            return res.json({message:"Something went worng",isOk:0})
          })
         }
      
      } catch (error) {
        console.log(error)
        return res.json({message:"Somthing is Went Worng Please Try Again",isOk:0})
      }
}


export const AddNotes  = async(req,res)=>{
    let payload = req.body;
    try {
        let valid_user = await UserModel.findOne({email:payload.email});
        if(!valid_user){
           return res.json({message:"User not exist !",isOk:0})
        }
        valid_user.notes.push(payload.data);
       await UserModel.findOneAndUpdate({email:payload.email},{$set:valid_user}).then(()=>{
           res.status(201).json({message:"Notes Successfully",status:1})
       }).catch((err)=>{
           console.log("err for booking",err);
           res.json({message:"Somthing Went Worng",isOk:0})
       })
    } catch (error) {
       console.log(error)
      return res.json({message:"Somthing Went Worng",isOk:0})
    }
}

export const RemoveNote = async(req,res)=>{
       let payload = req.body;
    
       try {
        let valid_user = await UserModel.findOne({email:payload.email});
        if(!valid_user){
           return res.json({message:"User not exist !",isOk:0})
        }
        user = valid_user.notes.filter((item)=>item.id!=payload.id);
        await UserModel.findOneAndUpdate({email:payload.email},{$set:user}).then(()=>{
            res.status(201).json({message:"Notes deleted Successfully",status:1})
        })
       } catch (error) {
        console.log(error)
        return res.json({message:"Somthing Went Worng",isOk:0})
       }

}
