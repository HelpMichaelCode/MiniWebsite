const router = require('express').Router();

// Input validation package
// https://www.npmjs.com/package/validator
// Here we are importing a validator package which 
// has built in functions that we can use to validate
// data input.

let validator = require('validator');

// Here we are retrieving the data connection from db.js
const {sql, dbConnPoolPromise} = require('../database/db.js');

// These are parameterised queries note @named parameters
// Input parameters are parsed and set before quries are executed

// for JSON path - we are gonna tell MSSQL to return results as JSON format

const SELECT_ALL = 'SELECT * FROM dbo.Product for json path;';

// without_array_wrapper - use for single result
/*
This option enables you to remove square brackets that surround
JSON text generated by FOR JSON clause which is used in line 19.

JSON output example {"year": 2015, "month": 12, "day": 15},

but without this option we would have:

JSON output example [{"year": 2015, "month": 12, "day": 15}]
*/
const SELECT_ID = 'SELECT * FROM dbo.Product WHERE ProductId = @id for json path, without_array_wrapper;';

const INSERT = 'INSERT INTO dbo.Product (CategoryId, ProductName, ProductDescription, ProductStock, ProductPrice) VALUES (@categoryId, @productName, @productDescription, @ProductStock, @ProductPrice); SELECT * from dbo.Product WHERE ProductId = SCOPE_IDENTITY();'

const UPDATE = 'UPDATE dbo.Product SET CategoryId = @categoryId, ProductName = @productName, ProductDescription = @productDescription, ProductStock = @ProductStock, ProductPrice = @ProductPrice WHERE ProductId = @id; SELECT * FROM dbo.Product WHERE ProductId = @id;';

const DELETE = 'DELETE FROM dbo.Product WHERE ProductId = @id;';


// First HTTP method that were gonna do is the get method.
// Whenever a client requests to see all the products, this
// method will execute
router.get('/product', async(req, res) => {
    // Let's get a database connection first

    try{
        const pool = await dbConnPoolPromise
        const result = await pool.request()
                .query(SELECT_ALL);

                // Send HTTP reponse.
                // JSON data from MS SQL is contained in first element of the recordset
                res.json(result.recordset[0]);   
    
      // Catch and send errors
    } catch(err){
        res.status(500);
        res.send(err.message);
    }
})

// Retrieving a single product from the database
router.get('/product/:id', async(req, res) => {
    
    // read the value of id parameter from the requested url
    const productId = req.params.id;

    // Validate the input - this is just to make sure that no attacker 
    // inputs anything that may harm the server.
    if(!validator.isNumeric(productId, {no_symbols: true})){
        res.json({"error": "invalid id paramter"})
        return false;
    }

    // If the validation passes - return the page of the requested id
    try{
        // Get a database connection
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // set name paramter(s) in query
            .input('id', sql.Int, productId)

            // execute the query 
            .query(SELECT_ID);

            // Send response with JSON result
            res.json(result.recordset)
    } catch(err){
        res.status(500)
        res.send(err.message)
    }
});

/// POST - Insert a new product.

// This async function sends a HTTP post request

