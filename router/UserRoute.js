import express from "express";
import { UserPasswordRest, Userforget, UsersignIn, UsersignUp,AddNotes,RemoveNote, getAllNote, Updatenote} from "../controller/UserCntrl.js";

const route = express.Router();

route.post("/create",UsersignUp)
route.post("/signin",UsersignIn)
route.post("/resetpassword/:token",UserPasswordRest)
route.post("/forgetpassword",Userforget)
route.post("/addnote",AddNotes)
route.post("/deletenote",RemoveNote)
route.post("/getallnote",getAllNote)
route.post("/updatenote",Updatenote);

export default route;