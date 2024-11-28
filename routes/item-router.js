import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient(); // Prisma 클라이언트 초기화

const router = express.Router();

// 아이템 생성 요청 데이터 검증 스키마
const createItemSchema = Joi.object({
  code: Joi.number().integer().positive().required(),
  name: Joi.string()
    .min(1)
    .max(20)
    .pattern(/^[가-힣a-zA-Z0-9\s]+$/) //공백 포함
    .required(),
  stats: Joi.object({
    health: Joi.number().integer(),
    power: Joi.number().integer(),
  }).required(),
  price: Joi.number().integer().min(1).positive().required(),
});

// 아이템 생성 API
router.post('/item', async (req, res, next) => {
  try {
    // 요청 데이터 검증
    const validate = createItemSchema.validate(req.body);
    const { value } = validate;
    const { code, name, stats, price } = value;

    // 아이템 코드 중복 확인
    const existingItem = await prismaClient.item.findUnique({
      where: { code },
    });

    if (existingItem) {
      return res.status(400).json({
        errorMessage: '이미 존재하는 아이템 코드입니다.',
      });
    }

    // 아이템 생성
    const newItem = await prismaClient.item.create({
      data: {
        code,
        name,
        stats,
        price,
      },
    });

    // 성공 응답
    res.status(200).json({
      message: '아이템 생성을 성공했습니다.',
      item: newItem,
    });
  } catch (err) {
    // 에러 처리
    next(err);
  }
});

// 삭제 요청 데이터 검증 스키마
const deleteItemSchema = Joi.object({
  code: Joi.number().integer().positive().required(),
});

// 아이템 삭제 API
router.delete('/item', async (req, res, next) => {
  try {
    // 요청 데이터 검증
    const validate = deleteItemSchema.validate(req.body);
    const { value } = validate;
    const { code } = value;

    // 아이템 존재 여부 확인
    const item = await prismaClient.item.findUnique({
      where: { code },
    });

    if (!item) {
      return res.status(400).json({
        errorMessage: `삭제하려는 아이템 코드를 찾을 수 없습니다.`,
      });
    }

    // 아이템 삭제 (관련 데이터 자동 삭제: Inventory, EquippedItem 등)
    await prismaClient.item.delete({
      where: { code },
    });

    // 성공 응답
    res.status(200).json({
      message: '아이템 삭제를 성공했습니다.',
      deletedItem: {
        code: item.code,
        name: item.name,
      },
    });
  } catch (err) {
    // 장애 처리
    next(err);
  }
});

// 조회 요청 데이터 검증 스키마
const selectItemSchema = Joi.object({
  code: Joi.number().integer().positive().required(),
});
// 아이템 상세 조회 API
router.get('/item/:code', async (req, res, next) => {
  try {
    // //정수 변환
    // const transCode = parseInt(req.params.code, 10);
    // 데이터 검증
    const validate = deleteItemSchema.validate(req.params);
    const { value } = validate;
    const { code } = value;

    // Prisma로 아이템 조회
    const item = await prismaClient.item.findUnique({
      where: { code },
    });

    // 아이템이 없을 경우 처리
    if (!item) {
      return res.status(400).json({
        errorMessage: `등록된 아이템 코드가 아닙니다.`,
      });
    }

    // 성공 응답
    res.status(200).json({
      message: '아이템 조회 성공',
      item: {
        code: item.code,
        name: item.name,
        stats: item.stats,
        price: item.price,
      },
    });
  } catch (err) {
    // 에러 처리
    next(err);
  }
});

// 아이템 수정 요청 데이터 검증 스키마
const updateItemSchema = Joi.object({
  code: Joi.number().integer().positive().required(),
  name: Joi.string()
    .min(1)
    .max(20)
    .pattern(/^[가-힣a-zA-Z0-9\s]+$/),
  stats: Joi.object({
    health: Joi.number().integer(),
    power: Joi.number().integer(),
  }),
  price: Joi.number().positive(),
});

// 아이템 수정 API
router.put('/item', async (req, res, next) => {
  try {
    // 요청 데이터 검증
    const { value } = updateItemSchema.validate(req.body);

    const { code, name, stats, price } = value;

    // 아이템 존재 여부 확인
    const item = await prismaClient.item.findUnique({
      where: { code },
    });

    if (!item) {
      return res.status(400).json({
        errorMessage: '존재하지 않은 아이템 코드입니다.',
      });
    }

    // 아이템 수정
    const updateItem = await prismaClient.item.update({
      where: { code },
      data: {
        ...(name && { name }), // name이 존재하면 수정
        ...(stats && { stats }), // stats가 존재하면 수정
        ...(price && { price }), // price가 존재하면 수정
      },
    });

    // 성공 응답
    res.status(200).json({
      message: '아이템 수정 성공',
      updatedItem: {
        code: updateItem.code,
        name: updateItem.name,
        stats: updateItem.stats,
        price: updateItem.price,
      },
    });
  } catch (err) {
    // 에러 처리
    next(err);
  }
});

export default router;
