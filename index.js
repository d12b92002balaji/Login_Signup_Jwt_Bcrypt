import express from "express";
import {PORT,mongoDBURL} from './config.js';
import cors from 'cors';
import mongoose from "mongoose";
import { Collection } from "./mongo.js";
import path from "path";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcryptjs from "bcryptjs";


const app =express();
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))
app.use(cors());

const templatePath=path.dirname("./tempelates")
const publicPath=path.dirname("./public")


app.set('view engine','hbs')
app.set("views",templatePath)
app.use(express.static(publicPath))



async function hashPass(password){ 
    const res=await bcryptjs.hash(password,10)
    return res;
}
async function compare(userPass,hashPass){
    const res=await bcryptjs.compare(userPass,hashPass)
    return res;
}

app.get("/",(req,res)=>{

    if(req.cookies.jwt){
        const verify=jwt.verify(req.cookies.jwt,"helloandwelcometotechywebdevtutorialonauthhelloandwelcometotechywebdevtutorialonauth")
    res.render("./tempelates/home",{name:verify.name})
    }

    else{
        res.render("./tempelates/login")
    }

})

app.get("/signup",(req,res)=>{
    res.render('./tempelates/signup')
})

app.post("/signup",async(req,res)=>{
    try{
        const check=await Collection.findOne({name:req.body.name})
        if(check){
            res.send("user already exist")
        }
        else{
            const token=jwt.sign({name:req.body.name},"helloandwelcometotechywebdevtutorialonauthhelloandwelcometotechywebdevtutorialonauth")

            res.cookie("jwt",token,{
                maxAge:600000,
                httpOnly:true
            })
            const data={
                name:req.body.name,
                password:await hashPass(req.body.password),
                token:token
            }
            await Collection.insertMany([data])
            res.render("./tempelates/home",{name:req.body.name})
        }
    }catch{
        res.send("wrong details")
    }
})
app.post("/login",async(req,res)=>{
    try{
        const check=await Collection.findOne({name:req.body.name})
        const passCheck=await compare(req.body.password,check.password)
        if(check && passCheck){
            res.cookie("jwt",check.token,{
                maxAge:600000,
                httpOnly:true
            })
            // res.render("./tempelates/home",{name:req.body.name})
            res.json({check})
        }
        else{
            res.send("wrong details")
        }
    }
    catch{
        res.send("wrong details")
    }
})



mongoose.connect(mongoDBURL).then(()=>{
    console.log(`app connect to database`);
    app.listen(PORT,()=>{
        console.log(`app is listening to port:${PORT}`);
    });
}).catch((error)=>{
    console.log(error);
})