

const env = {
    database: 'orderdata',
    username: 'posadmin',
    password: '21011991',
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
  };
   
  module.exports = env;
 