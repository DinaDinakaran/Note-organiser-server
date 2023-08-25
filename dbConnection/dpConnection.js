import mongoose from "mongoose";

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    sslValidate: true,  
  };
const mogodbConnect = ()=>{
    mongoose.connect(process.env.DB_CONNECT).then(()=>{
        console.log("Vanakam da mapala Db la erunthu")
    }).catch((error)=>console.log("db error  ",error))
}

export default  mogodbConnect;