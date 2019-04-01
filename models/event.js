const Joi = require('joi');
const mongoose = require('mongoose');
const { userSchema } = require('./user');

const eventTypes = ['Any', 'Beauty', 'Charity', 'Family', 'Food and Drink', 'Free', 'Sport', 'Travel'];

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200
    },
    hostId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    tags: {
        type: [String],
        default: ['Any']
    },
    date: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        default: 0.00
    },
    location: {
        type: String,
        minlength: 0,
        maxlength: 100, 
        required: true
    },
    members: {
        type: [mongoose.Types.objectId],
        default: []
    },
    created: {
        type: Date,
        default: Date.now
    }
});

const Event = mongoose.model('Event', eventSchema);

// Validate event object
function validateEvent(event)  {
    const schema = {
        title: Joi.string().min(5).max(50).required(),
        description: Joi.string().max(200),
        hostId: Joi.objectId().required(),
        tags: Joi.array().items(Joi.string().valid(eventTypes)),
        date: Joi.date().iso().min('now').required(),
        price: Joi.number().min(0),
        location: Joi.string().min(3).max(100),
        members: Joi.array().items(Joi.objectId()),
        created: Joi.date().iso().max('now')
    };
    return Joi.validate(event, schema);
}

exports.Event = Event;
exports.eventSchema = eventSchema; 
exports.validate = validateEvent;