import { Router } from 'express';
import {
  listAllPosts,
  listPostsByUser,
  createPost,
  deletePost,
  countPostsPerUser
} from '../controllers/posts.controller.js';

const router = Router();

router.get('/', listAllPosts);
router.get('/user/:userId', listPostsByUser);
router.post('/user/:userId', createPost);
router.delete('/:id', deletePost);
router.get('/counts', countPostsPerUser);

export default router;
