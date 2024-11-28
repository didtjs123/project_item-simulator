import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import accountRouter from './routes/account-router.js';
import charaterRouter from './routes/charater-router.js';
import itemRouter from './routes/item-router.js';
import errorHandlerMiddleware from './middlewares/error-handler.middleware.js';
//환경변수 로드
dotenv.config();

//AWS RDS 연결
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 연결테스트, 2가 출력된다면 정상
connection.connect();
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
connection.end();

//express 생성
const app = express();

//서버 포트
const PORT = 3017;

//json 데이터 처리, body 데이터 사용
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//라우터 등록
app.use('/api', [accountRouter, charaterRouter, itemRouter]);

//에러 처리 미들웨어
app.use(errorHandlerMiddleware);

//서버 실행, 클라이언트 요청 대기
app.listen(PORT, () => {
  console.log(PORT, 'server port open!');
});
