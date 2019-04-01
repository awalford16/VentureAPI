const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const host = require('../middleware/host');
const {Event, validate} = require('../models/event');
const _ = require('lodash');
const moment = require('moment');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const events = await Event.find().sort('--date');
    res.send(events);
});

router.get('/:id', validateObjectId, async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).send(`No event found with the id: ${req.params.id}`);

    res.send(_.pick(event, ['_id', 'title', 'date']));
});

router.post('/', [auth, host], async (req, res) => {
    const dateDiff = moment().diff(req.body.date, 'days');
    if (dateDiff > 0) return res.status(400).send('Invalid date.');

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const event = new Event(req.body);
    await event.save();
    res.send(event);
});

router.put('/:id', [validateObjectId, auth, host], async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const event = await Event.findOneAndUpdate({ _id: req.params.id, hostId: req.user._id }, req.body, {new: true});
    if (!event) return res.status(404).send('Could not find event created by this host.');
    res.send(event);

});

router.delete('/:id', [validateObjectId, auth, host], async (req, res) => {
    const event = await Event.findOneAndDelete({ _id: req.params.id, hostId: req.user._id });
    if (!event) return res.status(404).send('Could not find event created by this host.');
    res.send(event);
});

module.exports = router;