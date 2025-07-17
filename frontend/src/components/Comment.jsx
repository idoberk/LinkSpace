import React, { useState } from 'react';
import api from '../lib/axios';
import FeedButton from './FeedButton';

const CommentForm = ({ postId, onCommentAdded }) => {
	const [content, setContent] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!content.trim()) {
			setError('must be value');
			return;
		}
		setLoading(true);
		setError('');
		// try {
		// 	const res = await api.post(`/comments/${postId}`, {
		// 		content,
		// 	});
		// 	setContent('');
		// 	if (onCommentAdded) {
		// 		onCommentAdded(res.data.comment);
		// 	}
		try {
			await api.post(`/comments/${postId}`, { content });
			setContent('');
			if (onCommentAdded) {
				onCommentAdded();
			}
		} catch (err) {
			setError(err.response?.data?.errors?.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-2 mt-2'>
			<input
				className='border rounded p-2'
				placeholder="'Write comment..."
				value={content}
				onChange={(e) => setContent(e.target.value)}
				disabled={loading}
			/>
			<FeedButton
				type='submit'
				className='bg-blue-500 text-white rounded px-4 py-2'
				disabled={loading}>
				{loading ? 'Sending...' : 'Comment'}
			</FeedButton>
			{error && <div className='text-red-500'>{error}</div>}
		</form>
	);
};

export default CommentForm;
