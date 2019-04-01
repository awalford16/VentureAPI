module.exports = function(req, res, next) {
    if (!req.user.isHost) return res.status(403).send('User does not have host privileges.');

    next();
}