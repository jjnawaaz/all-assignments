const express = require('express')
const app = express()
const cors = require('cors')
app.use(express.json())
const fs = require('fs')
app.use(cors())



// JSON.parse() ==== To parse the string data to json
// JSON.stringyfy() ===== to change data from json to string



// Getting all the TODOS from the files 

app.get('/todos',(req,res)=>{
    fs.readFile('todos.json','utf-8',(err,data)=>{
        if(err){
            return res.status(403).json({
                message: "Error while sending message",
                error : err
            })
        } else {
            res.status(200).json(JSON.parse(data))
        }
    })
})

// Creating a TODO 


var ctr = 1 // unique ids for todos


app.post('/todos',(req,res)=>{
    let newTodo = req.body
    const {title,completed,description} = newTodo
    if(!title || !description || !completed) return res.status(403).json({message:"Please Send Todos Data"})
        fs.readFile('todos.json','utf-8',(err,data)=>{
        let todos = JSON.parse(data)   // parsing the todo from readfile
        const maxId = todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) : 0;
        const newId = maxId + 1;
        
        if(err){
           return res.status(403).json({
                message: "Error while reading todo file",
                error : err
            })
        } else {
            
            
            todos.push({
                id: newId,
                title: title,
                completed: completed,
                description: description
            })
        
            todos = JSON.stringify(todos)     // converting the todo back to string before writing 
            fs.writeFile('todos.json',todos,'utf-8',(err,data)=>{
                if(err){
                    return res.status(403).json({
                        message: "Error while writing todo file",
                        error : err
                    })
                } else {
                    ctr++
                    return res.status(200).json({
                        message: "Successfully added todo to the file",
                        todo: JSON.parse(todos)     // parsing again to display it in json format
                    })
                }
            })
        }
    })
})



// Delete a todo from the file 

app.delete('/todos/:id',(req,res)=>{
    const id = parseInt(req.params.id)
    
    fs.readFile('todos.json','utf-8',(err,data)=>{
        if(err){
            return res.status(403).json({
                 message: "Error while reading todo file",
                 error : err
             })
         } else {
            let todos = JSON.parse(data)
            const index = todos.findIndex(obj => obj.id === id)
            if(index >= 0  && index < todos.length){
                todos.splice(index,1)
                todos = JSON.stringify(todos)
                
                fs.writeFile('todos.json',todos,'utf-8',(err,data)=>{
                    if(err){
                        return res.status(403).json({
                            message: "Error while writing todo file",
                            error : err
                        })
                    } else {
                        return res.status(200).json({
                            message: "Successfully deleted todo to the file",
                            todo: JSON.parse(todos)     // parsing again to display it in json format
                        })
                    }
                })
            } else {
                return res.status(403).json({
                    error: "Couldnt find todo with id"
                })
            }
         }
})
})





app.listen(3000,(req,res)=>{
    console.log("Server Started at port 3000")
})