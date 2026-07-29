import mongoose from 'mongoose'
import{ DB_Name}from ".constants";
import express from "express"
const app=express()
(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        app.on('error',()=>{
            console.log("Application not able to talk")
        })

    }
    catch(error){
        console.error("ERROR:",error);
        throw error
    }

})
    ()


