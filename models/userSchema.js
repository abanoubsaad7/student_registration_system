const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    fname:String,
    lname:String,
    username: String,
    password:String,
    phone:String,
    level:Number,
    department:String,
    //other users
    salary:Number,
    //student property
    gpa:Number,
    //to get the right path to current user
    type:String
});
const User = mongoose.model("User",userSchema);

module.exports = User;