const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    isHost: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        unique: true,
        required: true,
        minlength: 10,
        maxlength: 75
    }, 
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 100
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id, isHost: this.isHost, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model('User', userSchema);

// Validate User object
function validateUser(user) {
    const schema = {
        name: Joi.string().min(2).max(50).required(),
        isHost: Joi.boolean().default(false),
        email: Joi.string().min(10).max(75).required().email(),
        password: Joi.string().min(6).max(100).required(),
        isAdmin: Joi.boolean().default(false)
    }
    return Joi.validate(user, schema);
}

exports.userSchema = userSchema;
exports.User = User;
exports.validate = validateUser;