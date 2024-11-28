import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client'; // PrismaClient를 가져옴

const prismaClient = new PrismaClient(); // Prisma 클라이언트 초기화

const router = express.Router();
//const prismaClient = new prismaClient();

// 계정 생성 시, 사용자가 입력한 데이터 검증 스키마
const createAccountSchema = Joi.object({
  userID: Joi.string()
    .min(8)
    .max(20)
    .pattern(/^[가-힣a-zA-Z0-9]+$/) // 한글, 영문, 숫자만 허용 (공백 제외)
    .required(),
  password: Joi.string().min(6).max(20).required(),
  email: Joi.string().email().required(),
});

// 계정 생성 API
router.post('/account', async (req, res, next) => {
  try {
    // 요청 데이터 검증
    const validation = await createAccountSchema.validate(req.body);
    const { value } = validation;

    // 검증된 데이터
    const { userID, password, email } = value;

    // Prisma로 데이터베이스에 계정 추가
    const newAccount = await prismaClient.account.create({
      data: { userID, password, email },
    });

    // 성공 응답
    res.status(200).json({
      message: '계정 생성을 성공했습니다.',
      account: {
        userID: newAccount.userID,
        email: newAccount.email,
      },
    });
  } catch (err) {
    // 기타 장애 처리
    next(err);
  }
});

// 계정 삭제 시, 요청 데이터 검증 스키마
const deleteAccountSchema = Joi.object({
  userID: Joi.string().required(),
  password: Joi.string().required(),
});

//계정 삭제 API
router.delete('/account', async (req, res, next) => {
  try {
    // 요청 데이터 검증
    const validation = await deleteAccountSchema.validate(req.body);
    const { value } = validation;

    // 검증된 데이터
    const { userID, password } = value;

    // DB에서 userID가 일치하는 데이터 조회
    const account = await prismaClient.account.findUnique({
      where: { userID },
    });

    // 계정 존재 여부 확인
    if (!account) {
      return res.status(400).json({
        errorMessage: '존재하지 않는 계정이거나 비밀번호가 일치하지 않습니다.',
      });
    }

    // 비밀번호 확인
    if (account.password !== password) {
      return res.status(400).json({
        errorMessage: '존재하지 않는 계정이거나 비밀번호가 일치하지 않습니다.',
      });
    }

    // 계정 삭제
    const deletedAccount = await prismaClient.account.delete({
      where: { userID },
    });

    // 삭제 성공 응답
    res.status(200).json({
      message: '계정 삭제를 성공했습니다.',
      account: {
        userID: deletedAccount.userID,
        email: deletedAccount.email,
      },
    });
  } catch (err) {
    // 기타 에러 처리
    next(err);
  }
});

export default router;