router.post('/product', async (req, res) => {
    // Validate - this string, intially empty, will store any errors
    let errors = ""; 
    
    const categoryId = req.body.categoryId;
    if (!validator.isNumeric(categoryId, {no_symbols: true})) {
        errors+= "invalid category id; ";
    }
    
    // Escape text and potentially bad characters
    const productName = validator.escape(req.body.productName);
    if (productName === "") {
    
    errors+= "invalid productName; ";
    
    }
    
    const productDescription = validator.escape(req.body.productDescription);
    if (productDescription === "") {
    
    errors+= "invalid productDescription; ";
    
    }
    
    // Make sure that category id is just a number
    const productStock = req.body.productStock;
    if (!validator.isNumeric(productStock, {no_symbols: true})) {
    
    errors+= "invalid productStock; ";
    
    }
    
    // Validate currency
    const productPrice = req.body.productPrice;
    if (!validator.isCurrency(productPrice, {allow_negatives: false})) {
    
    errors+= "invalid productPrice; ";
    
    }
    
    // If errors send details in response
    if (errors != "") {
    // return http response with errors if validation failed
    res.json({ "error": errors });
    
    return false;
    
    }
    
    // If no errors, insert
    
    try {
    // Get a DB connection and execute SQL
    const pool = await dbConnPoolPromise  
    const result = await pool.request()
    
    // set name parameter(s) in query
    
    .input('categoryId', sql.Int, categoryId)
    
    .input('productName', sql.NVarChar, productName)
    
    .input('productDescription', sql.NVarChar, productDescription)
    
    .input('productStock', sql.Int, productStock)
    
    .input('productPrice', sql.Decimal, productPrice)
    
    // Execute Query
    
    .query(INSERT);
    
    // If successful, return inserted product via HTTP
    
    res.json(result.recordset[0]);
    
    } catch (err) {
    
    res.status(500)
    
    res.send(err.message)
    
    }
    
    });

    // Updating a product
    router.put('/product', async(req, res) => {
         // Validate - this string, inially empty, will store any errors
    let errors = "";

    // Make sure that category id is just a number - note that values are read from request body

    const productId = req.body.productId;
 
    // Make sure that category id is just a number - note that values are read from request body
    const categoryId = req.body.categoryId;
    if (!validator.isNumeric(categoryId, {no_symbols: true})) {
        errors+= "invalid category id; ";
    }
    // Escape text and potentially bad characters
    const productName = validator.escape(req.body.productName);
    if (productName === "") {
        errors+= "invalid productName; ";
    }
    const productDescription = validator.escape(req.body.productDescription);
    if (productDescription === "") {
        errors+= "invalid productDescription; ";
    }
    // Make sure that category id is just a number
    const productStock = req.body.productStock;
    if (!validator.isNumeric(productStock, {no_symbols: true})) {
        errors+= "invalid productStock; ";
    }
    // Validate currency
    const productPrice = req.body.productPrice;
    if (!validator.isCurrency(productPrice, {allow_negatives: false})) {
        errors+= "invalid productPrice; ";
    }

    // If errors send details in response
    if (errors != "") {
        // return http response with  errors if validation failed
        res.json({ "error": errors });
        return false;
    }

    // If no errors, insert
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise  
    const result = await pool.request()
            // set name parameter(s) in query
            .input('id', sql.Int, productId)
            .input('categoryId', sql.Int, categoryId)    
            .input('productName', sql.NVarChar, productName)
            .input('productDescription', sql.NVarChar, productDescription)
            .input('productStock', sql.Int,  productStock)
            .input('productPrice', sql.Decimal, productPrice)
            // Execute Query
            .query(UPDATE);      
    
        // If successful, return inserted product via HTTP   
        res.json(result.recordset[0]);

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
    });

    router.delete('/product/:id', async(req, res) =>{
        // read value of id parameter from the request url
        const productId = req.params.id;
    
        // Validate input - important as a bad input could crash the server or lead
        // to an attack. See link to validator npm package (at top) for doc.
        // If validation fails return an error message
    
        if(!validator.isNumeric(productId,{ no_symbols: true})){
            res.json({"error": "invalid id parameter"});
            return false;
        }
    
        // If validation passed execute query and return results
        // returns a single product with matching id
        try{
            // Get a DB connection and execute SQL 
            const pool = await dbConnPoolPromise  
            const result = await pool.request()
    
            // set name parameter(s) in query 
            .input('id', sql.Int, productId)
    
            //execute query
            .query(DELETE);
    
            // Send response with JSON result
            res.json(result.recordset)
        } catch(err){
            res.status(500)
            res.send(err.message)
        }
    });

  
module.exports = router;