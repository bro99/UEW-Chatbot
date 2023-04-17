const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema(
    {
        utterances: {
            type: Array,
        },
        intent: {
            type: String,
        },
        answers: {
            type: Array,
        },
    }
)
module.exports = mongoose.model('Message', MessageSchema)