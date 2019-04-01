module.exports = function(req, res, next) {
    if (req.user.id != req.params.id) {
        if (!req.user.isAdmin) return res.status(403).send('The user does not have the permissions to perform this task.');
    }
    
    next()
}