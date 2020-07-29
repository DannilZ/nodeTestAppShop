const {Router} = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const { rawListeners } = require('../models/user');
const {validationResult} = require('express-validator');
const {registerValidators} = require('../utils/validators');
const router = Router();

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.Sendgrid_API_key },
}));

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError'),
    })
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});


router.post('/login', registerValidators, async (req, res) => {
    try {
        const {email, password} = req.body;

        const condidate = await User.findOne({ email })

        if(condidate) {
            const isSame = await bcrypt.compare(password, condidate.password);

            if(isSame) {
                req.session.user = condidate;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if(err) {
                        throw err
                    } else {
                        res.redirect('/');
                    }
                });
            } else {
                req.flash('loginError', 'Неверный пароль');
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', 'Такого пользователя не существует');
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }
});

router.post('/register', registerValidators,  async (req, res) => {
    try {
        const {email, password, name} = req.body;
        
        
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register')
        }
       
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User ({
            email, name, password: hashPassword, cart: {items: []}
        });
        await user.save();
        res.redirect('/auth/login#login');
        await transporter.sendMail(regEmail(email));
        
    } catch (err) {
        console.log(err);
    }
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error'),
    });
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if(err) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже');
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');

            const condidate = await User.findOne({email: req.body.email});

            if(condidate) {
                condidate.resetToken = token;
                condidate.resetTokenExp = Date.now() + 3600 * 1000;
                await condidate.save();
                await transporter.sendMail(resetEmail(condidate.email, token));

                res.redirect('/auth/login');
            } else {
                req.flash('error', 'Такого email не существует');
                res.redirect('/auth/reset');
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/password/:token', async (req, res) => {
    if(!req.params.token) {
        return res.redirect('/auth/login');
    }

    try {

        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()},
        });

        if(!user) {
            return  res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
                title: 'Востановление пароля',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token,
            });
        }

    } catch (e) {
        console.log(e);
    }
});

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if(user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login');
            
        } else {
            req.flash('loginError', 'Время жизни токена истекло');
            res.redirect('/auth/login');
        }

    } catch (e) {
        console.log(e);
    }
});

module.exports = router;