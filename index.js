const express = require('express');
const path = require('path');
const expressHandlebars = require('express-handlebars');
const Handlebars = require('handlebars')
const mongoose = require('mongoose');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const session = require('express-session');
const varMiddleware = require('./middleware/variables');
const MongoStore = require('connect-mongodb-session')(session);
const userMiddleware = require('./middleware/user');
const csrf = require('csurf');
const flash = require('connect-flash');
const errorHendler = require('./middleware/error');
const fileMiddleware = require('./middleware/file')
const helmet = require('helmet')
const compression = require('compression')

const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const testsRoutes = require('./routes/tests');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const authRouter = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const keys = require('./keys');



const app = express();


  
app.engine('hbs', expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbshelpers'),
}));


const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URL,
})

app.set('view engine', 'hbs');
app.set('views', 'html');


app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: keys.Session_Secret,
    resave: false,
    saveUninitialized: false,
    store,
}));
app.use(fileMiddleware.single('avatar'))
app.use(csrf());
app.use(flash());
app.use(helmet());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

app.use( '/', homeRoutes);
app.use('/add', addRoutes);
app.use('/tests', testsRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRouter);
app.use('/profile', profileRoutes);
app.use(errorHendler);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        const url = keys.MONGODB_URL;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        app.listen(PORT, () => {
            console.log('server start... ', PORT);
        });

    } catch(err) {
        console.log(err);
    }

}   

start();

const password = 'cPFJeUM6qr8aaUaP'; //password mongoDB

