import express from "express";
import { prisma } from "../utils/prisma/index.js";
const router = express.Router();

// 전체 게시글 조회
router.get('/posts', async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      select: {
        postId: true,
        title: true,
        content: true,
        userId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.status(200).json({ data: posts});
  } catch (error) {
    next(error);
  }
});

// 특정 게시글 조회
router.get('/posts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { postId: +id },
      select: {
        postId: true,
        title: true,
        content: true,
        userId: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    return res.status(200).json(post);
  } catch (error) {
    next(error);
  }
});

// 게시글 생성
router.post('/posts', async (req, res, next) => {

  try {
    const { title, content, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "userId를 입력해 주세요." });
    }
    
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        userId: +userId,
      },
    });
    return res.status(201).json({ message: '게시글이 저장되었습니다.', data: newPost });
  } catch (error) {
    next(error);
  }
});

// 게시글 수정
router.put('/posts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const existingPost = await prisma.post.findUnique({
      where: { postId: +id },
    });

    if (!existingPost) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const updatedPost = await prisma.post.update({
      where: { postId: +id },
      data: {
        title: title ?? existingPost.title,
        content: content ?? existingPost.content,
      },
    });

    return res.status(200).json({ message: '게시글이 수정되었습니다.', data: updatedPost });
  } catch (error) {
    next(error);
  }
});

// 게시글 삭제
router.delete('/posts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.post.findUnique({
      where: { postId: +id },
    });

    if (!existingPost) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    await prisma.post.delete({
      where: { postId: +id },
    });

    return res.status(200).json({ message: "게시글이 삭제되었습니다." });
  } catch (error) {
    next(error);
  }
});

export default router;