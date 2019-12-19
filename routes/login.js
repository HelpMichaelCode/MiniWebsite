const router = require('express').Router();

const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');

// config package used to manage configuration options
const config = require('config');

const keys = config.get('keys');

// Input validation package
// https://www.npmjs.com/package/validator
const validator = require('validator');

// require the database connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

// Define SQL statements here for use in function below
// These are parameterised queries note @named parameters.
// Input parameters are parsed and set before queries are executed

const SQL_INSERT = "INSERT INTO dbo.AppUser (FirstName, LastName, Email, Password, Role) VALUES (@firstName, @lastName, @email, @password, 'User'); SELECT * from dbo.AppUser WHERE UserId = SCOPE_IDENTITY();";


const hashCost = 10;


// POST login.
// Send username and password via request body from a login form

router.post('/auth', (req, res) => {
  // use passport to athenticate - uses local middleware
  // session false as this API is stateless
  passport.authenticate(
    'local',
    { session: false }, (error, user, info) => {
      // authentication fails - return error
      if (error || !user) {
        res.status(400).json({
          message: info ? info.message : 'Login failed',
          user: user
        });
      }
    
      const payload = {
        username: user.Email,
        // process.env.JWT_EXPIRATION_MS, 10
        // Set expiry to 30 minutes
        expires: Date.now() + (1000 * 60 * 30),
      };

      //assigns payload to req.user
      
      req.login(payload, { session: false }, (error) => {
        if (error) {
          res.status(400).send({ error });
        }
        // generate a signed json web token and return it in the response
        const token = jwt.sign(JSON.stringify(payload), keys.secret);

        // add the jwt to the cookie and send
        res.cookie('jwt', token, { httpOnly: true, secure: false });
        res.status(200).send({ "user": user.Email, token, "role": user.Role});
        
      });
    },
  )(req, res);
});


//logout
router.get('/logout', async (req, res) => {

  // Get a DB connection and execute SQL
  try {


    // add the jwt to the cookie and send
    res.clearCookie('jwt', {path: '/'});
    return res.status(200).redirect('/product');

    // Catch and send errors  
  } catch (err) {
    res.status(500)
    res.send(err.message)
  }
});



// Register a new user
router.post('/register', async (req, res) => {
  // Validate - this string, inially empty, will store any errors
  let errors = "";

  // Basic validation checks 
  
  const firstName = req.body.firstName;
  if (firstName === "") {
    errors += "invalid first name; ";
  }
  
  const lastName = req.body.lastName;
  if (lastName === "") {
    errors += "invalid last name; ";
  }
  
  const email = req.body.email;
  if (email === "") 
  {
    errors += "invalid email; ";
  }
 
  let password = req.body.password;
  if (password === "") 
  {
    errors += "invalid password; ";
  }


  // If errors send details in response
  if (errors != "") {
    // return http response with  errors if validation failed
    res.json({ "error": errors });
    return false;
  }

  // If no errors, insert
  try {

    // Encrypted password
    const passwordHash = await bcrypt.hash(password, hashCost);

    // Get a DB connection and execute SQL
    const pool = await dbConnPoolPromise
    const result = await pool.request()
      // set named parameter(s) in query
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, passwordHash)
      // Execute Query
      .query(SQL_INSERT);

    // If successful, return inserted product via HTTP   
    res.json(result.recordset[0]);

  } catch (err) {
    res.status(500)
    res.send(err.message)
  }

});

module.exports = router;
