const express = require('express')

const app = express()

function calculatesum(value){
    let sum = 0
    for(let i = value; i > 0; i--){       // 5 = 5 + 4 + 3 + 2 + 1
       sum += i
    }
    return sum
}


app.get('/calculatesum',(req,res)=>{
    const value = parseInt(req.query.counter)
    const calculatedsum = calculatesum(value)
    res.json({
        sum: calculatedsum
    })
})

app.listen(3000,(req,res)=>{
    console.log("Server started at port 3000")
})
