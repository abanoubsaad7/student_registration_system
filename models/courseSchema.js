const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema ({
    departmentName:String,
    name:String,
    hourse:Number,
    level:Number,
    profID:mongoose.Types.ObjectId,
    dayName:String,
    // schedule:{
    //     hours:{
    //         type:Number,
    //         required:true,
    //         min:0,
    //         max:23
    //     },
    //     minutes:{
    //         type:Number,
    //         required:true,
    //         min:0,
    //         max:59
    //     }
   // }
   })
   
   const Course = mongoose.model('course',courseSchema);
   
   module.exports = Course;