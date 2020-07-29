const {Schema, model} = require('mongoose');
const { count } = require('./test');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    name: String,
    password: {
        type: String,
        required: true,
    },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                testId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Test',
                    required: true,
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function(test) {
    const items = [...this.cart.items];
    const index = items.findIndex(c => {
        return c.testId.toString() === test._id.toString();
    });

    if(index >= 0) {
        items[index].count = items[index].count + 1;
    } else {
        items.push({
            count: 1,
            testId: test._id,
        });
    }

    this.cart = {items};

    return this.save();
};

userSchema.methods.removeFromCart = function(id) {
    let items = [...this.cart.items];
    const index = items.findIndex(c => {
        return c.testId.toString() === id.toString();
    });

    if (items[index].count === 1) {
        items = items.filter(c => c.testId.toString() !== id.toString());
    } else {
        items[index].count--;
    }

    this.cart = {items};
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
     return this.save();
}

module.exports = model('User', userSchema);