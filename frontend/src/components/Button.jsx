const Button = ({ children, className, ...props }) => {
	return (
		<button
			className={
				className
					? className
					: 'w-full my-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
			}
			{...props}>
			{children}
		</button>
	);
};

export default Button;
