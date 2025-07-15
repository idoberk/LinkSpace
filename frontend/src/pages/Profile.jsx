<<<<<<< HEAD
import TopBar from '../components/TopBar';
import ProfilePicture from '../components/ProfilePicture';
import Post from '../components/Post';
import SubmitPostItem from '../components/SubmitPostItem';
import { useLocation, useParams } from 'react-router-dom';
import FeedButton from '../components/FeedButton';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
=======
import { useEffect, useRef, useState } from 'react';
>>>>>>> 142e6ab1b85b612ca5cedbf32f59bd5602b9cb90
import api from '../lib/axios';
import Post from '../components/Post';
import TopBar from '../components/TopBar';
import { useUser } from '../hooks/useUser';
import FeedButton from '../components/FeedButton';
import ProfilePicture from '../components/ProfilePicture';
import SubmitPostItem from '../components/SubmitPostItem';
import ProfileEditForm from '../components/ProfileEditForm';
import ProfileSettingsForm from '../components/ProfileSettingsForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import AlertMessage from '../components/AlertMessage';
import { useLocation } from 'react-router-dom';
import { formatDate } from '../utils/timeFormatting';

// TODO: Add to the backend the birthdate to the public profile

const Profile = () => {
<<<<<<< HEAD
	const navigate = useNavigate();
	const { userId } = useParams(); // Get userId from URL params
	const userFromLocation =
		useLocation().state?.user || JSON.parse(localStorage.getItem('user'));

	const [user, setUser] = useState(userFromLocation);
=======
	const { user, setUser } = useUser();
>>>>>>> 142e6ab1b85b612ca5cedbf32f59bd5602b9cb90
	const [showMenu, setShowMenu] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadType, setUploadType] = useState(null);
	const [loading, setLoading] = useState(false);
	const menuRef = useRef(null);
	const fileInputRef = useRef(null);

	const [posts, setPosts] = useState([]);
	const location = useLocation();
	const [editMode, setEditMode] = useState(null); // 'inline', 'settings', 'password', null
	const [alert, setAlert] = useState(null);

	// Set editMode from navigation state on mount
	useEffect(() => {
		if (location.state && location.state.editMode) {
			setEditMode(location.state.editMode);
		}
		// eslint-disable-next-line
	}, []);

	// Fetch user data if userId is provided in URL
	useEffect(() => {
		const fetchUserData = async () => {
			if (userId && userId !== user?._id) {
				setLoading(true);
				try {
					const response = await api.get(`/api/users/${userId}`);
					setUser(response.data);
				} catch (error) {
					console.error('Error fetching user data:', error);
					// If user not found, redirect to home
					navigate('/home');
				} finally {
					setLoading(false);
				}
			}
		};

		fetchUserData();
	}, [userId, user?._id, navigate]);

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
	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleAddProfilePicture = () => {
		setUploadType('avatar');
		setShowMenu(false);
		fileInputRef.current.click();
	};

	const handleAddCoverPhoto = () => {
		setUploadType('coverPhoto');
		setShowMenu(false);
		fileInputRef.current.click();
	};

	const handleFileChange = async (e) => {
		if (!e.target.files.length) return;
		setUploading(true);
		const file = e.target.files[0];
		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', uploadType);

		if (uploadType === 'avatar') {
			formData.append('folder', `linkspace/users/${user._id}/profile`);
		} else if (uploadType === 'coverPhoto') {
			formData.append('folder', `linkspace/users/${user._id}/cover`);
		}

		try {
			// 1. Upload the file and get the URL
			const uploadRes = await api.post('/upload/single', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			const imageUrl = uploadRes.data.media?.url || uploadRes.data.url;
			const publicId =
				uploadRes.data.media?.publicId || uploadRes.data.publicId;
			const fieldName =
				uploadType === 'coverPhoto' ? 'coverImage' : 'avatar';

			// 2. Update the profile with the new image URL
			await api.put('/account/profile', {
				profile: {
					...user.profile,
					[fieldName]: { url: imageUrl, publicId },
				},
			});

			// 3. Fetch the latest user profile from the backend
			const profileRes = await api.get('/account/profile');
			setUser(profileRes.data);
		} catch (error) {
			console.error('Upload or update error:', error);
			alert(
				'Error uploading file: ' +
					(error?.response?.data?.message || error.message),
			);
		} finally {
			setUploading(false);
			setUploadType(null);
			e.target.value = null;
		}
	};

	// Show loading state
	if (loading) {
		return (
			<div className='bg-white min-h-screen flex items-center justify-center'>
				<div className='text-lg'>Loading profile...</div>
			</div>
		);
	}

	// Show error if no user data
	if (!user) {
		return (
			<div className='bg-white min-h-screen flex items-center justify-center'>
				<div className='text-lg text-red-600'>User not found</div>
			</div>
		);
	}

	return (
		<div className='bg-white min-h-screen'>
			<TopBar />
			<div className='relative w-full h-100 rounded-b-lg'>
				<div
					className='overflow-hidden h-full w-full'
					style={{
						clipPath:
							'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
					}}>
					{user?.profile?.coverImage ? (
						<img
							alt='cover photo'
							src={user?.profile.coverImage}
							className='w-full h-full object-cover'
						/>
					) : (
						<div className='w-full h-full flex mt-4 items-center justify-center bg-gray-200 text-gray-500'>
							Add your first cover photo
						</div>
					)}
				</div>
				<div className='absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2'>
					<ProfilePicture
						picture={
							user?.profile?.avatar?.url
							// || 'Add your first profile picture'
						}
						width={250}
						height={250}
					/>
					{/* Only show edit menu if viewing own profile */}
					{!userId || userId === JSON.parse(localStorage.getItem('user'))?._id ? (
						<div
							className='absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-2\3'
							ref={menuRef}>
							<FeedButton
								className='px-4 py-2 rounded-full'
								onClick={() => setShowMenu(!showMenu)}
								disabled={uploading}>
								{uploading ? '...' : '+'}
							</FeedButton>
							{showMenu && (
								<div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-10'>
									<button
										onClick={handleAddProfilePicture}
										className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2'>
										<span>Add profile picture</span>
									</button>
									<hr className='w-full border-gray-200' />
									<button
										onClick={handleAddCoverPhoto}
										className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2'>
										<span>Add cover photo</span>
									</button>
								</div>
							)}
						</div>
					) : null}
				</div>
			</div>
			<input
				type='file'
				accept='image/*'
				style={{ display: 'none' }}
				ref={fileInputRef}
				onChange={handleFileChange}
			/>

			<div className='flex justify-center items-center flex-col mt-32'>
				<h1 className='text-2xl font-bold '>
					{user?.profile?.firstName} {user?.profile?.lastName}
				</h1>
				<div className='flex gap-2 mt-4'>
					<button
						className={`px-4 py-2 rounded ${
							editMode === 'inline'
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 text-gray-700'
						}`}
						onClick={() =>
							setEditMode(editMode === 'inline' ? null : 'inline')
						}>
						Edit Inline
					</button>
					<button
						className={`px-4 py-2 rounded ${
							editMode === 'settings'
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 text-gray-700'
						}`}
						onClick={() =>
							setEditMode(
								editMode === 'settings' ? null : 'settings',
							)
						}>
						Settings
					</button>
					<button
						className={`px-4 py-2 rounded ${
							editMode === 'password'
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 text-gray-700'
						}`}
						onClick={() =>
							setEditMode(
								editMode === 'password' ? null : 'password',
							)
						}>
						Change Password
					</button>
				</div>
				{alert && (
					<AlertMessage
						type={alert.type}
						message={alert.message}
						onClose={() => setAlert(null)}
					/>
				)}
				<div className='w-full max-w-lg mt-4'>
					{editMode === 'inline' && (
						<ProfileEditForm onClose={() => setEditMode(null)} />
					)}
					{editMode === 'settings' && (
						<ProfileSettingsForm
							onClose={() => setEditMode(null)}
						/>
					)}
					{editMode === 'password' && (
						<ChangePasswordForm onClose={() => setEditMode(null)} />
					)}
				</div>
			</div>
			<hr className='w-full my-4 border-gray-200' />
			<div className='flex flex-col gap-1 ml-2'>
				<h2 className='text-lg text-gray-500 mt-2'>
					{user?.profile?.bio || 'No bio'}
				</h2>
				<h2 className='text-lg text-gray-500'>
					{user?.profile?.address || 'No address'}
				</h2>
				<h2 className='text-lg text-gray-500'>
					{user?.profile?.birthDate
						? formatDate(user.profile.birthDate)
						: ''}
				</h2>
			</div>
			<hr className='w-full my-4 border-gray-200' />
			<div className='h-screen w-4/5 mx-auto'>
				{/* Only show post creation if viewing own profile */}
				{(!userId || userId === JSON.parse(localStorage.getItem('user'))?._id) && (
					<div className='flex justify-center items-center'>
						<SubmitPostItem onPostSubmit={handlePostSubmit} />
					</div>
				)}
				{posts
					.filter((post) => post.author._id === user._id)
					.map((post) => (
						<Post
							key={post._id}
							post={post}
							onPostChange={fetchPosts}
						/>
					))}
			</div>
		</div>
	);
};

export default Profile;
