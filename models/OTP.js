const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    }
})

async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = mailSender(email,"Verification Mail From StudyNotion",emailTemplate(otp));
        console.log('Email sent Successfully',mailResponse);
    }
    catch(err){
        console.log(err.message);
    }
}

OTPSchema.pre('save',async function(next) {
    await sendVerificationEmail(this.email,this.otp,next);
    next();
})

module.exports = mongoose.model('OTP',OTPSchema);