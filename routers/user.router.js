import express from "express"
import { prisma } from "../utils/prisma/index.js";
const router = express.Router();

// 새로운 유저 추가
router.post('/users', async (req, res, next) => {

  try {
    const { email, password, nickname } = req.body;

    // 기존 데이터베이스에 이메일 있는지 없는지 확인
    const existingUser = await prisma.users.findUnique({
      where : { email },
    });

    // 이메일 있으면 중복 안내
    if (existingUser) {
      return res.send({
        message : "이미 존재하는 이메일입니다."
      });
    }

    // 이메일 없으면 추가
    const newUser = await prisma.users.create({
      data : {
        email,
        password,
        nickname,
      },
    });

    const { password: _, ...userData } = newUser;

    return res.status(201).json({ message: '회원가입이 완료되었습니다.', data: userData });
  } catch (error) {
    next(error);
  }
});

// 모든 사용자 조회
router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        userId: true,
        email: true,
        nickname: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
});

// 특정 사용자 조회
router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.users.findUnique({
      where: { userId: +id },
      select: {
        userId: true,
        email: true,
        nickname: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const { password: _, ...userData } = user;
    return res.status(200).json({ data: userData });
  } catch (error) {
    next(error);
  }
});

// 게시물?
router.get('/users/:id/posts', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.users.findUnique({
      where: { userId: +id },
      include: {
        Posts: { // User에 연결된 모든 Posts를 함께 조회 (관계 필드 사용)
          select: {
            postId: true,
            title: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const { password: _, ...userData } = user;
    return res.status(200).json({ data: userData });
  } catch (error) {
    next(error);
  }
});

// 사용자 정보 수정 API (비밀번호 확인 필요)
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, password, newPassword, nickname } = req.body;

    const user = await prisma.users.findUnique({
      where: { userId: +id },
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 비밀번호 확인 (실제 환경에서는 해싱된 비밀번호 비교)
    if (user.password !== password) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    await prisma.users.update({
      where: { userId: +id },
      data: {
        email: email || user.email, // 변경할 값이 없으면 기존 값 유지
        password: newPassword || user.password, // 새 비밀번호가 없으면 기존 비밀번호 유지
        nickname: nickname || user.nickname,
        updatedAt: new Date(), // 수동으로 업데이트 시간 설정
      },
    });

    return res.status(200).json({ message: '사용자 정보가 성공적으로 수정되었습니다.' });
  } catch (error) {
    next(error);
  }
});

// 사용자 삭제 API (비밀번호 확인 필요)
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const user = await prisma.users.findUnique({
      where: { userId: +id },
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 비밀번호 확인
    if (user.password !== password) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 사용자와 관련된 모든 게시글도 함께 삭제

    await prisma.users.delete({
      where: { userId: +id },
    });

    return res.status(200).json({ message: '사용자가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
});

export default router;