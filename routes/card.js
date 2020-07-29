const {Router} = require('express');
const Test = require('../models/test');
const auth = require('../middleware/auth');
const router = Router();

router.post('/add', auth, async (req, res) => {
    const test = await Test.findById(req.body.id);
    await req.user.addToCart(test);
    res.redirect('/card');
});

function mapCartItems(cart) {
    return cart.items.map(c => ({
        ...c.testId._doc, 
        count: c.count,
        id: c.testId.id,
    }));
}

function computePrice(tests) {
    return tests.reduce((total, test) => {
        return total += test.price * test.count;
    }, 0);
}

router.get('/', auth, async (req, res) => {
    
    const user = await req.user.populate('cart.items.testId').execPopulate();

    const tests = mapCartItems(user.cart);

    res.render('card', {
        title: 'Корзина',
        isCard: true,
        tests: tests,
        price: computePrice(tests),
    });

});

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user.populate('cart.items.testId').execPopulate();

    const tests = mapCartItems(user.cart)
    const cart = {
        tests,
        price: computePrice(tests),
    }

    res.status(200).json(cart);
});

module.exports = router;