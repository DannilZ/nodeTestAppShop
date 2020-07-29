const {Router} = require('express');
const Test = require('../models/test');
const auth = require('../middleware/auth');
const {validationResult} = require('express-validator');
const {testAddValidators} = require('../utils/validators');
const router = Router();

router.get('/', async (req, res) => {
    try {
        const tests = await Test.find().populate('userId', 'email name');
        res.render('tests', {
            title: 'Тесты',
            isTests: true,
            userId: req.user ? req.user._id.toString() : null,
            tests
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        res.render('test', {
            layout: 'empty',
            title:  test.title,
            test,
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id/edit', auth, async (req, res) => {
    if(!req.query.allow) {
       return res.redirect('/');
    } 

    try {
        const test = await Test.findById(req.params.id);

        if(test.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/tests');
        }

        res.render('testEdit', {
            title: `Редактировать ${test.title}`,
            test,
    });
    } catch (e) {
        console.log(e);
    }
});

router.post('/edit', auth, testAddValidators, async (req, res) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).redirect(`/tests/${id}/edit?allow=true`)
    }

    try {
        const {id} = req.body;
        delete req.body.id;
        const test = await Test.findById(id)

        if(test.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/tests');
        }

        Object.assign(test, req.body);
        await test.save()
        res.redirect('/tests');
    } catch (e) {
        console.log(e);
    }
});

router.post('/remove', auth, async (req, res) => {
    try {
        await Test.deleteOne({
            _id: req.body.id,
            userId: req.user._id,
        });
        res.redirect('/tests');
    } catch(err) {
        console.log(err);
    }

});

module.exports = router;