import dotenv from "dotenv";
import connectDb from "./db/index.js";



dotenv.config({
    path: "./.env"
});
import { app } from "./app.js";

connectDb().then(()=>{
app.on("error",(error)=>{
    console.log("ERRR",error);
    throw error;
});
app.listen(process.env.PORT || 9000,()=>{
console.log(`server is runnit at port:${process.env.PORT};`);
});
})

.catch((err)=>{
    console.log("DB connection error",err);
})




















//approach 1
// import express from "express"
// const app=express()
// (async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
//         app.on('error',()=>{
//             console.log("Application not able to talk")
//             throw error;
//         })
//         app.listen(process.env.PORT,()=>{
//         console.log(`Application is listning on ${process.env.PORT}` )})

//     }
//     catch(error){
//         console.error("ERROR:",error);
//         throw error
//     }

// })
//     ()


