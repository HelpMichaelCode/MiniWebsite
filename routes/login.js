// require dependencies
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');

//config package used to manage configuration options
const config = require('config');

// Get the secret key from config
const keys = config.get('keys');

// Input validation package
// https://www.npmjs.com/package/validator
const validator = require('validator');

// require the database connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

// POST LOGIN - Send username and password via request body from a login form
router.post('/auth', (req, res) => {
    // use passport to authenticate - uses local middleware
    passport.authenticate(
        'local',
        {session: false},(error, user, info) => {
            // authentication fails - return error
          
            if(error || !user){
                res.status(400).json({
                    message: info ? info.message : 'Login failed!', // If info is true print info.message else if it is false print 'Login Failed'
                    user: user
                });
            }
    
        // Define the JWT contents - be careful: including email here but is that a good idea?
        console.log('Hello, I\'m here!');
        console.log('User: ' + user);
        const payload = {
            
            username: user.Email,
            // process.env.JWT_EXPIRATION_MS, 10
            // Set expiry to 30 minutes
            expires: Date.now() + (1000 * 60 * 30),
          };
      
        // assigns payload to req.user
        req.login(payload, {session: false}, (error) => {
            if(error){
                res.status(400).send({error});
            }

            // generate a signed json web token and return it in the response
            const token = jwt.sign(JSON.stringify(payload), keys.secret);

            // return user and token
            res.status(200).send({"user": user.Email, token});
        });
    },
)
(req, res);
});

module.exports = router;