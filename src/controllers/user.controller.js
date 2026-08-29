import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};




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
    
    //const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files?.coverImage && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;}
const avatarLocalPath=req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }
    
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }
    const user=await User.create({
        fullname:fullname,
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
const loginUser=asyncHandler(async(req,res)=>{
    //req->body ->data a

    //take inpur id
    //take input pass
    //access token
    //reefresh token
    //verication from data base \
    //if matches redirect 
    //else again 
    //forget //
    //other rqd option 
    //login with email or usename
    //send cookies
    const {Email,username,password}=req.body
    if ((!username && !Email)) {
        throw new ApiError(400,"username or password is rqd") 
    }
    const user=await User.findOne({
        $or:[{username: username?.toLowerCase()}, {Email}]
    })
    
    if(!user){
        throw new ApiError(404,"User does not Exist")
    }
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    const loggedInUSer=await User.findById(user._id).select("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:true
    }
    return res.
    status(200).
    cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInUSer,accessToken,refreshToken
        },
    "user logged In Successfully")
    )


    


})
const logOutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))
})
export const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken|| req.body.refreshToken
    if(incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }
   try {
     const decodedToken=jwt.verify(incomingRefreshToken,
         process.env.REFERSH_TOKEN_SECRET
 
     )
     const user=await User.findById(decodedToken?._id)
     if(!user){
         throw new ApiError(401,"Invalid refresh Token")
     }
     if(incomingRefreshToken!== user?.refreshToken){
         throw new ApiError(401," refresh Token is exp or used")
     }
     const options ={
         httpOnly:true,
         secure:true
     }
 
     const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
 
     return res.status(200)
         .cookie("accessToken",accessToken,options )
         .cookie("refreshToken",newRefreshToken,options)
         .json(
             new ApiResponse(
                200,
                 {accessToken,refreshToken:newRefreshToken},
                "Access Token refreshed Successfully"
 
             )
             
 )
   } catch (error) {
        throw new ApiError(401,error?.message ||
            "Invalid refresh Toke "
        )
    

    
   }
    

})
export {registerUser,
    loginUser,
    logOutUser,
};