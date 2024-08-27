const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];


function adminAuthentication(req,res, next){
  let {email,password} = req.headers
  
  if(!email || !password) return res.status(400).json({
    message: "Error enter all header fields"
  })
  ADMINS.forEach((item)=>{
    if(item.email === email && item.password === password){
      next();
    } else {
      res.status(400).json({
        message: "Error please check the credentials"
      })
    }
  })
}

function userAuthentication(req,res,next){
  let {email,password} = req.headers
  if(!email || !password) return res.status(403).json({
    message: "Please enter both email and password "
  })
  let found = USERS.find((item)=>item.email === email && item.password === password)
  if(found){
    next()
  } else {
    res.status(403).json({
      message: "Invalid Credentials"
    })
  }
}




// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const data = req.body
  const {firstname,lastname,email,password} = data
  if(!firstname || !lastname || !email || !password) return res.status(400).json({
    message: "Error occured please send all the fields to sign up"
  })
  ADMINS.forEach((item)=>{
    if(item.email == email){
      return res.status(400).json({
        message: " Error Admin Already Exists "
      })
    }
  })

  ADMINS.push(data)

  return res.status(200).json({
    message: "Admin Successfully Created",
    data: data
  })
});

app.post('/admin/login', adminAuthentication,(req, res) => {
  // logic to log in admin
  return res.status(200).json({
    message: "User Logged in successfully"
  })
});

app.post('/admin/courses', adminAuthentication,(req, res) => {
  // logic to create a course
  const data = req.body
  const { coursename, domain } = data
  if(!coursename || !domain) return res.status(400).json({
    message: "Please Enter both coursename and domain "
  })
  COURSES.push(data)
  return res.status(200).json({
    message: "Created Course successfully",
    course: data
  })


});

app.put('/admin/courses/:courseId', adminAuthentication,(req, res) => {
  // logic to edit a course
  let courseId = req.params.courseId
  let data = req.body
  let {coursename, domain} = data
  if(coursename && domain){
    let index = COURSES.findIndex((item,index) => item.coursename === courseId)
    
    if(index != -1){
      COURSES[index] = data
      res.status(200).json({
        message: "Updated Course Successfully",
        course : data
      })    
    } else {
      res.status(400).json({
        message: "Error no course found with the coursename"
      })
    }
  } else {
    res.status(400).json({
      message: "Please Enter CourseName and domain to Update"
    })
  }
  
});

app.get('/admin/courses',adminAuthentication, (req, res) => {
  // logic to get all courses
 
  res.status(200).json({
    message:"Succesfully fetched all the courses",
    courses : COURSES
  })
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const data = req.body
  let { firstname, lastname , email, password, purchasedCourses = [] } = data
  data.purchasedCourses = purchasedCourses
  
  if(!firstname || !lastname || !email || !password) return res.status(403).json({
    message: "Error please Enter all fields to sign up"
  })

  let searchuser = USERS.find((item)=> item.email == email)
  if(searchuser) return res.status(403).json({message: "User already exists"})
  USERS.push(data)
  return res.status(200).json({
    message: "Successfully Signed up as user",
    user: {firstname: firstname,lastname: lastname,email: email}
  })
});

app.post('/users/login', userAuthentication,(req, res) => {
  // logic to log in user
  res.status(200).json({
    message: "Successfully Logged In"
  })
});

app.get('/users/courses',userAuthentication, (req, res) => {
  // logic to list all courses
  res.status(200).json({
    message: "List of Courses",
    courses : COURSES
  })
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
  let courseId = req.params.courseId  // in this context we consider course name 
  let user = req.headers.email
  let coursedata = COURSES.find((item)=>item.coursename === courseId)
  if(coursedata){
  let user1 = USERS.findIndex((item,index)=> item.email === user)
  if(user1 != -1){
      let userObj = USERS[user1]
      userObj.purchasedCourses.push(courseId)
      return res.status(200).json({
        message: "Succesfully Purchased the course",
        purchasedCourses: userObj.purchasedCourses
      })
    }
  }

  return res.status(403).json({
    message: "Failed to purchase the course make sure the course is valid"
  })

});

app.get('/users/purchasedCourses',userAuthentication, (req, res) => {
  // logic to view purchased courses
  let user = req.headers.email
  let foundUser = USERS.findIndex((item)=> item.email === user)
  if(foundUser != -1){
    let purchasedCourses = USERS[foundUser].purchasedCourses
    return res.status(200).json({
      message: "Successfully fetched all the coursed purchased",
      courses: purchasedCourses
    })
  }

  return res.status(400).json({
    message: "Error while loading purchase courses "
  })

});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
