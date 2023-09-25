const RatingAndReview = require('../models/RatingAndReview')
const Course = require('../models/Course');
const { default: mongoose } = require('mongoose');

//createRating
exports.createRating = async( req,res ) => {
    //get user id
    try{const userId = req.user.id;
    //fetch data from req.body
     const {rating, review, courseId} = req.body;
    //check if user is enrolled or not
    const courseDetails = await Course.findOne(
        {_id:courseId,
        studentsEnrolled: {$elemMatch: {$eq: userId}},
        }
    );
    if(!courseDetails){
        return res.status(404).json({
            success:false,
            message:'Student is not enrolled in course',
        })
    }
    //check if user already reveiwed the course
    const alreadyReveiwed = await RatingAndReview.findOne({user:userId, course:courseId});
    if(alreadyReveiwed){
        return res.status(403).json({
            success:false,
            message:'Course Is Already reviwed by user',
        })
    }

    const ratingReview = await RatingAndReview.create({rating,review,course:courseId,user:userId});
    //update in course
    await Course.findByIdAndUpdate(courseId,
        {
            $push:{
                ratingAndReveiews:ratingReview._id,
            }
        },{new:true})

        return res.status(200).json({
            success:true,
            message:'Rating added successfully',
            ratingReview
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Error While Creating Rating And review',
            error:err.message,
        })
    }

}


//getAverageRating
exports.getAverageRating = async( req,res ) => {
    try{
        //get course id
        const courseId = req.body.courseId;
        //calculate average rating
        const result = await RatingAndReview.aggregate(
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating: { $avg:"$rating"},
                }
            }
        )
        //return rating

        if(result.length >0 ){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }
        return res.status(200).json({
            success:true,
            averageRating:0,
        })
        
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Error While Getting average rating",
            error:err.message,
        })
    }
}


//getAllRating
exports.getAllRating = async( req,res ) => {
    try{
        const allReviews = RatingAndReview.find().sort({rating: "desc"}).populate({
            path:'user',
            select:'firstName lastName email image',
        }).populate({
            path: 'course',
            select:'courseName'
        }).exec();

        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
    })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Error While Fethcing ratings and review'
        })
    }
}
