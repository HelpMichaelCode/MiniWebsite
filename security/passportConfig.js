// Passport Access Control Middlewares
// LocalStrategy: finds username in the DB and verifies password
// JWTStrategy: Extracts JWT from HTTP authorization header (bearer token) and verifies its signature

// Importing the dependencies
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcryptjs');

// require the database connection from the db.js file
const {sql, dbConnPoolPromise} = require('../database/db');

// config package used to manage configuration options
const config = require('config');

// Read secret key from config
const keys = config.get('keys');

// Function to get user
const getUser = async(username) => {
    try{
        const SQL_FIND_USER = 'SELECT * FROM dbo.AppUser WHERE Email = @email for json path, without_array_wrapper;';
        // Get db connection
        const pool = await dbConnPoolPromise
        const result = await pool.request()
        // Set the name parameter(s) in query
        .input('email', sql.NVarChar, username)
        //Execeute the query
        .query(SQL_FIND_USER);
        // console.log('Printing result: ' + result);
    return (result.recordset[0]);
    // Catching if any errors occur

    }catch(err){
        res.status(500)
        res.send(err.message)
    }
}

// The local strategy middleware
passport.use(new LocalStrategy({
    // These values are passed via HTTP, done is the callback function
    usernameField: 'username',
    passwordFiled: 'password',
}, async (username, password, done) => {
    try{
        const user = await getUser(username);

        // This example uses plain text but better to hashed password
        console.log('PassportConfig file - User: ' + user);
        const passwordsMatch = await bcrypt.compare(password, user.Password)
        if(passwordsMatch = true){
            return done(null, user, {message: 'Logged in Successfully!'});
        } else {
            return done(null, false, {message: 'Username / Password not recognized!'});
        }
    } catch(error){             
        done(error);
    }
}));

// JWT strategy middleware, retrieve JWT as jwtPayload
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.secret
},
(jwtPayload, done) => {
    console.log(`jwt: ${jwtPayload.username}`);
    //Check if JWT has expired
    if(parseInt(Date.now()) > parseInt(jwtPayload.expires)){
        return done('jwt expired');
    }
    return done(null, jwtPayload);
}));