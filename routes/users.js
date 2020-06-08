const express = require('express');
const router = express.Router();
const Joi = require('joi');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const User = require('../models/user');


//validation schema

const registerSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    username: Joi.string().required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required(),
    confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
})

const loginSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required()
})

router.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post(async (req, res, next) => {
        try {
            const result = Joi.validate(req.body, registerSchema);
            if (result.error) {
                req.flash('error', 'Data entered is not valid. Please try again.');
                res.redirect('/users/register');
                return;
            }

            const user = await User.findOne({ 'email': result.value.email })
            if (user) {
                req.flash('error', 'Email is already in use.');
                res.redirect('/users/register');
                return;
            }

            const hash = await User.hashPassword(result.value.password);

            delete result.value.confirmationPassword;
            result.value.password = hash;

            const newUser = await new User(result.value);
            await newUser.save();

            req.flash('success', 'Registration successfully, go ahead and login.');
            res.redirect('/users/login');

        } catch (error) {
            next(error);
        }
    })

router.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post(async (req, res, next) => {
        try {
            const result = Joi.validate(req.body, loginSchema);
            if (result.error) {
                req.flash('error', 'Data entered is not valid. Please try again.');
                res.redirect('/users/login');
                return;
            }
            // const email = await User.findOne({ 'email': result.value.email }, (err, user) => {
            //     if (!email) {
            //         req.flash('error', 'User is not found.');
            //         res.redirect('/users/login');
            //         return;
            //     } 
            // })
            User.findOne({
                email: result.value.email
            })
                .exec((err, user) => {
                    if (err || !user) return res.status(404).send({ message: 'User not found' });

                    const isPasswordValid = bcrypt.compareSync(result.value.password, user.password);
                    //if (!isPasswordValid) return res.status(401).send({ message: 'Incorrect password' });
                    if (isPasswordValid) {
                        const token = jwt.sign(user._id.toString(), jwtSecret);
                        if (jwt.verify(token, jwtSecret)) res.render('game', { isAuthenticated: true });
                    } else {
                        return res.status(401).send({ message: 'Incorrect password' });
                    }
                    
                });
            
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({ message: 'Invalid token!' });
            } 
            next(error);
        }
    })

router.get('/game', (req, res) => {
        res.render('game');
    })
//jwt token(access, refresh)

module.exports = router;