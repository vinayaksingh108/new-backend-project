
import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new Schema({
    id:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    videoFile:{
        type:String,//cloudnary url
        required:true 
    },
    thumbnail:{
        type:String,//cloudnary
        required:true
    },
    title:{
        type:String,
        required:true
    },
    discription:{
        type:String,
        required:true
    },
    duration:{
        type:Number,//cloudnary
        required:true
    },
    views:{
        type:Number,
        default:true
    

    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        typr:Schema.Types.ObjectId,
        ref:"User"
    }




},{timestamps:true})
videoSchema

export const Video=mongoose.model("Video",videoSchema)