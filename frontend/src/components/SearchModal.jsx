import React, { useState } from 'react';
import {
	Search,
	UserPlus,
	Users,
	MapPin,
	Calendar,
	CheckCircle,
	X,
} from 'lucide-react';
import api from '../lib/axios'; // שימוש באותו API instance
import { useNavigate } from 'react-router-dom';

const UserSearchAndFriends = () => {
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [searchFilters, setSearchFilters] = useState({
		firstName: '',
		lastName: '',
		city: '',
		joinedAfter: '',
		joinedBefore: '',
	});
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});
	const [friendRequests, setFriendRequests] = useState(new Set());
	const [successMessage, setSuccessMessage] = useState('');

	// פונקציה לחיפוש כללי - תואם לTopBar
	const searchUsers = async (page = 1) => {
		setLoading(true);
		setError('');

		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: pagination.limit.toString(),
				...(searchQuery && { search: searchQuery }),
			});

			// שימוש באותו API instance כמו TopBar
			const response = await api.get(`/users?${params}`);

			// התאמה למבנה התגובה של TopBar
			setUsers(response.data.users || []);
			setPagination(
				response.data.pagination || {
					page: 1,
					limit: 10,
					total: 0,
					pages: 0,
				},
			);
		} catch (err) {
			setError(err.response?.data?.message || 'Error searching users');
		} finally {
			setLoading(false);
		}
	};

	// פונקציה לחיפוש מתקדם
	const advancedSearch = async (page = 1) => {
		setLoading(true);
		setError('');

		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: pagination.limit.toString(),
				...Object.fromEntries(
					Object.entries(searchFilters).filter(([, value]) => value),
				),
			});

			const response = await api.get(`/users/search?${params}`);

			setUsers(response.data.users || []);
			setPagination(
				response.data.pagination || {
					page: 1,
					limit: 10,
					total: 0,
					pages: 0,
				},
			);
		} catch (err) {
			setError(err.response?.data?.message || 'Error in advanced search');
		} finally {
			setLoading(false);
		}
	};

	// פונקציה לשליחת בקשת חברות - תואם לTopBar
	const sendFriendRequest = async (userId) => {
		try {
			// שימוש באותו endpoint כמו TopBar
			await api.post(`/users/${userId}/friend-request`);

			setFriendRequests((prev) => new Set(prev).add(userId));
			setSuccessMessage('Friend request sent successfully!');
			setTimeout(() => setSuccessMessage(''), 3000);
		} catch (err) {
			setError(
				err.response?.data?.errors?.message ||
					'Error sending friend request',
			);
		}
	};

	// טיפול בשינוי דף
	const handlePageChange = (newPage) => {
		if (Object.values(searchFilters).some((value) => value)) {
			advancedSearch(newPage);
		} else {
			searchUsers(newPage);
		}
	};

	// טיפול בשינוי פילטר
	const handleFilterChange = (field, value) => {
		setSearchFilters((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// איפוס חיפוש
	const clearSearch = () => {
		setSearchQuery('');
		setSearchFilters({
			firstName: '',
			lastName: '',
			city: '',
			joinedAfter: '',
			joinedBefore: '',
		});
		setUsers([]);
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	// פונקציה לניווט לפרופיל - תואם לTopBar
	const handleUserClick = (userId) => {
		navigate(`/profile/${userId}`);
	};

	return (
		<div className='max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
			<div className='mb-6'>
				<h2 className='text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
					<Users className='w-6 h-6' />
					Search and Add Friends
				</h2>

				{/* הודעות */}
				{error && (
					<div className='mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 flex items-center gap-2'>
						<X className='w-5 h-5' />
						{error}
					</div>
				)}

				{successMessage && (
					<div className='mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center gap-2'>
						<CheckCircle className='w-5 h-5' />
						{successMessage}
					</div>
				)}

				{/* חיפוש כללי */}
				<div className='mb-4'>
					<div className='flex gap-2'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-3 w-5 h-5 text-gray-400' />
							<input
								type='text'
								placeholder='Search by name, last name or email...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>
						<button
							onClick={() => searchUsers(1)}
							disabled={loading}
							className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'>
							{loading ? 'Searching...' : 'Search'}
						</button>
					</div>
				</div>

				{/* חיפוש מתקדם */}
				<div className='border-t pt-4'>
					<h3 className='text-lg font-semibold mb-3'>
						Advanced Search
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
						<input
							type='text'
							placeholder='First Name'
							value={searchFilters.firstName}
							onChange={(e) =>
								handleFilterChange('firstName', e.target.value)
							}
							className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
						/>
						<input
							type='text'
							placeholder='Last Name'
							value={searchFilters.lastName}
							onChange={(e) =>
								handleFilterChange('lastName', e.target.value)
							}
							className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
						/>
						<input
							type='text'
							placeholder='City'
							value={searchFilters.city}
							onChange={(e) =>
								handleFilterChange('city', e.target.value)
							}
							className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
						/>
						<input
							type='date'
							placeholder='Joined After'
							value={searchFilters.joinedAfter}
							onChange={(e) =>
								handleFilterChange(
									'joinedAfter',
									e.target.value,
								)
							}
							className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
						/>
						<input
							type='date'
							placeholder='Joined Before'
							value={searchFilters.joinedBefore}
							onChange={(e) =>
								handleFilterChange(
									'joinedBefore',
									e.target.value,
								)
							}
							className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
						/>
					</div>
					<div className='flex gap-2'>
						<button
							onClick={() => advancedSearch(1)}
							disabled={loading}
							className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50'>
							{loading ? 'Searching...' : 'Advanced Search'}
						</button>
						<button
							onClick={clearSearch}
							className='px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700'>
							Clear Search
						</button>
					</div>
				</div>
			</div>

			{/* תוצאות חיפוש */}
			{loading && (
				<div className='flex justify-center items-center py-8'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
				</div>
			)}

			{users.length > 0 && (
				<div className='space-y-4'>
					<h3 className='text-lg font-semibold'>
						Found {pagination.total} users
					</h3>

					<div className='grid gap-4'>
						{users.map((user) => (
							<div
								key={user._id}
								className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
								<div className='flex items-center justify-between'>
									<div
										className='flex items-center gap-4 cursor-pointer flex-1'
										onClick={() =>
											handleUserClick(user._id)
										}>
										<div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
											{user.profile?.avatar?.url ? (
												<img
													src={
														user.profile.avatar.url
													}
													alt={user.displayName}
													className='w-12 h-12 rounded-full object-cover'
												/>
											) : (
												<span className='text-blue-600 font-semibold'>
													{user.displayName?.charAt(
														0,
													) ||
														user.profile?.firstName?.charAt(
															0,
														) ||
														'U'}
												</span>
											)}
										</div>
										<div>
											<h4 className='font-semibold text-gray-800'>
												{user.displayName ||
													`${
														user.profile
															?.firstName || ''
													} ${
														user.profile
															?.lastName || ''
													}`}
											</h4>
											<div className='flex items-center gap-4 text-sm text-gray-500'>
												{user.profile?.address && (
													<span className='flex items-center gap-1'>
														<MapPin className='w-4 h-4' />
														{user.profile.address}
													</span>
												)}
												{user.createdAt && (
													<span className='flex items-center gap-1'>
														<Calendar className='w-4 h-4' />
														Joined:{' '}
														{new Date(
															user.createdAt,
														).toLocaleDateString(
															'en-US',
														)}
													</span>
												)}
											</div>
										</div>
									</div>

									<div className='flex gap-2'>
										{friendRequests.has(user._id) ? (
											<span className='px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium'>
												Request Sent
											</span>
										) : (
											<button
												onClick={(e) => {
													e.stopPropagation();
													sendFriendRequest(user._id);
												}}
												className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors'>
												<UserPlus className='w-4 h-4' />
												Add Friend
											</button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* פגינציה */}
					{pagination.pages > 1 && (
						<div className='flex justify-center items-center gap-2 mt-6'>
							<button
								onClick={() =>
									handlePageChange(pagination.page - 1)
								}
								disabled={pagination.page === 1}
								className='px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50'>
								Previous
							</button>

							<span className='px-3 py-1 font-medium'>
								Page {pagination.page} of {pagination.pages}
							</span>

							<button
								onClick={() =>
									handlePageChange(pagination.page + 1)
								}
								disabled={pagination.page === pagination.pages}
								className='px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50'>
								Next
							</button>
						</div>
					)}
				</div>
			)}

			{users.length === 0 && !loading && (
				<div className='text-center py-8 text-gray-500'>
					<Users className='w-12 h-12 mx-auto mb-3 text-gray-300' />
					<p>No users found. Try searching for something else.</p>
				</div>
			)}
		</div>
	);
};

export default UserSearchAndFriends;
