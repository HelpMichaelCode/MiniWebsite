// This folder will contain the shared database setup
// and connection pool configuration.

// Connect to MS SQL database and make a connection pool available

let sql = require('mssql'); // Here we are just importing the module mssql

// config package used to manage configuration options
const config = require('config');

// Setting up the database connection 
// config is used to read values from the connection section of /config/default.json
// What's happening here is that the connection pool function is looking for a connection
// in our default.json file. It find - > "connection" within the file and extracts all 
// the connection details that is used to connect to the database

let dbConnPoolPromise = new sql.ConnectionPool(config.get('connection'))
    .connect()
    .then(pool => { // => - What does this represent
        console.log('Connected to MSSQL Database!')
        return pool
    })
    .catch(err => console.log('Database Connection Failed - error: ', err))


// export the sql and connectiol objects
module.exports = {
    sql, dbConnPoolPromise
};