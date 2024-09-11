const express = require('express')
const cors = require('cors')
const bodyparser = require('body-parser')
const proxy = require('express-http-proxy')

const app =express()

app.use(bodyparser.json())
app.use(cors({

    origin:'http://localhost:4200'
}))


app.use('/task-creator', proxy('http://task-creator:3001'))
app.use('/task-processing', proxy('http://task-processor:3002'))

app.listen(3000,()=>{
    console.log("api gateway listening on port 3000")
})