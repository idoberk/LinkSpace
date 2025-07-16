import { useEffect, useState, useRef } from 'react';
import api from '../lib/axios';
import ProfilePicture from './ProfilePicture';
import { useUser } from '../hooks/useUser';

const ChatWindow = ({
	conversation,
	onMessagesRead,
	updateConversationLastMessage,
}) => {
	const { user, socket } = useUser();
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [input, setInput] = useState('');
	const messagesEndRef = useRef(null);
	const other = conversation?.participants.find((p) => p._id !== user._id);

	// Fetch messages when conversation changes
	useEffect(() => {
		if (!conversation) return;
		const fetchMessages = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await api.get(`/messages/${conversation._id}`);
				setMessages(response.data.messages || []);
			} catch {
				setError('Failed to load messages');
			} finally {
				setLoading(false);
			}
		};
		fetchMessages();
	}, [conversation]);

	// Mark as read when entering conversation
	useEffect(() => {
		if (conversation && socket && socket.connected) {
			socket.emit('mark_as_read', { conversationId: conversation._id });
			if (onMessagesRead) onMessagesRead(conversation._id);
		}
	}, [conversation, socket, onMessagesRead]);

	// Socket.io: join room, listen for new messages
	useEffect(() => {
		if (!conversation || !socket) return;
		if (!socket.connected) socket.connect();

		const handleNewMessage = (data) => {
			if (data.conversationId === conversation._id) {
				setMessages((prev) => {
					// Remove any optimistic message with same content, sender, and not a real Mongo _id
					const filtered = prev.filter(
						(msg) =>
							!(
								(
									msg.sender === data.message.sender &&
									msg.content === data.message.content &&
									!/^[a-f0-9]{24}$/.test(msg._id)
								) // not a real MongoDB ObjectId
							),
					);
					// Only add if not already present (by _id)
					if (filtered.some((msg) => msg._id === data.message._id)) {
						return filtered;
					}
					return [...filtered, data.message];
				});
				// Update conversation list lastMessage
				if (
					updateConversationLastMessage &&
					updateConversationLastMessage.current
				) {
					const isOwnMessage =
						data.message.sender?._id === user._id ||
						data.message.sender === user._id;
					updateConversationLastMessage.current(
						data.conversationId,
						data.message,
						isOwnMessage,
					);
				}
			}
		};
		// Listen for events
		socket.on('new_message', handleNewMessage);

		return () => {
			socket.off('new_message', handleNewMessage);
		};
	}, [
		conversation,
		other?._id,
		socket,
		updateConversationLastMessage,
		user._id,
	]);

	// Scroll to bottom on new messages
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	const isSentByMe = (msg) => {
		if (!msg.sender) return false;
		if (typeof msg.sender === 'string') return msg.sender === user._id;
		if (typeof msg.sender === 'object' && msg.sender._id)
			return msg.sender._id === user._id;
		return false;
	};

	if (!conversation) {
		return (
			<div className='p-4 text-gray-400'>
				Select a conversation to start chatting.
			</div>
		);
	}
	if (loading) {
		return <div className='p-4 text-gray-500'>Loading messages...</div>;
	}
	if (error) {
		return <div className='p-4 text-red-500'>{error}</div>;
	}

	const handleSend = (e) => {
		e.preventDefault();
		if (!input.trim() || !socket || !socket.connected) return;

		socket.emit('send_message', {
			recipientId: other._id,
			content: input,
			messageType: 'text',
		});
		setInput('');
		// Optimistically update conversation list lastMessage
		if (
			updateConversationLastMessage &&
			updateConversationLastMessage.current
		) {
			const optimisticMsg = {
				_id: Math.random().toString(36).slice(2),
				content: input,
				sender: user._id,
				createdAt: new Date().toISOString(),
			};
			updateConversationLastMessage.current(
				conversation._id,
				optimisticMsg,
				true,
			);
		}
	};

	const handleInputChange = (e) => {
		const value = e.target.value;
		setInput(value);
	};

	return (
		<div className='flex flex-col h-full'>
			{/* Header */}
			<div className='flex items-center gap-2 border-b border-gray-200 p-4'>
				<ProfilePicture
					picture={other?.profile?.avatar?.url}
					width={40}
					height={40}
				/>
				<div className='font-medium text-gray-800'>
					{other?.profile?.firstName} {other?.profile?.lastName}
				</div>
			</div>
			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50'>
				{messages.length === 0 ? (
					<div className='text-gray-400 text-center'>
						No messages yet
					</div>
				) : (
					messages.map((msg) => (
						<div
							key={msg._id}
							className={`flex ${
								isSentByMe(msg)
									? 'justify-end'
									: 'justify-start'
							}`}>
							<div
								className={`max-w-xs px-4 py-2 rounded-lg ${
									isSentByMe(msg)
										? 'bg-blue-500 text-white'
										: 'bg-white text-gray-800 border'
								}`}>
								{msg.content}
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>
			{/* Input */}
			<form
				className='p-4 border-t border-gray-200 flex gap-2'
				onSubmit={handleSend}>
				<input
					type='text'
					className='flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'
					placeholder='Type a message...'
					value={input}
					onChange={handleInputChange}
					disabled={!conversation}
				/>
				<button
					type='submit'
					className='bg-blue-600 text-white px-4 py-2 rounded-lg'
					disabled={!input.trim() || !socket || !socket.connected}>
					Send
				</button>
			</form>
		</div>
	);
};

export default ChatWindow;
