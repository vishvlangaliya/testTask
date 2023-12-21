const jwt = require('jsonwebtoken');
const config = require('../config/config.json');
const multer = require('multer');
const user_details = require('../model/user_details').userDetailHolder;

const routeMiddleWares = async (req, res, next) => {
    const bearerHeader = req.headers['x-access-token'] || req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        return jwt.verify(token, config.secret_key, async (err, userData) => {
            if (err) {
                res.sendForbidden(err.toString());
            }
            else {
                const users = await user_details.find({ email: userData.email, is_deleted: false })
                if (users.length) {
                    req.user = userData;
                    next();
                }
                else {
                    res.sendForbidden("User not available");
                }
            }
        })
    }
    else {
        res.sendUnAuthorized("token missing")
    }
}

const backupMiddleWares = async (req, res, next) => {
    const bearerHeader = req.headers['backup-token'];
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader
        if (process.env.BACKUP_TOKEN === token) next();
        else res.sendForbidden("backup token not match");
    }
    else {
        res.sendUnAuthorized("backup token missing")
    }
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`);
    }
});

const imageSaveMiddleware = multer({ storage: storage }).single('image')

const validation = (userValidator) => {
    return (req, res, next) => {
        const { error } = userValidator(req.body)
        if (error) {
            return res.status(400).send(error.details[0].message)
        }
        next()

    }
}

module.exports = {
    routeMiddleWares: routeMiddleWares,
    backupMiddleWares: backupMiddleWares,
    imageSaveMiddleware: imageSaveMiddleware,
    validation: validation
}