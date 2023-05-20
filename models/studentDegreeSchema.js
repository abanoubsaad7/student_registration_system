const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentDegreeSchema = new Schema ({
    studendID:mongoose.Types.ObjectId,
    courseID:mongoose.Types.ObjectId,
    degree:{
      default:0,
      type:Number,
    },
});

const StudentDegree = mongoose.model('StudentDegree',studentDegreeSchema);

module.exports = StudentDegree;