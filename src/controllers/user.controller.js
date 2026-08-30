import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { response } from "express";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

        ;
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
    if(!incomingRefreshToken){
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

    const {accessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshTokens(user._id)

    return res.status(200)
        .cookie("accessToken",accessToken,options )
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access Token refreshed Successfully" )
        
)
} catch (error) {
        throw new ApiError(401,error?.message ||
            "Invalid refresh Toke "
        )
    

    
}
    

})
const changeCurrentpassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old Password")
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false})
    return res.status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully "))
})
const getCurrUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Currect user Fetched Succssfully "))
})

const updateAccountDetails=await syncHandler(async(req,res)=>{
    const {fullname,Email}=req.body


    if (!fullname || !Email) {
        throw new ApiError(400,"All fields are required")}
        const user=User.findByIdAndUpdate(req.user?._id,
            {
                $set:{
                    fullname,
                    Email:Email
            
                }

            },
            {new:true}
        ).select("-password")
        return res
        .status(200)
            .json(new ApiResponse(200,user,"Account details updated successfully ")
            
        )


        


})

const oldAvatarUrl = req.user?.avatar;
const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarlocalPtah=req.file?.path//multer used
    if (!avatarlocalPtah) {
        throw new ApiError(400,"avatar file missing")
        
    }
    const avatar=await uploadOnCloudinary(avatarlocalPtah)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading Avatar")
    }
    await User.findByIdAndUpdate(req.user._id,
    {
        $set:{
            avatar:avatar.url
        }
    },
    {new:true}
    ).select("-password")
    return res
        .status(200)
            .json(new ApiResponse(200,user,"Avatar updated successfully ")
            
        )

})
if (oldAvatarUrl) {
        await deleteFromCloudinary(oldAvatarUrl);
    }
const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImagelocalPtah=req.file?.path//multer used
    if (!coverImagelocalPtah) {
        throw new ApiError(400,"Cover Image file missing")
        
    }
    const coverImage=await uploadOnCloudinary(coverImagelocalPtah)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading coverImage")
    }
    await User.findByIdAndUpdate(req.user._id,
    {
        $set:{
            coverImagelocalPtah:coverImage.url
        }
    },
    {new:true}
    ).select("-password")
    return res
        .status(200)
            .json(new ApiResponse(200,user,"coverImage details updated successfully ")
            
        )

})
const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params
    if (!username?.trim()) {
        throw new ApiError(400,"UserName is missing")
        
    }//aggrergate pipeline linkne k baad values array aate hai
    const channel=await User.aggregate([{
        $match:{
            username:username?.toLowerCase()
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
        }
    },
    {
        $addFields:{
            subscribersCount:{
                $size:"$subscribers"

            },
            channelsSubscribedToCount:{
                $size:"$subscribedTo"

            },
            isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},

                    then:true,
                    else:false

                }
                
            }

        }
    },
    {
        $project:{
            fullname:1,
            username:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1,




        }

    }
])
if(!channel?.length){
    throw new ApiError(404,"channel does not exist")
}
return res.
status(200)
.json(
    new ApiResponse(200,channel[0],"User channel fetched successfully")
)

})
const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await user.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)

            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[{
                    $lookup:{
                        from:"users",
                        loaclField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    fullname:1,
                                    username:1,
                                    avatar:1,
                                    




                                }
                            }
                        ]




                    }}
                ,{
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }

                }]
            }

        }

    ])
    return res
    .status(200)
    .json(new Apiresponse(200,user[0].watchHistory,
        "Watch history Fetched Successfully"
    ))
})
export {registerUser,
    loginUser,
    logOutUser,
    getCurrUser,
    refreshAccessToken,
    changeCurrentpassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};