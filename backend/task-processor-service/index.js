const express = require('express')
const mongoose = require('mongoose')
const amqp = require('amqplib/callback_api')
const app = express()
const TaskStatus = require('./dbModel/taskstatus')

// MongoDB connection
async function connectDb(){
    try{
        let data=await mongoose.connect('mongodb://mongodb:27017/task-processor-service', {});
        console.log("MONGODB CONNECTED")
    }catch(error){
        console.log(error)
        throw error
    }
    
}
connectDb()
// Variables for RabbitMQ connection and channel
let channel = null;

// RabbitMQ connection setup (only once)
amqp.connect("amqp://guest:guest@rabbitmq:5672", (error0, connection) => {
    if (error0) {
        throw error0;
    }
    console.log("Connected to RabbitMQ");

    // Create a channel
    connection.createChannel((error1, ch) => {
        if (error1) {
            throw error1;
        }
        channel = ch;

        // Define task and result queues
        const taskQueue = 'task_queue';
        const resultQueue = 'result_q';

        // Assert task and result queues
        channel.assertQueue(taskQueue, { durable: false });
        channel.assertQueue(resultQueue, { durable: false });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", taskQueue);

        // Listen on the task_queue for messages
        channel.consume(taskQueue, async (msg) => {
            const taskData = JSON.parse(msg.content.toString());
            console.log(" [x] Received %s", taskData.name);

            const statusTask = new TaskStatus({
                taskId: taskData.taskId,
                name: taskData.name,
                status: 'completed',
                processedAt: new Date()
            });

            await statusTask.save();
            console.log("Task processed and saved:", statusTask);

            // Send the processed result back to the result queue
            const resultMsg = JSON.stringify(statusTask);
            channel.sendToQueue(resultQueue, Buffer.from(resultMsg));

        }, { noAck: true });
    });
});

// Route to get all tasks
app.get('/tasks', async (req, res) => {
    const task = await TaskStatus.find().sort({ processedAt: -1 });
    res.send(task);
});

// Route to delete a task (uses the same channel)
app.delete('/deletetask/:taskId', async (req, res) => {
    const { taskId } = req.params;

    if (!channel) {
        return res.status(500).json({ message: "RabbitMQ connection not ready" });
    }

    const deleteQueue = 'delete_queue';
    const deleteMsg = JSON.stringify({ taskId: taskId });
    console.log("Delete message:", deleteMsg);

    // Assert the delete queue and send the delete message
    channel.assertQueue(deleteQueue, { durable: false });
    channel.sendToQueue(deleteQueue, Buffer.from(deleteMsg));
    console.log(" [x] Sent delete request for taskId %s", taskId);
    await TaskStatus.deleteOne({taskId})

    const updatedTasks = await TaskStatus.find();

    res.status(200).json({ message: "Task delete request sent",tasks:updatedTasks });
});

// Start the server
app.listen(3002, () => {
    console.log("Task processor service running on port 3002");
});
