const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticate = require('../middleware/authMiddleware');
const {
	validatePostSearchParams,
	canViewPost,
	isPostAuthor,
	canCreateGroupPost,
} = require('../middleware/postMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');
const { handleUploadErrors } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/', postController.getAllPosts);
router.get('/search', validatePostSearchParams, postController.searchPosts);

router.post(
	'/',
	uploadMultiple('media'),
	handleUploadErrors,
	canCreateGroupPost,
	postController.createPost,
);

router.post('/:id/like', canViewPost, postController.likePost);

router.delete('/:id', isPostAuthor, canViewPost, postController.deletePost);
router.put('/:id', isPostAuthor, postController.updatePost);

module.exports = router;
