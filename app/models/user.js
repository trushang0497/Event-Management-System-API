var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String
    },
    email_address: {
        type: String,
    },
    contact_number: {
        type: String
    },
    password: {
        type: String,
    },
    date_of_birth: {
        type: Date,
    },
    gender: {
        type: String,
    },
    created_date: {
        type: Date,
    },
    updated_date: {
        type: Date,
        require: false
    },
    created_by: {
        type: String,
    },
    updated_by: {
        type: String,
    },
});

// Table details
module.exports = mongoose.model("users", userSchema);