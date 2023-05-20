const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profCourseSchema = new Schema ({
    profID:mongoose.Types.ObjectId,
    courseID:mongoose.Types.ObjectId
});

const ProfCourse = mongoose.model('ProfCourse',profCourseSchema);

module.exports = ProfCourse;