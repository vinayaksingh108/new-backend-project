
import fs from 'fs';

import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './ApiError';



    // Configuration
    cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
        api_key:process.env.CLOUDINARY_API_KEY , 
        api_secret:process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
    });
    const uploadOnCloudinary=async(localFilePath)=>{
        try{
            if(!localFilePath) return null;
//uplaod the file on clodinary
const response=await cloudinary.uploader.upload(localFilePath,{
    resource_type:"auto"
})
//file has been uploaded successfully 
// console.log("FIle is uplaoded on claudinary",response.url);
fs.unlinkSync(localFilePath);
return response;
        }catch(error){
            fs.unlinkSync(localFilePath)//remove the loaclly saved temp file as the upload opration got failed 

        }

    }

    const deleteFromCloudinary = async (cloudinaryUrl) => {
    try {
        // 1. If there is no URL, just stop and return false
        if (!cloudinaryUrl) {
            return false;
        }

        // 2. Chop the long URL string into an array of smaller strings at every "/"
        // Example: "http://site.com/images/avatar.jpg" 
        // Becomes: ["http:", "", "site.com", "images", "avatar.jpg"]
        const allUrlPieces = cloudinaryUrl.split("/");
        
        // 3. Find the last position in that array (Arrays start at 0, so length - 1)
        const lastPosition = allUrlPieces.length - 1;
        
        // 4. Grab the actual file name using that position
        const fullFileName = allUrlPieces[lastPosition]; // "avatar.jpg"
        
        // 5. Chop the file name into pieces at the dot "."
        // Example: "avatar.jpg" becomes ["avatar", "jpg"]
        const fileNamePieces = fullFileName.split(".");
        
        // 6. The ID is the very first piece (index 0)
        const publicId = fileNamePieces[0]; // "avatar"

        // 7. Tell Cloudinary to delete it
        await cloudinary.uploader.destroy(publicId);
        
        return true;

    } catch (error) {
        console.error("Failed to delete old image:", error?.message);
        return false;
    }
};

    
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
            public_id: 'shoes',
        }
       )
       .catch((error) => {
           console.log(error);
       });
    export {uploadOnCloudinary
        ,deleteFromCloudinary
    };
    
    