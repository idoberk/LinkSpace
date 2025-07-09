const WelcomePage = ({ children }) => {
	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
			<div className='max-w-md w-full'>
				<div className='text-center mb-8'>
					<h1
						className='text-5xl font-bold text-gray-800 mb-2'
						style={{
							textShadow: '4px 4px 1px rgba(50,50,50,0.3)',
						}}>
						LinkSpace
					</h1>
					<p className='text-gray-600 text-lg'>
						Connect with friends and the world around you!
					</p>
				</div>
				<div
					className='bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ease-in-out'
					style={{ minHeight: '380px' }}>
					{children}
				</div>
			</div>
		</div>
	);
};

export default WelcomePage;
