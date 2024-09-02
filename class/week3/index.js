const express = require('express')
const app = express()
const colors = require('colors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config()
app.use(express.json())

// DB CONNECTIONS 
main().catch(err => console.log(err))

async function main(){
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Connected'.bgGreen)
}

//Creating jwt token  
function generateJWT(data){
    try{
       return jwt.sign(data,process.env.JWT_SECRET)
    }catch(err){
       console.log(err)
    }
}

async function verifyJWT(req,res,next){
   try{
        let token = req.headers.token
        let user = jwt.verify(token,process.env.JWT_SECRET)
        let isExist = await ADMINS.find({ username : user})
        if(isExist){
            next();
        } else {
            res.status(403).json({message: 'Invalid Token'})
        }
        
    }catch(err){
        res.status(403).json({message: 'Invalid Token'})
    }
}



//ADMIN SCHEMA
const adminSchema = mongoose.Schema({
    username: {type : String, required: true}, 
    password: {type: String, required : true}
})

const ADMINS = mongoose.model('ADMINS',adminSchema)

// USER SCHEMA 
const userSchema = mongoose.Schema({
    username: {type : String, required: true}, 
    password: {type: String, required : true},
    purchaseCourses: [{ type : mongoose.Types.ObjectId, ref: 'COURSES'}]
})

const USERS = mongoose.model('USERS',userSchema)


// COURSES SCHEMA
const coursesSchema = mongoose.Schema({
    title: {type : String, required: true}, 
    description: {type: String, required : true},
    price: {type: String, required: true}
})

const COURSES = mongoose.model('COURSES',coursesSchema)


// ADMIN ROUTES

// ADMIN SIGNUP 
app.post('/admin/signup',async (req,res)=>{
    let data = req.body
    if(!data.username || !data.password) return res.status(403).json({message: "Please enter email and password" })
    data.password = generateJWT(data.password)
    const admin = new ADMINS({username: data.username, password: data.password})
    await admin.save()
    return res.status(200).json({ message : 'Admin created '})
})


//ADMIN LOGIN

app.post('/admin/login', async(req,res)=>{
    let data = req.body
    if(!data.username || !data.password) return res.status(403).json({message: "Please Enter Email and Password"})
    data.password = generateJWT(data.password)
    let admin = await ADMINS.find({ username : data.username , password: data.password})
    let token = generateJWT(admin[0].username)
    return res.json({
        message: 'successfully logged in',
        token: token                           // Set this token in localstorage in frontend to use it to authenticate user
    })
})

// ADMIN COURSES ADD 


app.post('/admin/courses',verifyJWT,async(req,res)=>{
    try{
    
    const data = req.body
    if(!data.title || !data.description || !data.price) return res.status(403).json({message: 'Please enter the course details in the format title price description'})
    
    const course = new COURSES({title: data.title, description: data.description,price: data.price})

    await course.save();
    res.status(200).json({message: "Succesfully added course"})
    }catch(err){
    res.status(403).json({error : err})
    }
})


// ADMIN GET COURSES 

app.get('/admin/courses',verifyJWT,async(req,res)=>{
        let data = await COURSES.find()
        res.status(200).json({courses: data})
})








// USERS ROUTES

// USER SIGNUP


app.post('/users/signup',async (req,res)=>{
    let data = req.body
    if(!data.username || !data.password) return res.status(403).json({message: "Please enter email and password" })
    let isUser = await USERS.findOne({username : data.username})
    if(!isUser){
    data.password = generateJWT(data.password)
    const user = new USERS({username: data.username, password: data.password})
    await user.save()
    return res.status(200).json({ message : 'User created '})
    }else{
    res.status(403).json({message: "User already exists"})
    }
  
})



// USER LOGIN


app.post('/users/login', async(req,res)=>{
    let data = req.body
    if(!data.username || !data.password) return res.status(403).json({message: "Please Enter Email and Password"})
    data.password = generateJWT(data.password)
    let user = await USERS.find({ username : data.username , password: data.password})
    let tokengen = JSON.stringify(user[0]._id)
    let token = generateJWT(tokengen)
    return res.json({
        message: 'successfully logged in',
        token: token                           // Set this token in localstorage in frontend to use it to authenticate user
    })
})



// PURCHASE COURSES 

app.post('/users/courses/:id',verifyJWT,async(req,res)=>{
        let data = req.params.id
        let token = req.headers.token
        let paymentconfirmed = req.body.payment
        if(paymentconfirmed == true) {
            if(!data) return res.status(403).json({message: "Please Select the relevant course"})
                let userId = jwt.verify(token,process.env.JWT_SECRET)
                let id = JSON.parse(userId)
                if(userId){
                    let user = await USERS.findByIdAndUpdate(id,{$push: {purchaseCourses: data}},{new : true})
                     res.status(200).json({message: "purchased", user: user})
                   } else {
                    res.status(403).json({message: "USER DOESNT EXIST"})
        }
               
                
                
        } else {
            res.status(403).json({message: "Please do the payment first"})
        }
     
        
})

// USER COURSES 
app.get('/users/courses',async(req,res)=>{
    let id = req.headers.token

    let userId = jwt.verify(id,process.env.JWT_SECRET)
    userId = JSON.parse(userId)
    const user = await USERS.find({_id : userId})
    return res.status(200).json({
        message: "The list of purchased courses are: ",
        courses: user[0].purchaseCourses
    })

})


app.get('/',(req,res)=>{
    res.send("hello world")
})

app.listen(3000,(req,res)=>{
    console.log("Server Started on port 3000".bgWhite)
})