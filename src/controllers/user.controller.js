import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiEroor.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validation-not empty
    //check if user already exist
    //chedck for images ,check for avatar
    //upload them to cloudinary,avatar
    //create user object- create entry db
    //reemovve pass nad refresh token field from reposnse
    //check for user creation
    //return res
    console.log("POSTMAN DATA:", req.body);
    const {fullname,Email,username,password}=req.body
    console.log("email:",Email);
    if(//empty check
        [fullname,Email,username,password].some((field)=>
            field?.trim()==="") ){
                throw new ApiError(400,"All fields are rqd")}

    const existedUser=await User.findOne({
        $or:[{username},{Email}]
    })

    if(existedUser){
        throw new ApiError(400,"User already exits!")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }
    
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }
    const user=User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url ||"",
        Email,
        password,
        username:username.toLowerCase()

})
const createdUser=await User.findById(user._id).select("-password -refreshToken")

if(!createdUser){
    throw new ApiError(500,"somthing went wrong while registring the user ")
}
return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered succesfully "
    )
)


    
    

    






    

})
export {registerUser,}