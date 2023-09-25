const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailsender = require('../utils/mailSender');
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');
const { default: mongoose } = require('mongoose');

//capture the payment and iniate order

exports.capturePayment = async( req,res ) => {
    //get courseId and UserId
    const {course_id} = req.body;
    const userId = req.user.id;
    if(!course_id){
        return res.status(200).json({
            success:false,
            meesage:'Please provide a valid id',
        })

    }
    //validation
    //valid courseID
    //valid courseDetails
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.status(500).json({
                success:false,
                message:'Could Not Find the course'
            })
        }
        //user already paid for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentSEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:'Student is Already Enrolled',
            })
        }

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }

    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        nodes:{
            courseId:course_id,
            userId,
        }
    }

    //function call
    try{
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        return res.status(200).json({
            success:false,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })
    }
    catch(error){
        res.json({
            success:false,
            message:'Could Not initiate Response',
            error:error.meesage,
        })
    }
    
}

//verify Signature of Razorpay And Server
exports.verifySignature = async( req,res ) => {
    const webHookSecret =  '12345678';

    const signature = req.headers["x-razorpay-signature"];  

    const shasum = crypto.createHmac('sha256',webHookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");
    
    if(signature === digest){
        console.log("Payment id Authorised");
        const {courseId , userId} = req.body.payload.payment.entity.nodes;


        try{
            //fulfill the action

            //find the course and enroll student in it
            const enrolledCourse =  await Course.findOneAndUpdate({_id:courseId},
                {$push:{
                    studentSEnrolled:userId,
                }},{new:true});


                if(!enrolledCourse){
                    return res.status(500).json({
                        success:false,
                        message:'Course Not found',
                    })
                }

                //find the student and update courses enrolled

                const enrolledStudent = await User.findOneAndUpdate({_id:userId},
                    {$push:{
                        course:{courses:courseId}
                    }},
                    {new:true}
                    )


                //mail send for confirmation
                const emailResponse = await mailsender(
                    enrolledStudent.email,
                    "Welcome to StudyNotion",
                    courseEnrollmentEmail,
                )
                return res.status(200).json({
                    success:true,
                    message:'Signature Verified And course Added successfully',
                })
        }
        catch(err){
            return res.status(500).json({
                success:false,
                message:'Error While Verifying Signature',
        })
        }
    }
    else{
        return res.status(500).json({
            success:false,
            error:'Some Error Occured',
        })
    }


};
