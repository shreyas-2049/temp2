const SubSection =  require('../models/SubSection')
const Section = require('../models/Section');
const { uploadImageToCloudinary } =  require('../utils/imageUploader'); 
require('dotenv').config();
//create subsection

exports.createSubsection = async( req,res ) => {
    try{
        //fetch data from request body
        const{title,timeDuration,description,sectionId} = req.body;   
        //extract files
        const video = req.files.videoFile;
        //validation
        if(!title || !sectionId || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:'All fields Are Required',
            })
        }
        //upload video to cloudinary
        const updatedDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        //create subsection
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:updatedDetails.secure_url,
        })
        //update section with this subsection id
        const updatedSection = await Section.findByIdAndUpdate(sectionId,{
            $push:{
                subSection:SubSectionDetails._id,
            }
        },{new:true})
        //return response
        return res.status(200).json({
            success:true,
            message:'Subsection Created Successfully',
            updatedSection,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Error While Creating Section',
        })
    }
}

exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, title, description } = req.body
      const subSection = await SubSection.findById(sectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      return res.json({
        success: true,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }
  
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }