const cool = require('cool-ascii-faces')
const express = require('express')
const app = express();
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
var bodyParser = require('body-parser')

showTimes = () => {
  let result = ''
  const times = process.env.TIMES || 5
  for (i = 0; i < times; i++) {
    result += i + ' '
  }
  return result;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// create application/json parser
var jsonParser = bodyParser.json()

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .get('/times', (req, res) => res.send(showTimes()))
  .get('/db', async (req, res) => {
    try {
			const client = await pool.connect()
			console.log('B: connect');
			const result = await client.query('SELECT * FROM test_table');
			res.status(200).json(result.rows);
      	/*
			console.log('B: query');
	      	const results = { 'results': (result) ? result.rows : null};
	      	console.log('B: results');
	      	res.render('pages/db', results );
		*/
      	client.release();
    } catch (err) {
      	console.error(err);
      	res.send("Error " + err);
    }

  	})  
  	.post('/addUser', jsonParser, async (req, res) => {
  		try {
  			console.log('===================================================== addUser');
			console.log('============= JSON.stringify(req.body): ' + JSON.stringify(req.body));

			const client = await pool.connect()

			// get max id from table
			const maxIdQueryResult = await client.query('SELECT MAX(id) FROM test_table;');
			console.log('MAX(id) ' + maxIdQueryResult.rows[0].max);
			var maxId = maxIdQueryResult.rows[0].max;

			const maxIdRecordResult = await client.query('SELECT * FROM test_table WHERE id = ' + maxId + ';');
			console.log('maxIdRecord' + JSON.stringify(maxIdRecordResult.rows));

			/*
			var queryStr = "INSERT INTO test_table (id, name) VALUES (3, 'Binh');";
			console.log('Binh: queryStr: ' + queryStr);

			const result = await client.query(queryStr);
			console.log('Binh: result: ' + JSON.stringify(result));

			res.status(201).json(result);
			
			*/

      		client.release();

	    } catch (err) {
	      	console.error(err);
	      	res.send("Error " + err);
	    }
	})
.listen(PORT, () => console.log(`Listening on ${ PORT }`))
