const mysql = require('mysql2');
const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'autolink',
});
module.exports = pool.promise();
