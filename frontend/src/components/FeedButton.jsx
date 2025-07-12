const FeedButton = ({ children, className, ...props }) => {
	return (
		<button
			className={
				' text-gray-500 px-4 py-1.5 rounded-full bg-blue-50 border border-gray-200 hover:bg-blue-100 ' +
				className
			}
			{...props}>
			{children}
		</button>
	);
};

export default FeedButton;
