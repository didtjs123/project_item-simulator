import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client'; // PrismaClient를 가져옴

const prismaClient = new PrismaClient(); // Prisma 클라이언트 초기화

const router = express.Router();
//const prismaClient = new prismaClient();

// 캐릭터 생성시, 요청 데이터 검증 스키마
const createCharacterSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(10)
    .pattern(/^[가-힣a-zA-Z0-9]+$/) // 한글, 영문, 숫자만 허용 (공백 제외)
    .required(),
});

// 캐릭터 생성 API
router.post('/createCharacter', async (req, res, next) => {
  try {
    // 요청 데이터 검증
    const validation = await createAccountSchema.validate(req.body);
    const { value } = validation;

    // 검증된 데이터
    const { userID, name } = value;

    // 계정 존재 여부 확인(jwt 인증 구현 시 삭제 예정)
    const account = await prismaClient.account.findUnique({
      where: { id: userID },
    });
    if (!account) {
      return res.status(400).json({
        errorMessage: '존재하지 않는 계정입니다.',
      });
    }

    //  Prisma로 데이터베이스에 캐릭터 추가(고유속성이므로 중복확인 필요없음)
    const newCharacter = await prismaClient.character.create({
      data: {
        name,
        userID,
        health: 100, // 테이블모델 디폴트값이지만 가독성을 위해 입력
        power: 100, // 이하동문
        money: 0, // 이하동문
      },
    });

    //중복데이터 에러 처리
    if (err.code === 'P2002') {
      return res.status(400).json({
        errorMessage: '이미 사용 중인 이름입니다.',
      });
    }

    // 성공 응답
    res.status(200).json({
      message: '캐릭터 생성을 성공했습니다.',
      character: {
        name: newCharacter.name,
        health: newCharacter.health,
        power: newCharacter.power,
        money: newCharacter.money,
      },
    });
  } catch (err) {
    // 에러 처리
    next(err);
  }
});

// 캐릭터 생성시, 요청 데이터 검증 스키마
const deleteCharacterSchema = Joi.object({
  name: Joi.string().required(),
});
//캐릭터 삭제 API
router.delete('/deleteCharacter', async (req, res, next) => {
  try {
    // 요청 데이터 검증
    const validation = deleteCharacterSchema.validate(req.body);
    const { value } = validation;

    // 요청 데이터
    const { name, userID } = req.body;

    // 캐릭터 존재 여부 확인
    const character = await prismaClient.character.findUnique({
      where: { name: name },
    });

    if (!character) {
      return res.status(400).json({
        errorMessage: '존재하지 않은 캐릭터입니다.',
      });
    }

    // 캐릭터 삭제
    await prismaClient.character.delete({
      where: { name: character.name },
    });

    // 성공 응답
    res.status(200).json({
      message: '캐릭터 삭제를 성공했습니다.',
      deletedCharacter: {
        name: character.name,
        health: character.health,
        power: character.power,
        money: character.money,
      },
    });
  } catch (err) {
    // 에러 처리
    next(err);
  }
});
export default router;
