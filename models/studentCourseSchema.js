const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentCourseSchema = new Schema ({
    studendID:mongoose.Types.ObjectId,
    courseID:mongoose.Types.ObjectId
});

const StudentCourse = mongoose.model('StudentCourse',studentCourseSchema);

module.exports = StudentCourse;