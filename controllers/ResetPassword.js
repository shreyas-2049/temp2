const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

exports.resetPasswordToken = async( req,res ) => {
    try{const {email} = req.body;
    //email validation and check if user exist
    const user = await User.findOne({email: email});

    if(!user){
        return res.json({
            success:false,
            message:'Your mail is not registerd with us',
        })
    }
    //generate token    
    const token = crypto.randomBytes(20).toString("hex");

    const updatedDetails = await User.findOneAndUpdate(
        { email: email },
        {
            token: token,
            resetPasswordExpires: Date.now() + 3600000,
        },
        { new: true }
    );
    //create url
    const url = `http://localhost:3000/update-password/${token}`
    //send mail containing the url 
    await mailSender(email,"Password Reset Link ",`Password Reset Link: ${url}`)
    //return response
    return res.json({
        success:true,
        message:'Email sent Successfully',
    })
}
catch(err){
    return res.status(500).json({
        success:false,
        message:'Something went wrong while reset',
        error:err.message,
    })
}

    

}

exports.resetPassword = async( req,res ) => {
    //data fetch
    const {password,confirmPassword,token} = req.body; 
    //validation
    if(password !== confirmPassword){
        return res.json({
            success:false,
            message:'Password and confirm passwrod are not same',
        })
    }  

    //get userDetails from db using token
    const userDetails = await User.findOne({token:token})
    //if no entry - invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:'User not found',
        })
    }
    //token time check
    if(userDetails.resetPasswordExpires < Date.now()){
        return res.json({
            success:false,
            message:'Token expired',
        })
    }
    //hash pswd
    const hashedPassword = await bcrypt.hash(password,10);
    //update pswd
    await User.findOneAndUpdate({token:token},{password:hashedPassword},{new:true})

    return res.status(200).json({
        success:true,
        message:'Password Reset Successfully',
    })
}