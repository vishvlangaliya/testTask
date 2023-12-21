const mongoose = require("mongoose");
const Joi = require('joi');
const bcrypt = require('bcrypt');

const user_details = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    last_name: {
        type: mongoose.Schema.Types.String,
        required: true

    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    },
    is_deleted: {
        type: mongoose.Schema.Types.Boolean,
        default: false
    },
}, { versionKey: false })

user_details.pre("save", async function (next) {

    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    }
    catch (error) {
        return next(error);
    }
}, { versionKey: false })

const userDetailHolder = mongoose.model('user_details', user_details);

const validateUser = (user_details) => {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
    })
    return schema.validate(user_details)
}

module.exports = {
    userDetailHolder,
    validateUser
}