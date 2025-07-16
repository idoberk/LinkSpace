import { useState, useRef, useCallback } from 'react';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';

const Messages = () => {
	const [selectedConversation, setSelectedConversation] = useState(null);
	const [handleMessagesRead, setHandleMessagesRead] = useState(
		() => () => {},
	);
	const updateConversationLastMessageRef = useRef(null);

	const refCallback = useCallback((handleRead, updateLastMessage) => {
		setHandleMessagesRead(() => handleRead);
		updateConversationLastMessageRef.current = updateLastMessage;
	}, []);

	return (
		<div className='flex h-screen bg-white'>
			{/* Left: Conversation List */}
			<div className='w-1/3 border-r border-gray-200 h-full'>
				<ConversationList
					selectedConversation={selectedConversation}
					setSelectedConversation={setSelectedConversation}
					refCallback={refCallback}
				/>
			</div>
			{/* Right: Chat Window */}
			<div className='flex-1 h-full'>
				<ChatWindow
					conversation={selectedConversation}
					onMessagesRead={handleMessagesRead}
					updateConversationLastMessage={
						updateConversationLastMessageRef
					}
				/>
			</div>
		</div>
	);
};

export default Messages;
