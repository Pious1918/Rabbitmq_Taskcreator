const express = require('express')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const amqp = require('amqplib/callback_api')
const Task = require('./DbModel/taskModel')
const app = express()
app.use(bodyparser.json())
async function connectDb(){
    try{
        let data=await mongoose.connect('mongodb://mongodb:27017/task-creator-service', {});
        console.log("MONGODB CONNECTED")
    }catch(error){
        console.log(error)
        throw error
    }
    
}
connectDb()

amqp.connect("amqp://guest:guest@rabbitmq:5672", (error0, connection) => {
    if (error0) {
        console.error("Failed to connect to RabbitMQ:", error0.message);

        throw error0;
    }

    console.log("Connected to RabbitMQ");
    connection.createChannel((error1, channel) => {
        
        if (error1) {
            console.log("ima herere")
            // process.exitCode(0)
            throw error1;
        }

        const deleteQueue = 'delete_queue';
        channel.assertQueue(deleteQueue, { durable: false });
        console.log(" [*] Waiting for delete requests in %s. To exit press CTRL+C", deleteQueue);

        channel.consume(deleteQueue, async (msg) => {
            const taskData = JSON.parse(msg.content.toString());
            console.log(" [x] Received delete request for taskId %s", taskData.taskId);

            await Task.deleteOne({ _id: taskData.taskId });
            console.log("Task deleted from database:", taskData.taskId);
        }, { noAck: true });
    });
});

app.post('/create-task' , async(req,res)=>{
    console.log("haiii")
    const task = new Task({name:req.body.name})
    await task.save()

    //after saving task , the service connects to rabbitMQ

    // a new channel is created and a message containing teh task's id and name is sent to task_queue

    /// connection to rabbitmq is closed after a short delay

    amqp.connect("amqp://rabbitmq:5672" ,(error0 ,connection)=>{

        if(error0){
            throw error0
        }
        console.log("aadfd connected")

        connection.createChannel((error1,channel)=>{
            if(error1){
                throw error1
            }

            const queue = 'task_queue';
            const resultq = 'result_q'

            const msg = JSON.stringify({taskId:task._id , name :task.name})

            channel.assertQueue(queue , {
                durable:false
            });

            channel.assertQueue(resultq , {
                durable:false
            })

            channel.sendToQueue(queue , Buffer.from(msg))
            console.log("[x] sent %s",msg)


            channel.consume(resultq, (msg)=>{
                const result = JSON.parse(msg.content.toString())
                if(result.taskId===task._id.toString()){
                    res.status(200).send(result)
                    connection.close()
                }
            })





        })

        // setTimeout(()=>{
        //     connection.close()
        // },500)
    })

    // res.status(201).send(task)
}) 






app.listen(3001,()=>{
    console.log("task creator service running on port 3001")
})