import mongoose,{ Schema } from "mongoose";
const subscriptionSchema=newSchema({
    subscriber:{
       type:Schema.Types.ObjectId,//one who is subs 
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"

    }

},{timestamps:true})
export const Subscription=mongoose.model("Subscription",subscriptionSchema)