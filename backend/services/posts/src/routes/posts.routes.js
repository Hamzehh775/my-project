import { Router } from 'express';
import {
  listAllPosts,
  listPostsByUser,
  createPost,
  deletePost,
  countPostsPerUser
} from '../controllers/posts.controller.js';
import { client } from "../db.js";

const router = Router();

router.get('/', listAllPosts);
router.get('/user/:userId', listPostsByUser);
router.post('/user/:userId', createPost);
router.delete('/:id', deletePost);
router.get('/counts', countPostsPerUser);
router.post('/user/:userId', createPost);

export default router;
