import SubmitPostItem from './SubmitPostItem';
import Post from './Post';
import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useUser } from '../hooks/useUser';
import { group } from 'd3';
// import { useLocation } from 'react-router-dom';

const Feed = () => {
	const { user } = useUser();
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);

	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	// const location = useLocation();
	// const params = new URLSearchParams(location.search);
	// const searchTerm = params.get('search') || '';

	// const location = useLocation();
	// const [searchText, setSearchText] = useState('');
	// const isFeedOrProfile =
	// 	location.pathname === '/home' ||
	// 	location.pathname.startsWith('/profile');

	// const fetchPosts = async () => {
	// 	setLoading(true);
	// 	try {
	// 		const response = await api.get('/posts/search', {
	// 			params: { visibility: group },
	// 			// params: { visibility: group, content: searchText },
	// 		});
	// 		console.log(response.data.posts);
	// 		setPosts(response.data.posts);
	// 	} catch (error) {
	// 		console.error('Error fetching posts:', error);
	// 		setPosts([]);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };
	useEffect(() => {
		const handleScroll = () => {
			if (
				window.innerHeight + window.scrollY >=
					document.body.offsetHeight - 200 &&
				hasMore &&
				!loading
			) {
				setPage((prevPage) => prevPage + 1);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [hasMore, loading]);

	const fetchPosts = async (pageToLoad = 1) => {
		setLoading(true);
		try {
			const response = await api.get('/posts/search', {
				params: { visibility: group, page: pageToLoad, limit: 10 },
			});

			const newPosts = response.data.posts;
			if (pageToLoad === 1) {
				setPosts(newPosts);
			} else {
				setPosts((prev) => [...prev, ...newPosts]);
			}

			if (newPosts.length < 10) {
				setHasMore(false);
			}
		} catch (error) {
			console.error('Error fetching posts:', error);
			setPosts([]);
			setHasMore(false);
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

	// useEffect(() => {
	// 	if (user) {
	// 		fetchPosts();
	// 	}
	// }, [user]);
	useEffect(() => {
		if (user) {
			fetchPosts(page);
		}
	}, [user, page]);

	const handlePostSubmit = () => {
		fetchPosts();
	};
	return (
		<div className='h-screen '>
			<div className='flex flex-row'>
				<SubmitPostItem onPostSubmit={handlePostSubmit} />
			</div>
			{/* <div className=' mt-2 text-xl flex flex-col  '>
				Search post
				<input
					type='text'
					value={searchText}
					className=' border border-gray-400 rounded-xl p-2 w-full mt-2 '
					onChange={(e) => setSearchText(e.target.value)}
					placeholder='Search post'
					onKeyDown={(e) => {
						if (e.key === 'Enter' && isFeedOrProfile) fetchPosts();
					}}
				/>
			</div> */}
			{/* </div> */}
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
