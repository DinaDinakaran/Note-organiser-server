import  Express  from "express";
import dotenv from "dotenv"
import cors from "cors"
import mogodbConnect from "./dbConnection/dpConnection.js";
import UserRouter from "./router/UserRoute.js"

dotenv.config()

const app = Express();
app.use(Express.json());
app.use(cors());
mogodbConnect();
app.use("/api/user",UserRouter)

let port = process.env.PORT || 8001
app.listen(port ,()=>{
    console.log(`server run on port ${port}`)
})