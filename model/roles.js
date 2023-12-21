const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true,
      },
    accessModules: [{ 
        type: String 
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    active: {
        type: Boolean,
        default: true,
      },
}, { versionKey: false })

const Role = mongoose.model('Role', roleSchema);

module.exports = {
    Role
}