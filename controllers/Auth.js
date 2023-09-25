const User = require('../models/User');
const OTP  = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
require('dotenv').config();
//OTP
exports.sendOTP = async(req,res) => {
    try{
        const {email} = req.body;

    //check if user already exist
    const checkUserPresent = await User.findOne({email});

    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:'User Already Registered',
        })
    }

    //generate otp
    var otp =  otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    })

    //check unique otp or not 
    var result = await OTP.findOne({otp:otp});

    while(result){
        otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
         result = OTP.findOne({otp:otp});
    }

    const otpPayload = {
        email,otp
    }
    //create an entry in db for OTP 
    const otpBody = await OTP.create(otpPayload);

    //return response Successfull 
    return res.status(200).json({
        success:true,
        message:'Otp Sent Successfully',
        otp,
    })
}
    catch(err){
        res.status(500).json({
            success:false,
            message:err.message,
        })
    }   
    
}

//generate otp

//SignUp
exports.signup = async(req,res) => {
   try{ //data fetch from request body 
    // validate kro
    
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp,
    } = req.body;
    if(!firstName || !lastName ||!email ||!password ||!confirmPassword ||!otp){
        return res.status(403).json({
            success:false,
            message:'All fields Are Required',
            
        })
    }
    //password match
    if(password != confirmPassword){
        return res.status(200).json({
            success:false,
            message:'Password and Confirm Password are not same',
        })
    }

    //check if user already exist
    const existingUser = await User.findOne({email});

    if(existingUser){
        return res.status(200).json({
            success:false,
            message:'User is Already registerd',
        })
    }


    //find most recent OTP stored for the user
    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    if(recentOtp.length === 0){
        return res.status(400).json({
            success:false,
            message:'Otp Not found',
        })
    }
    else if(otp != recentOtp[0].otp){
        return res.status(400).json({
            success:false,
            message:'Otp doesnt match',
        })
    }


    let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);
    //hash password 
    const hashedPassword = await bcrypt.hash(password,10);
    //store password
    const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType: accountType,
        approved: approved,
        additionalDetails: profileDetails._id,
        image: 'https://api.dicebear.com/5.x/initials/svg?seed='+firstName+' '+lastName,
    });

    return res.status(200).json({
        success:true,
        message:'user created successfuly',
        user
    })


}
    

    

    catch(err){
        return res.status(500).json({
            success:false,
            message:'user cannot be registered',
            error:err.message
        })
    }

}

//Login
exports.login = async(req,res) => {
    try{
        ///get data from req body
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All field are required',
            })
        }
        //validation data
        //user check exist or not
        const user = await User.findOne({email}).populate('additionalDetails');
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User is not registered',
            })
        }
        //generate jwt token after password matches
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token  = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:'2h'
            })
            user.token = token;
            user.password = undefined;

            const options = {
                expires:new Date(Date.now()+ 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie('token',token,options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:'password is incorrect'
            })
        }
        //create a cookie and send response
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:'Error while logging in',
            error:err.message,
            
        })
    }
}

//changePassword
exports.changePassword = async(req,res) => {
    //req data from req  body
    //getOldPassword , new password Confirm new Password
    //validation
    //update pwd in db
    //send mail 
}