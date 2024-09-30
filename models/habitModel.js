const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    dates: [
        {
            date: String,
            complete: {
                type: String,
                enum: ['yes', 'no', 'none'],
                default: 'none'
            }
        }
    ],
    streak: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;
