const Category = require('../models/Category');

exports.createCategory = async( req,res ) => {
    try{
        const {name,description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //create entry in db 
        const CategoryDetails = await Category.create({
            name:name,
            description:description,
        })
        console.log(CategoryDetails);

        return res.status(200).json({
            success:true,
            message:'Category Created Successfully',
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}

//getAllCategorys

exports.showAllCategories = async( req,res ) => {
    try{
        const allCategories = await Category.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:'All Categorys fetched Successfully',
            allCategories,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'Error While FInding Categories',
            err:err.message,
        })
    }
}

//category page details 

exports.categoryPageDetails = async( req,res ) => {
    try{
        //get category id
        const {categoryId} = req.body;
        //getcoursees for specified category id
        const selectedCategory = Category.findById(categoryId).populate('courses').exec();
        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:'Data Not Found',
            })
        }
        //get courses for different categories
        const diffrentCategories = await Category.find({
            _id: {$ne: categoryId},
        })
        //get topselling courses
        //return response
        return res.status(200).json({
            success:true,
            data: {
                selectedCategory,
                diffrentCategories
            }
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}