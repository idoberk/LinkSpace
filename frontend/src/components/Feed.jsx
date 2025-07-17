import SubmitPostItem from './SubmitPostItem';
import Post from './Post';
import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useUser } from '../hooks/useUser';
import { group } from 'd3';
import { useLocation } from 'react-router-dom';

const Feed = () => {
	const { user } = useUser();
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const searchTerm = params.get('search') || '';

	const fetchPosts = async () => {
		setLoading(true);
		try {
			const response = await api.get('/posts/search', {
				params: { visibility: group, content: searchTerm },
			});
			setPosts(response.data.posts);
		} catch (error) {
			console.error('Error fetching posts:', error);
			setPosts([]);
		} finally {
			setLoading(false);
		}
	};
	const filteredPosts = posts.filter((post) => {
		if (post.visibility === 'public') return true;

		if (post.visibility === 'group') {
			const groupId =
				typeof post.group === 'string' ? post.group : post.group?._id;

			return user.groups.includes(groupId);
		}

		return false;
	});

	useEffect(() => {
		if (user) {
			fetchPosts();
		}
	}, [user, searchTerm]);

	const handlePostSubmit = () => {
		fetchPosts();
	};
	return (
		<div className='h-screen '>
			<div className='flex justify-center items-center'>
				<SubmitPostItem onPostSubmit={handlePostSubmit} />
			</div>
			{loading ? (
				<div className='text-center mt-10'>Loading...</div>
			) : (
				filteredPosts.map((post) => (
					<Post
						key={post._id}
						post={post}
						onPostChange={fetchPosts}
					/>
				))
			)}
		</div>
	);
};

export default Feed;
