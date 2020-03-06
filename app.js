const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const indexRoutes = require('./routes/index');


//require('./config/passport');

const PORT = process.env.PORT || 3000;

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'codeworksecret',
    saveUninitialized: false,
    resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success');
    res.locals.error_messages = req.flash('error');
    next();
});

app.use(indexRoutes);
app.use('/users', require('./routes/users'));

async function start() {
    try {
        await mongoose.connect(
            'mongodb+srv://pepegasurfer:1q2w3e4r@cluster0-ibw75.mongodb.net/sniper', 
            {
                useNewUrlParser: true,
                useFindAndModify: false,
                useUnifiedTopology: true
            }
        );
        app.listen(PORT, () => {
            console.log(`Server has been started in ${PORT} port`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();