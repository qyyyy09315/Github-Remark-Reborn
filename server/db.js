const mongoose = require('mongoose');

const DB_URL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/github';

mongoose.set('strictQuery', false);

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Mongoose connection open to ' + DB_URL);
}).catch((err) => {
    console.error('Mongoose connection error: ' + err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection disconnected');
});

const RemarkSchema = new mongoose.Schema({
    token: { type: String, required: true, index: true },
    username: { type: String, required: true, index: true },
    remark: { type: String, default: '' },
    update_date: { type: Date, default: Date.now }
});

RemarkSchema.index({ token: 1, username: 1 }, { unique: true });

const Remark = mongoose.model('Remark', RemarkSchema);

const DbOpt = {
    async updateRemark(token, username, remark) {
        if (!token || !username) return null;
        const condition = { token: String(token).trim(), username: String(username).trim().toLowerCase() };
        const update = { remark: String(remark || '').trim(), update_date: new Date() };
        return Remark.findOneAndUpdate(condition, update, { upsert: true, new: true }).exec();
    },

    async getRemark(token, username) {
        if (!token || !username) return null;
        const query = { token: String(token).trim(), username: String(username).trim().toLowerCase() };
        return Remark.findOne(query).exec();
    },

    async getAllRemarks(token) {
        if (!token) return [];
        return Remark.find({ token: String(token).trim() }).exec();
    }
};

module.exports = DbOpt;
