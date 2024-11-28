import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

//AWS RDS 연결
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 연결테스트 2가 출력된다면 정상
connection.connect();
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
connection.end();

const app = express();
const PORT = 3017;

app.use(express.json());

app.listen(PORT, () => {
  console.log(PORT, 'server port open!');
});
