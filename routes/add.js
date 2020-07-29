const {Router} = require('express');
const Test = require('../models/test');
const auth = require('../middleware/auth');
const {validationResult} = require('express-validator');
const {testAddValidators} = require('../utils/validators');
const router = Router();

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Добавить тест',
        isAdd: true,
    });
});

router.post('/', auth, testAddValidators, async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('add', {
            title: 'Добавить тест',
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img,
            }
        });
    }

    const test = new Test({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        userId: req.user,
    });

    try {
        await test.save();
        res.redirect('/tests');
    } catch(err) {
        console.log(err)
    }
});

module.exports = router;