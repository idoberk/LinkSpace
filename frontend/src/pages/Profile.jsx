import TopBar from '../components/TopBar';
import ProfilePicture from '../components/ProfilePicture';
import { useLocation } from 'react-router-dom';
import FeedButton from '../components/FeedButton';
import { useState, useEffect, useRef } from 'react';

// TODO: Add to the backend the birthdate to the public profile

const Profile = () => {
	const user =
		useLocation().state?.user || JSON.parse(localStorage.getItem('user'));
	const [showMenu, setShowMenu] = useState(false);
	// const [isUploading, setIsUploading] = useState(false);
	const menuRef = useRef(null);

	console.log(user);

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
		// TODO: Implement profile picture upload
		console.log('Add profile picture clicked');
		setShowMenu(false);
	};

	const handleAddCoverPhoto = () => {
		// TODO: Implement cover photo upload
		console.log('Add cover photo clicked');
		setShowMenu(false);
	};

	return (
		<div className='bg-white min-h-screen'>
			<TopBar user={user} />
			<div className='relative w-full h-100 rounded-b-lg'>
				<div
					className='overflow-hidden h-full w-full'
					style={{
						clipPath:
							'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
					}}>
					{user?.profile?.CoverPhoto ? (
						<img
							alt='cover photo'
							src={user?.profile.CoverPhoto}
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
							user?.profile?.avatar ||
							'Add your first profile picture'
						}
						width={250}
						height={250}
					/>
					<div
						className='absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-2\3'
						ref={menuRef}>
						<FeedButton
							className='px-4 py-2 rounded-full'
							onClick={() => setShowMenu(!showMenu)}>
							{' '}
							+
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
				</div>
			</div>

			<div className='flex justify-center items-center flex-col mt-32'>
				<h1 className='text-2xl font-bold '>
					{user?.profile?.firstName} {user?.profile?.lastName}
				</h1>
				<h2 className='text-lg text-gray-500 mt-2'>
					{user?.profile?.bio || 'No bio'}
				</h2>
				<h2 className='text-lg text-gray-500'>
					{user?.profile?.address || 'No address'}
				</h2>
				<h2 className='text-lg text-gray-500'>
					{user?.profile?.birthDate || ''}
				</h2>
			</div>
			<hr className='w-full my-4 border-gray-200' />
		</div>
	);
};

export default Profile;
