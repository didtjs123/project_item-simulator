import express from 'express';
import Joi from 'joi';
import prismaClient from '@prisma/client';

const router = express.Router();

// 아이템 생성 요청 데이터 검증 스키마
const createItemSchema = Joi.object({
  code: Joi.number().integer().positive().required(),
  name: Joi.string().min(1).max(20).required(),
  stats: Joi.object({
    health: Joi.number().integer(),
    power: Joi.number().integer(),
  }).required(),
  price: Joi.number().integer().positive().required(),
});
