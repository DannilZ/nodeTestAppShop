const {Schema, model} = require('mongoose');


const testSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    img: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
});


testSchema.method('toClient', function () {
    const test = this.toObject();
    test.id = this._id;
    delete test._id;

    return test;
});

module.exports = model('Test', testSchema);