const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
        firstname: String,
        lastname: String,
        username: String,
        password: String,
        created_on: {
            type: Date,
            default: Date.now
        },
        deleted_on: Date,
        ip_last_logged_in: String,
        last_logged_in_date: Date
    },
    {usePushEach: true}
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
