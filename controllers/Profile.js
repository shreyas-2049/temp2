const Profile = require('../models/Profile');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
require('dotenv').config();


exports.updateProfile = async( req,res ) => {
    try{
        //get data and user id 
        const {dateOfBirth="",about="",contactNumber, gender}  = req.body;
        const id = req.user.id;
        //validation
        
        //find profile and update profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;

        const profileDetails = await Profile.findById(profileId);
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        //return response
        return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully',
            profileDetails,
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            meessage:'Error While Updating Profile',
            error:err.message,
        })
    }
}

//delete account function
exports.deleteAccount = async( req,res ) => {
    try{
        //fetch id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:'User not found',
            })
        }
        //delete profile and user
        await Profile.findOneAndDelete({_id:userDetails.additionalDetails});
        await User.findOneAndDelete({_id:id});
        //return response
        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            meessage:'Error While Deleting Profile',
            error:err.message,
        })
    }
}

exports.getAllUserDetails = async( req,res ) => {
    try{
        //get id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id).populate('additionalDetails').exec();
        //return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            userDetails,
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            meessage:'Error While fetching Profile Details',
            error:err.message,
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      // console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      // console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};