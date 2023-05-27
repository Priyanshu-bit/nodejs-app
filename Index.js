// import http from 'http'

// import { generateLove } from  './feature.js'
// // import fs from 'fs'

// // const home = fs.readFileSync("./index.html")

// const server = http.createServer((req,res)=>{
//     console.log(req.method)
//  if (req.url ==="/about"){
//     res.end (` Love is ${generateLove()}`);
//  }
//   else if (req.url ==="/"){
//     res.end ("home");
//   }
//  else {
//     res.end ("page not found");
//    }
 
// })



// server.listen(5000,()=>{
//     console.log ("tree")
// })


import express from "express"
import path from "path"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
 
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",

})
.then (()=> console.log("Database Connected"))
.catch((e)=>console.log(e));

const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
const user = mongoose.model("user",userSchema)

const app= express();
//Setting view engine


app.set("view engine", "ejs");
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


const isAuthenticated = async(req,res,next)=>{
    const {token }= req.cookies;
if (token )
{
    const decode=jwt.verify( token,"asdfagdfsgf")
req.User= await user.findById(decode._id)
    
    next()
}
else{
    res.redirect("/login")
}
};

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/",isAuthenticated,(req,res)=>{

    res.render("logout",{name:req.User.name })
    
})
app.get("/register",(req,res)=>{

    res.render("register")
    
})




app.get("/logout" ,(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,expires: new Date(Date.now() )
 });
    res.redirect("/");
})




app.post("/login", async(req,res)=>{
 
let {email,password}= req.body

   let User= await user.findOne({email});
    if (!User)  return res.redirect ("/register")


  const isMatch = bcrypt.compare(password,User.password);


  if (!isMatch) {return res.render("login" , {email,msg: "Incorrect Password"})}
  const token = jwt.sign({_id:User._id},"asdfagdfsgf")
   
    res.cookie("token",token,{
        httpOnly:true,expires: new Date(Date.now()+60*1000 )
 });
    res.redirect("/");
})

app.post("/register" , async(req,res)=>{

    const {name,email,password}= req.body

    let User = await user.findOne({email});
    if (User){
        return res.redirect("/login")
    }
const hashpassword= await bcrypt.hash(password,10)
     User = await user.create({
        name,
        email,
        password:hashpassword,
    })
    const token = jwt.sign({_id:User._id},"asdfagdfsgf")
   
    res.cookie("token",token,{
        httpOnly:true,expires: new Date(Date.now()+60*1000 )
 });
    res.redirect("/");
})




app.listen(5000,()=>{
    console.log("server is working")
})
