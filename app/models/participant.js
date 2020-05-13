var mongoose = require('mongoose');

var participantSchema = new mongoose.Schema({
    event_id: {
        type: String,
        required: true
    },
    user_id: {
        type: String
    },
    join_leave_flag: {
        type: String,
    },
    join_date: {
        type: Date
    },
    updated_date: {
        type: Date,
    }
});

// Table details
module.exports = mongoose.model("participants", participantSchema);