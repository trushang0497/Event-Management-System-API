var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
    },
    place: {
        type: String
    },
    paticipants: {
        type: String,
    },
    max_count: {
        type: String,
    },
    event_created_by: {
        type: String,
    },
    created_date: {
        type: Date,
    }
});

// Table details
module.exports = mongoose.model("events", eventSchema);