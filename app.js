//  to controll ur website
//build app settings start point
const express = require("express");
const app = express();
const port = 4000;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//models
const User = require("./models/userSchema");
const Course = require("./models/courseSchema");
const StudentCourse = require("./models/studentCourseSchema");
const ProfCourse = require("./models/profCourseSchema");
const StudentDegree = require("./models/studentDegreeSchema");

//log in var to select user id & type
let InstanceUser = null;

//set up for uploads files
const formidable = require("formidable");
const form = formidable({ multiples: true });
const fs = require("fs");
const mv = require("mv");
const path = require("path");

//body parser types
const bodyParser = require("body-parser");
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://AbanoubSaad:dev@cluster0.yoqimye.mongodb.net/student_Registration_System?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(process.env.PORT || port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })

  .catch((err) => {
    console.log(err);
  });

app.get('/', (req, res) => {
  res.redirect('/index')
})

app.get("/index", (req, res) => {
  res.render("index",{title:'student registration system'});
});


//log in request
app.post("/login", function (req, res) {
  let user = {
    username: req.body.username,
    password: req.body.password,
    type: req.body.type,
  };
  User.findOne(user)
    .then((result) => {
      InstanceUser = result;
      console.log(result.type);
      if (
        result.username === user.username &&
        result.password === user.password &&
        result.type === user.type
      ) {
        if (result.type === "table admin") {
          res.redirect("/course");
        } else if (result.type === "student") {
          res.redirect("/profile");
        } else if (result.type === "professor") {
          res.redirect("/choose-course-toTeach");
        } else if (result.type === "controller") {
          res.redirect("/set-degree");
        }else if (result.type === "staff" || result.type === "admin"){
          res.redirect("/manage-user")
        }
      } else {
        res.send(`log in faild as ${result.type}`);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/profile', (req, res) => {
  User.findById(InstanceUser._id).then((result)=>{
    res.render('profile',{objstudent:result,title:'profile'})
  })
  .catch((err)=>{
    console.log(err);
  })
})

//staff  & admin path or request to add students  and if user is admin he can add other employee in system
//get request
app.get('/manage-user', (req, res) => {
  res.render("manage-user",{title:"manage user"})
})

app.get("/register", (req, res) => {
  res.render("register",{title:"register"});
});
app.get('/update-students', (req, res) => {
  User.find({type:"student"}).then((student)=>{
    res.render('update-students',{arrStudent:student,title:'update-students'})
  })
})
app.get('/update-students/:idstudent', (req, res) => {
  User.findById(req.params.idstudent).then((student)=>{
    res.render('update-students-form',{objStudent:student,title:'update-student'})
  })
})
//post request
app.post("/profile", (req, res) => {
  const newUser = new User(req.body);

  newUser
    .save()
    .then((result) => {
      console.log(result);
      res.redirect("/register");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post('/update-students/:idstudent', (req, res) => {
  User.findByIdAndUpdate(req.params.idstudent,req.body).then((student)=>{
    res.redirect('/update-students')
  })
})

//table admin path or request to add courses
//get request
app.get("/course", (req, res) => {
  res.render("add-course",{title:"add course"});
});

//post request
app.post("/course", function (req, res) {
  const newCourse = new Course(req.body);

  newCourse.save().then((result) => {
    console.log(result);
    res.redirect("/course");
  });
});

//student path or request to select course to study
//get request
app.get("/select-course", function (req, res) {
  User.findOne(InstanceUser).then((student) => {
    let studentLevel = student.level;
    Course.find({ level: studentLevel }).then((course) => {
      res.render('select-course',{title:'select course',arrCourse:course,objstudent:student})
      console.log(course); //course will display all courses that match with student level
    });
  });
});

app.get('/select-course-toStudy/:id', (req, res) => {
  let courseID = req.params.id;
  User.findOne(InstanceUser).then((student)=>{
    Course.findById({_id: courseID}).then((courseStudy) => {
      res.render('course-toStudy',{title:'select the course to study',objectCourse:courseStudy,objstudent:student})
    });
  })
})

app.get('/courses-table', async(req, res) => {
  let StudentCourses = await StudentCourse.find({studendID: InstanceUser._id});
  let Courses = [];
  for (let i = 0; i < StudentCourses.length; i++) {
    const element = StudentCourses[i];
    Courses.push(await Course.findById(element.courseID));
  }
  res.render('courses-table',{title:'courses table',arrCourses:Courses});
})

app.get('/courses-degree', async(req, res) => {
  let Degrees = await StudentDegree.find({studendID: InstanceUser._id})
  let CourseNames = [];
  for (let i = 0; i < Degrees.length; i++) {
    const element = Degrees[i];
    CourseNames.push((await Course.findById(element.courseID)).name);
  }
  User.findById(InstanceUser?._id).then((student)=>{
    console.log(Degrees);
    console.log(CourseNames);
    res.render('courses-degrees',{title:'courses degree',arrDegrees:Degrees, arrCourseNames: CourseNames,objstudent:student});
  })

  
})

//post request
app.post("/select-course-toStudy/:id", function (req, res) {
  let IDCourseStudy = new mongoose.Types.ObjectId(req.params.id);
  StudentCourse.find({
    studendID: InstanceUser._id,
    courseID: IDCourseStudy,
  }).then(async (selectedCourseToStudy) =>  {
    if (selectedCourseToStudy == 0) {
      let CorsesOfStudent = await StudentCourse.find({studendID: InstanceUser._id});
      let UserCorse = await Course.findById(IDCourseStudy); //usercorse to the new enroll
      let IsValid = true;
      for (let i = 0; i < CorsesOfStudent.length; i++){
        const element = CorsesOfStudent[i];
        let Corse = await Course.findById(element.courseID); //old enrolled courses
        if (Corse._id != UserCorse._id){
          if (UserCorse.dayName == Corse.dayName) {
            if (UserCorse.schedule.hours + (UserCorse.schedule.minutes*0.1) <= Corse.schedule.hours + (Corse.schedule.minutes*0.1) + Corse.hoursOfCourse
              && UserCorse.schedule.hours + (UserCorse.schedule.minutes*0.1) + UserCorse.hoursOfCourse >= Corse.schedule.hours + (Corse.schedule.minutes*0.1)){
                IsValid = false;
              }
          }
        }
      }
      if (IsValid) {
        const newStudentCourse = new StudentCourse({
          studendID: InstanceUser._id,
          courseID: IDCourseStudy,
        });
        console.log(newStudentCourse);
        newStudentCourse.save().then((result) => {
          StudentDegree.find({
            studendID:InstanceUser._id,
            courseID: IDCourseStudy,
          }).then((selectedCourse)=>{
            if (selectedCourse == 0) {
              const newStudentDegree = new StudentDegree({
                studendID: InstanceUser._id,
                courseID:IDCourseStudy,
              });
              console.log(newStudentDegree);
              newStudentDegree.save().then((result)=>{
                res.redirect('/profile');
              })
            }
          })
        });
      }else{
        res.send("this course has the same time in other course you enrolled")
      }
    }
  });
});

//prof path or request to select course to teach
//get request
app.get("/choose-course-toTeach", (req, res) => {
  User.findOne(InstanceUser).then((prof) => {
    //InstanceUser.type = prof
    Course.find().then((courseTeach) => {
      res.render('select-course-toTeach',{title:'select course to teach',arrCourse:courseTeach})
      console.log(courseTeach); // courseTeach will display all courses in sys to select
    });
  });
});

app.get('/choose-course-toTeach/:id', (req, res) => {
  let courseID = req.params.id;
  Course.findById({_id: courseID}).then((course) => {
    res.render('course-toTeach',{title:'select the course',objCourse:course})
  });
})

//post request
app.post("/choose-course-toTeach/:id", (req, res) => {
  let IDCourse = new mongoose.Types.ObjectId(req.params.id);
  ProfCourse.find({ profID: InstanceUser._id, courseID: IDCourse }).then(
    (selectedCourseToTeach) => {
      if (selectedCourseToTeach.length == 0) {
        const newProfCourse = new ProfCourse({
          profID: InstanceUser._id,
          courseID: IDCourse,
        });
        console.log(newProfCourse);
        newProfCourse.save().then((result) => {
          res.send(`course selected successfully to teach`);
        });
      }
    }
  );
});

//controller path/request to put the course degree
//get request

app.get('/set-degree', (req, res) => {
  console.log('InstanceUser :>> ', InstanceUser);
  Course.find({level:InstanceUser.level}).then((course) => {
    res.render('courses-degree',{title:"",allCourses:course})
  })
})

app.get("/set-degree-toStudents-inCourse/:id", (req, res) => {
  Course.findById(req.params.id).then((courseFound) => { //courseFound will use to display the course data in res.render
    StudentCourse.find({courseID: courseFound._id}).then(async (result) => {
      let AllStudent = [];
      for (let i = 0; i < result.length; i++) {
        let sc = result[i]; //sc = students course array which store course id and student id
        console.log(sc);
        let studentsFound = await User.findOne(sc.studendID);
        AllStudent.push(studentsFound);
      }
      console.log(AllStudent);
      res.render("stu-enrolled", {Students: AllStudent,title:"",course:courseFound});
    });
  });
});

app.get('/set-degree/:idstudent/:idcourse', (req, res) => {
  User.findById(req.params.idstudent).then((student)=>{
    Course.findById(req.params.idcourse).then((course)=>{
      res.render('set-degree',{title:"",student:student , course:course})
    });
  });
});

//post request
app.post('/set-degree/:idstudent/:idcourse', function (req, res) {
  let degree = req.body.degree;
  //find all courses's level == controller's level (courses model was filtered with level and department )
  StudentDegree.findOneAndUpdate({studendID:req.params.idstudent,courseID:req.params.idcourse},{degree:degree}).then((result)=>{
    res.redirect('/set-degree')
  })
  //find all student who enrolled in this courses (studentCourses model)
  //find student and update/set his degree
})

//delete requests

//drop the course was already enrolled
app.delete('/studentCourse/:idStudentCourse', function(req, res) {
  StudentCourse.findOneAndDelete({courseID:req.params.idStudentCourse,studendID:InstanceUser._id}).then((result)=>{
    StudentDegree.findOneAndDelete({courseID:req.params.idStudentCourse,studendID:InstanceUser._id}).then((result)=>{
      res.json({ myLink: "/select-course" })
    })
  })
});

//delete student 
app.get('/delete-student', (req, res) => {
  User.find({type:"student"}).then((student)=>{
    res.render('delete-student',{title:"delete student",arrStudent:student})
  })
})

app.get('/delete-student/:idstudent', (req, res) => {
  User.findById(req.params.idstudent).then((student)=>{
    res.render('confirm-delete-student',{title:"delete student",objStudent:student})
  })
})

app.delete('/student/:idStudent', function(req, res) {
  User.findByIdAndDelete(req.params.idStudent).then((result)=>{
    res.json({ myLink: "/manage-user" })
  })
});