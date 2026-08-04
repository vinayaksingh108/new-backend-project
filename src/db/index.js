import mongoose from 'mongoose'
import {DB_NAME} from '../constants.js'

const connectDb=async ()=>{
    try{
        const coonectionInstance=await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`\n Mongo DB connected !! DB_Host:${coonectionInstance.connection.host} `);

    }
    catch(error){
        console.log("MONGODB CONNECTION ERROE ",error);
        process.exit(1)
    }
}
export default connectDb;