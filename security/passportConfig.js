// Passport Access Control Middlewares
// LocalStrategy: finds username in the DB and verifies password
// JWTStrategy: Extracts JWT from HTTP authorization header (bearer token) and verifies its signature

// Import dependencies
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcryptjs');

// require the database connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

// config package used to manage configuration options
const config = require('config');

// Read secret key from config
const keys = config.get('keys');

// Function to get user
const getUser = async (username) => {

  try {
        const SQL_FIND_USER = 'SELECT * FROM dbo.AppUser  WHERE Email = @email for json path, without_array_wrapper;';
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // set name parameter(s) in query
            .input('email', sql.NVarChar, username)
            // execute query
            .query(SQL_FIND_USER);

        return (result.recordset[0]);
        // Catch and send errors  
      } catch (err) {
        res.status(500)
        res.send(err.message)
      }
}

// The local strategy middleware
passport.use(new LocalStrategy({
  // These values are passsed via HTTP 
  usernameField: 'username',
  passwordField: 'password',
},async (username, password, done) => {
  try {
    const user = await getUser(username);
    
    // Below is to compare if the hash value of the password entered in is the same in the database.
    // In the database, all the passwords are hashed, so if the user enters in password12 (which has a different hash value)
    // it will not be recognized

    const passwordsMatch = await bcrypt.compare(password, user.Password);
    // If it returns true print out messgae
    if (passwordsMatch) {
      return done(null, user, { message: 'Logged In Successfully' });
    } else {
      return done(null, false, { message: 'Incorrect Username / Password' });
    }
  } catch (error) {
    done(error);
  }
}));

// JWT strategy middleware
passport.use(new JWTStrategy({
    //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: keys.secret
  },
  (jwtPayload, done) => {
    console.log(`jwt: ${jwtPayload.username}`);
    // Check if JWT has expired 
    if (parseInt(Date.now()) > parseInt(jwtPayload.expires)) {
      return done('jwt expired');
    } else {
    return done(null, jwtPayload);
    }
  }
));

