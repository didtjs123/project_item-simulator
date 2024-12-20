import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';

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
router.post('/character', async (req, res, next) => {
  try {
    // 요청 데이터 검증
    const validation = await createCharacterSchema.validate(req.body);
    const { value } = validation;

    // 검증된 데이터
    const { userID, name } = value;

    // 캐릭터 생성할 계정 존재 여부 확인(jwt 인증 구현 시 삭제 예정)
    const account = await prismaClient.account.findUnique({
      where: { userID: userID },
    });

    // jwt 인증 구현 이후, 변경될 예정
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
        money: 10000, // 이하동문
      },
    });

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
  password: Joi.string().required(),
  name: Joi.string().required(),
});

//캐릭터 삭제 API
router.delete('/character/:name', async (req, res, next) => {
  try {
    // 요청 데이터 검증 (Body에서 userID와 password를 검증)
    const { value } = deleteCharacterSchema.validate(req.body);

    const { userID, password } = value;
    const { name } = req.params;

    // 캐릭터 존재 여부 확인
    const character = await prismaClient.character.findUnique({
      where: { name },
    });

    if (!character) {
      return res.status(404).json({
        errorMessage: '삭제하려는 캐릭터를 찾을 수 없습니다.',
      });
    }

    // 계정 정보 확인
    const account = await prismaClient.account.findUnique({
      where: { userID },
    });

    if (!account) {
      return res.status(400).json({
        errorMessage: '존재하지 않는 계정입니다.',
      });
    }

    // 비밀번호 확인
    if (account.password !== password) {
      return res.status(400).json({
        errorMessage: '비밀번호가 일치하지 않습니다.',
      });
    }

    // 계정과 캐릭터 소유 관계 확인
    if (character.userID !== userID) {
      return res.status(403).json({
        errorMessage: '해당 캐릭터를 삭제할 권한이 없습니다.',
      });
    }

    // 캐릭터 삭제
    await prismaClient.character.delete({
      where: { name },
    });

    // 성공 응답
    res.status(200).json({
      message: '캐릭터 삭제를 성공했습니다.',
    });
  } catch (err) {
    // 에러 처리
    next(err);
  }
});

// 캐릭터 상세보기 API
router.get('/character/:name', async (req, res, next) => {
  try {
    // URL에서 캐릭터 이름 가져오기
    const { name } = req.params;

    // 캐릭터 조회
    const character = await prismaClient.character.findUnique({
      where: { name },
      include: {
        inventory: true, // 캐릭터의 인벤토리 포함
        equipped: true, // 캐릭터가 장착한 아이템 포함
      },
    });

    // 캐릭터가 없을 경우
    if (!character) {
      return res.status(400).json({
        errorMessage: `캐릭터를 찾을 수 없습니다.`,
      });
    }

    // 성공 응답
    res.status(200).json({
      message: '캐릭터 조회 성공',
      character: {
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
