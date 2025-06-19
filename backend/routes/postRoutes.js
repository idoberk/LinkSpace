const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const {
	validatePostSearchParams,
	canViewPost,
	isPostAuthor,
} = require('../middleware/postMiddleware');

router.post('/', authenticate, postController.createPost);
router.get('/', optionalAuth, postController.getAllPosts);
router.get(
	'/search',
	authenticate,
	validatePostSearchParams,
	postController.searchPosts,
);
router.delete(
	'/:id',
	authenticate,
	isPostAuthor,
	canViewPost,
	postController.deletePost,
);
router.put('/:id', authenticate, isPostAuthor, postController.updatePost);

module.exports = router;
