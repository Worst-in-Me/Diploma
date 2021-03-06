const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');


const userSchema = new Schema({
    email: String,
    username: String,
    password: String,
    token: String
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});
userSchema.methods.comparePassword = async function(data) {
    return bcrypt.compare(data.password, this.password);
}

const User = mongoose.model('user', userSchema);
module.exports = User;

module.exports.hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (e) {
        throw new Error('Hashing failed', error);
    }
};