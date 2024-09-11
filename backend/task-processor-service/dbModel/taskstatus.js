const mongoose = require('mongoose')

const taskStatusSchema  = new mongoose.Schema({

    taskId: mongoose.Schema.Types.ObjectId,
    name: String,
    status: { type: String, default: 'Pending' },
    processedAt: { type: Date }
})


module.exports = mongoose.model("TaskStatus" , taskStatusSchema)