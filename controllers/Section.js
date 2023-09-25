const Section = require('../models/Section');
const Course = require('../models/Course');


exports.createSection = async (req, res) => {
	try {
		// Extract the required properties from the request body
		const { sectionName, courseId } = req.body;

		// Validate the input
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}

		// Create a new section with the given name
		const newSection = await Section.create({ sectionName });

		// Add the new section to the course's content array
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// Return the updated course object in the response
		res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});
	} catch (error) {
		// Handle errors
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

exports.updateSection = async( req,res ) => {
    try{
        //data input
        const{sectionName,sectionId} = req.body; 
        //data validation
        if(!sectionName || !CourseId){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            })
        }
        //update data
        const section = await Section.findByIdAndUpdate(courseId,{
            sectionName
        },{new:true})
        //return response
        return res.status(200).json({
            success:true,
            message:'Section Updated Successfully',
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Error While Updating Section',
            error:err.message,
        })
    }
}

exports.deleteSection = async( req,res ) => {
    try{
        const{sectionId} = req.body;
        if(!sectionId){
            return res.status(500).json({
                success:false,
                message:'Id not found',
            })
        }
        //TODO: Check if need to be removed from course also
        
        await Section.findByIdAndDelete(sectionId);
        return res.status(200).json({
            success:true,
            message:'Section deleted Successfully',
        })
        
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Error While Deleting Section',
            error:err.message,
        })
    }
}