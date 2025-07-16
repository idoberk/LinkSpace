import { useEffect, useState, useCallback } from 'react';
import api from '../lib/axios';
import ProfilePicture from './ProfilePicture';
import { useUser } from '../hooks/useUser';
import ChatWindow from './ChatWindow';

const ConversationList = ({
	selectedConversation,
	setSelectedConversation,
	refCallback,
}) => {
	const { user, socket } = useUser();
	const [conversations, setConversations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showFriends, setShowFriends] = useState(false);
	const [friends, setFriends] = useState([]);
	const [friendsLoading, setFriendsLoading] = useState(false);
	const [friendsError, setFriendsError] = useState(null);

	// Fetch conversations
	useEffect(() => {
		const fetchConversations = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.get('/messages/conversations');
				setConversations(res.data.conversations || []);
			} catch {
				setError('Failed to load conversations');
			} finally {
				setLoading(false);
			}
		};
		fetchConversations();
	}, []);

	// Fetch friends when needed
	const handleShowFriends = async () => {
		setShowFriends(true);
		setFriendsLoading(true);
		setFriendsError(null);
		try {
			const ids = user?.friends || [];
			const fetched = await Promise.all(
				ids.map(async (id) => {
					try {
						const res = await api.get(`/users/${id}`);
						return { userId: id, profile: res.data.profile };
					} catch {
						return null;
					}
				}),
			);
			setFriends(fetched.filter(Boolean));
		} catch {
			setFriendsError('Failed to load friends');
		} finally {
			setFriendsLoading(false);
		}
	};

	const handleStartChat = async (friendId) => {
		try {
			const res = await api.get(
				`/messages/conversations/user/${friendId}`,
			);
			const conv = res.data.conversation;
			if (conv) {
				setConversations((prev) => {
					const exists = prev.find((c) => c._id === conv._id);
					return exists ? prev : [conv, ...prev];
				});
				setSelectedConversation(conv);
			}
			setShowFriends(false);
		} catch {
			alert('Failed to start chat');
		}
	};

	// Update unread count when messages are marked as read
	const handleMessagesRead = useCallback(
		(conversationId) => {
			setConversations((prev) =>
				prev.map((conv) =>
					conv._id === conversationId
						? {
								...conv,
								unreadCount: {
									...conv.unreadCount,
									[user._id]: 0,
								},
						  }
						: conv,
				),
			);
		},
		[user._id],
	);

	// Add this function to update lastMessage and move conversation to top
	const updateConversationLastMessage = useCallback(
		(conversationId, message, isOwnMessage = false) => {
			setConversations((prev) => {
				const idx = prev.findIndex((c) => c._id === conversationId);
				if (idx === -1) return prev;
				const updated = { ...prev[idx], lastMessage: message };
				// Optionally update unreadCount for received messages
				if (!isOwnMessage && updated.unreadCount) {
					const userId = user._id;
					updated.unreadCount = {
						...updated.unreadCount,
						[userId]: (updated.unreadCount[userId] || 0) + 1,
					};
				}
				const newList = [
					updated,
					...prev.slice(0, idx),
					...prev.slice(idx + 1),
				];
				return newList;
			});
		},
		[user._id],
	);

	// Listen for messages_marked_read event from backend and update unreadCount
	useEffect(() => {
		if (!socket) return;
		const handleMarkedRead = ({ conversationId }) => {
			setConversations((prev) =>
				prev.map((conv) =>
					conv._id === conversationId
						? {
								...conv,
								unreadCount: {
									...conv.unreadCount,
									[user._id]: 0,
								},
						  }
						: conv,
				),
			);
		};
		socket.on('messages_marked_read', handleMarkedRead);
		return () => {
			socket.off('messages_marked_read', handleMarkedRead);
		};
	}, [socket, user._id]);

	// Expose updateConversationLastMessage via refCallback
	useEffect(() => {
		if (refCallback)
			refCallback(
				() => handleMessagesRead,
				updateConversationLastMessage,
			);
	}, [refCallback, handleMessagesRead, updateConversationLastMessage]);

	// Optimistically reset unread count if selectedConversation has unread messages (e.g., after refresh)
	useEffect(() => {
		if (
			selectedConversation &&
			selectedConversation.unreadCount &&
			selectedConversation.unreadCount[user._id] > 0
		) {
			handleMessagesRead(selectedConversation._id);
		}
	}, [selectedConversation, user._id, handleMessagesRead]);

	if (loading) {
		return (
			<div className='p-4 text-gray-500'>Loading conversations...</div>
		);
	}
	if (error) {
		return <div className='p-4 text-red-500'>{error}</div>;
	}

	return (
		<div className='p-2 h-full overflow-y-auto'>
			<div className='flex items-center justify-between mb-4'>
				<h3 className='text-lg text-gray-800'>Chats</h3>
				<button
					className='bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm'
					onClick={handleShowFriends}
					aria-label='Start new chat'>
					+ Start Chat
				</button>
			</div>
			{/* Friends modal/dropdown */}
			{showFriends && (
				<div className='fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50'>
					<div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-xs'>
						<h4 className='text-md font-semibold mb-2'>
							Select a friend to chat
						</h4>
						{friendsLoading ? (
							<div className='text-gray-500'>
								Loading friends...
							</div>
						) : friendsError ? (
							<div className='text-red-500'>{friendsError}</div>
						) : friends.length === 0 ? (
							<div className='text-gray-500'>
								No friends found
							</div>
						) : (
							<ul className='space-y-2 max-h-60 overflow-y-auto'>
								{friends.map((f) => (
									<li
										key={f.userId}
										className='flex items-center gap-2 p-2 rounded hover:bg-blue-50 cursor-pointer'
										onClick={() =>
											handleStartChat(f.userId)
										}>
										<ProfilePicture
											picture={f.profile?.avatar?.url}
											width={32}
											height={32}
										/>
										<span className='text-gray-800'>
											{f.profile?.firstName}{' '}
											{f.profile?.lastName}
										</span>
									</li>
								))}
							</ul>
						)}
						<button
							className='mt-4 w-full bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition text-sm'
							onClick={() => setShowFriends(false)}>
							Cancel
						</button>
					</div>
				</div>
			)}
			{conversations.length === 0 ? (
				<div className='text-gray-500 text-center py-4'>
					No conversations yet
				</div>
			) : (
				<div className='space-y-2'>
					{conversations.map((conv) => {
						const other = conv.participants.find(
							(p) => p._id !== user._id,
						);
						return (
							<div
								key={conv._id}
								className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition ${
									selectedConversation &&
									selectedConversation._id === conv._id
										? 'bg-blue-100'
										: ''
								}`}
								onClick={() => setSelectedConversation(conv)}>
								<ProfilePicture
									picture={other?.profile?.avatar?.url}
									width={40}
									height={40}
								/>
								<div className='flex-1'>
									<div className='font-medium text-gray-800'>
										{other?.profile?.firstName}{' '}
										{other?.profile?.lastName}
									</div>
									<div className='text-xs text-gray-500 truncate max-w-[140px]'>
										{conv.lastMessage?.content ||
											'No messages yet'}
									</div>
								</div>
								{conv.unreadCount &&
									conv.unreadCount[user._id] > 0 && (
										<span className='ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5'>
											{conv.unreadCount[user._id]}
										</span>
									)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ConversationList;
