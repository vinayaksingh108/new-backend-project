import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"//this is used to access and set cookies
const app=express()
app.use(cors( {
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))//it encodes url of diffrent types 
app.use(express.static("public"))
app.use(cookieParser())

//yha pe hum routs le aayenge  import


import userRouter from'./routes/user.routs.js' 


//router decleration
app.use("/api/v1/users",userRouter)
//https://localhost:8000/api/v1/users/register

export {app}