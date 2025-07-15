import SubmitPostItem from './SubmitPostItem';
import Post from './Post';
import { useState, useEffect } from 'react';
import api from '../lib/axios';

// TODO: Fix the logout bug, when coming back to the home page, it still shows the page

const Feed = () => {
	const [posts, setPosts] = useState([]);

	const fetchPosts = async () => {
		try {
			const response = await api.get('/posts');
			setPosts(response.data.posts);
		} catch (error) {
			console.error('Error fetching posts:', error);
		}
	};

	useEffect(() => {
		fetchPosts();
	}, []);

	const handlePostSubmit = () => {
		fetchPosts();
	};

	return (
		<div className='h-screen '>
			<div className='flex justify-center items-center'>
				<SubmitPostItem onPostSubmit={handlePostSubmit} />
			</div>
			{posts.map((post) => (
				<Post key={post._id} post={post} onPostChange={fetchPosts} />
			))}
		</div>
	);
};

export default Feed;
