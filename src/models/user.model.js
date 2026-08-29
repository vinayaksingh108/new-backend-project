import mongoose,{Schema} from "mongoose";
import jwt from  'jsonwebtoken'
import bcrypt from "bcrypt"
const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,//to enavble searchibg field

        
        },
        Email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullname: {
    type: String,
    required: true,
    index: true,
    trim: true, 
},
        avatar:{
            type:String,//cloudnary
            required:true,


        },
        coverImage:{
            type:String
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            require:[true,"Password is required "]
        },
        refreshToken:{
            type:String
        }



},{
    timestamps:true
})
//hook to encrypt juast before savinh:prehook
// Hook to encrypt just before saving: prehook
userSchema.pre("save", async function () {
    // Aisa krne k liye jab mai pass field ko check kru visit kru tab hi encrypt ho 
    if (!this.isModified("password")) return; 
    
    // Ye save hone se phle pass ko encrypt krega 10 hash rounds me
    this.password = await bcrypt.hash(this.password, 10); 
});
userSchema.methods.isPasswordCorrect=async function(password){
    //brypt library can also check and verify the encrypted pass
    return await bcrypt.compare(password,this.password)//give pass aur user pass ko  compare krr lega
//it waits bcz it includes cryptography


}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        Email:this.Email,
        username:this.username,
        fullname:this.fullname
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
)
    //jwt sign methofd generat etoken
    //JW team works as it is stores the data between usee and server in token to make it private

}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
        Email:this.Email,
        username:this.username,
        fullname:this.fullname
    },process.env.REFERSH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
)
    
}

export const User=mongoose.model("User",userSchema)


