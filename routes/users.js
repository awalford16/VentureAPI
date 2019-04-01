const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {User, validate} = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    user = new User(req.body);
    const salt = await bcrypt.genSalt(16); 
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

router.put('/:id', [auth, admin], async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    // Hash user password
    const salt = await bcrypt.genSalt(16); 
    await bcrypt.hash(req.body.password, salt)

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!user) return res.status(404).send('No user could be found with the given ID.');    

    res.send(_.pick(user, ['_id', 'name', 'email']));
});

router.delete('/:id', [auth, admin], async (req, res) => {
    const user = await User.findOneAndRemove({ _id: req.params.id });
    if (!user) return res.status(404).send('User does not exist.');

    res.send(user);
});

module.exports = router;