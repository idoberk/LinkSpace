const SideBarItem = ({ icon, text, ...props }) => {
	return (
		<div
			className='flex items-center p-3 hover:bg-gray-100 rounded-br-full rounded-tr-full transition-colors w-50 h-20'
			style={{
				backgroundColor: '#e8efff',
			}}
			{...props}>
			{icon}
			<span className='ml-2 text-lg'>{text}</span>
		</div>
	);
};

export default SideBarItem;
