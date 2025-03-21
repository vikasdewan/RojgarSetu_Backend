import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'; //file system
import { ApiError } from './ApiError.js';
 
          
cloudinary.config({ 
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`, 
  api_key: `${process.env.CLOUDINARY_API_KEY}`, 
  api_secret: `${process.env.CLOUDINARY_API_SECRET}` 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload the file on cloudinary 
      const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //file has been uploaded successfull 
        // console.log("File is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath )
    }
}
const   deleteAssetAfterUploading = async(filename)=>{
    try {
        cloudinary.uploader.destroy(`${filename}`, function(result) { console.log("deleted file after uploading from cloudinary",result) });
    } catch (error) {
        throw new ApiError(500,"Error while deleting assets from cloudinary after uploading ...",error.message)
    }
}

export {uploadOnCloudinary,deleteAssetAfterUploading}