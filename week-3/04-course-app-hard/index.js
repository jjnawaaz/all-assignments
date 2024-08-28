const express = require('express');
const app = express();
require('dotenv').config()
app.use(express.json());





const  MongoURI = process.env.MongoURI

// DB Connection
const mongoose  = require('mongoose')
main().catch(err => console.log(err))

async function main(){
  await mongoose.connect(MongoURI)
  console.log('Connected to MongoDB')
}


// Admin Model
const AdminSchema = new mongoose.Schema({
  firstaname : String,
  lastname: String,
  email: String,
  password: String
})

// Initializing the ADMINS collection
const ADMINS = mongoose.model('ADMINS',AdminSchema)


// User Model
const UserSchema = new mongoose.Schema({
  firstname : String,
  lastname: String,
  email: String,
  password: String,
  purchasedCourses: {type: [], default: []}
})

// Intializing the USERS Connection
const USERS = mongoose.model('USERS',UserSchema)



// Making the Courses Model 
const CoursesSchema = new mongoose.Schema({
  coursename: String,
  price: String,
  category: String
})

// Initializing the Courses Collections
const COURSES = mongoose.model('COURSES',CoursesSchema)

// Admin Authentication 
async function adminAuthentication(req,res,next){
  const { email , password } = req.headers
  if(!email || !password) return res.status(403).json({
    message: "Please Enter both email and password"
  })
  const user = await ADMINS.findOne({email: email})
  if(user && user.password === password){
    next();
  } else if(!user) {
    res.status(403).json({
      message: "User doesnt exists"
    })
  } else {
    res.status(403).json({
      message: "Invalid credentials"
    })
  }
}

//User Authentication

async function userAuthentication(req,res,next){
  const {email, password }= req.headers
  if(!email || !password) return res.status(403).json({
    message: "Please Enter email and password"
  })
  const user = await USERS.findOne({email: email})
  if(user && user.password === password){
    next()
  } else if(!user){
    res.status(403).json({
      message: "User doesnt exist"
    })
  } else {
    res.status(403).json({
      message: 'Invalid Credentials'
    })
  }
}






// Admin routes
app.post('/admin/signup', async (req, res) => {
  // logic to sign up admin
  const data = req.body
  const { firstname, lastname, email, password} = data
  if(!firstname || !lastname || !email || !password) return res.status(403).json({
    message: "Please enter all fields to register"
  })
  const signupData = new ADMINS({firstname: firstname, lastname: lastname, email: email, password: password})
  const findUser = await ADMINS.findOne({email: email})
  if(findUser) return res.status(403).json({message:"Admin already exists"})
  await signupData.save()
  res.status(200).json({
    message: "Successfully signed up",
    Admin: {
      firstname: firstname,
      lastname: lastname,
      email: email
    }
  })
});

app.post('/admin/login',adminAuthentication, (req, res) => {
  // logic to log in admin
  res.status(200).json({
    message: "Logged In successfully"
  })
});

app.post('/admin/courses',adminAuthentication, async (req, res) => {
  // logic to create a course
  const data = req.body
  const { coursename, price, category} = data
  if(!coursename || !price || !category) return res.status(403).json({
    message: "Please Enter all the course details in this format coursename: price: category:"
  })
  
  const Course = new COURSES({coursename: coursename, price: price, category: category})
  await Course.save()
  res.status(200).json({
    message: " Added Course Successfully"
  })
});

app.put('/admin/courses/:courseId', async (req, res) => {
  // logic to edit a course
  let id = req.params.courseId
  let {coursename, price, category } = req.body
  if(!coursename || !price || !category) return res.status(403).json({
    message: "Please Enter Course fields in this format coursename: ,price: ,category: "
  })
  let courses = await COURSES.findByIdAndUpdate({_id: id}, {
    coursename: coursename,
    price: price,
    category: category
  },{new: true})    // You can also use {returnDocument: "after"} instead of {new: true}
    res.status(200).json({
    message: "Updated Successfully",
    course : courses
  })
});

app.get('/admin/courses',adminAuthentication,async (req, res) => {
  // logic to get all courses
 try {
  let courses = await COURSES.find()
  res.status(200).json(courses)
 } catch(err){
  res.status(403).json(err)
 }
});

// User routes
app.post('/users/signup', async(req, res) => {
  // logic to sign up user
  const {firstname, email, password, lastname } = req.body
  if(!firstname || !lastname || !email ||!password) return res.status(403).json({
    message: "Please Enter all fields to sign up in this format firstname: , lastname: , email: ,password: "
  })
 try{
  const User = new USERS({firstname: firstname, lastname: lastname, email: email, password: password})
  const findUser = await USERS.findOne({email: email})
  if(findUser) return res.status(403).json({message:"User already exists"})
  await User.save()
  res.status(200).json({
    message: "Successfully Signed Up",
    user: {
      firstname: firstname,
      lastname: lastname,
      email: email
    }
  })
 } catch(err){
  res.status(500).json({
    message: "Server Error",
    Error: err
  })
 }

});

app.post('/users/login',userAuthentication, (req, res) => {
  // logic to log in user
  res.status(200).json({
    message: "Successfully Signed In"
  })
});

app.get('/users/courses',userAuthentication, async (req, res) => {
  // logic to list all courses
  let courses = await COURSES.find()
  res.status(200).json({
    message: "List of all courses",
    Courses: courses
  })
});

app.post('/users/courses/:courseId',userAuthentication, async (req, res) => {
  // logic to purchase a course
  const price = req.body.price

  let courseId = req.params.courseId
  let courseDetails = await COURSES.findOne({_id: courseId})
  if(price === courseDetails.price){
    let useremail = req.headers.email
    let user = await USERS.findOne({email: useremail},{new: true})
    user = await USERS.findByIdAndUpdate({_id: user._id},{$push: {purchasedCourses: {coursename: courseDetails.coursename, category: courseDetails.category}}},{new: true})
    await user.save()
    res.status(200).json({message : "purchasedCourses",user: user})
  } else {
    res.status(200).json({message : "payment failed"})
  }
});

app.get('/users/purchasedCourses',userAuthentication, async (req, res) => {
  // logic to view purchased courses
  let user = req.headers.email

  user = await USERS.findOne({email: user})
 
  if(user && user.purchasedCourses.length > 0){
    res.status(200).json({
      message: "All the purchased Courses",
      courses: user.purchasedCourses 
    })
  } else{
    res.status(200).json({
      message: "No purchases"
    })
  } 
  

});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
