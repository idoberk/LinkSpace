const SideBarItem = ({ icon, text, ...props }) => {
	return (
		<div
			className='flex items-center p-3 hover:bg-gray-800 rounded-br-full rounded-tr-full w-50 h-20 cursor-pointer'
			style={{
				backgroundColor: '#e8efff',
				hover: {
					backgroundColor: 'blue',
				},
			}}
			{...props}>
			{icon}
			<button className='ml-2 text-lg hover:bg-gray-100 rounded-4xl'>
				{text}
			</button>
		</div>
	);
};

export default SideBarItem;
