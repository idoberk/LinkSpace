// TODO: Check if the non picture works
const ProfilePicture = ({
	picture,
	width = 220,
	height = 220,
	className = '',
}) => {
	// Generate a unique pattern id based on the picture URL (or fallback)
	const patternId = picture
		? `profile-img-${btoa(picture).replace(/[^a-zA-Z0-9]/g, '')}`
		: 'profile-img-default';

	return (
		<svg
			className={`profile-picture ${className}`}
			viewBox='0 0 200 200'
			xmlns='http://www.w3.org/2000/svg'
			width={width}
			height={height}>
			{picture ? (
				<>
					<defs>
						<pattern
							id={patternId}
							patternUnits='objectBoundingBox'
							width='1'
							height='1'>
							<image
								href={picture}
								x='0'
								y='0'
								width='200'
								height='200'
								preserveAspectRatio='xMidYMid slice'
							/>
						</pattern>
					</defs>
					<path
						fill={`url(#${patternId})`}
						d='M59.6,-61.5C72.8,-46.5,76,-23.2,74.8,-1.2C73.7,20.9,68.2,41.8,55,55.2C41.8,68.5,20.9,74.3,-0.9,75.3C-22.8,76.2,-45.6,72.3,-61.9,59C-78.1,45.6,-87.7,22.8,-85.5,2.2C-83.3,-18.4,-69.3,-36.8,-53.1,-51.9C-36.8,-67,-18.4,-78.8,2.4,-81.2C23.2,-83.6,46.5,-76.6,59.6,-61.5Z'
						transform='translate(100 100)'
					/>
				</>
			) : (
				<>
					<path
						fill='#e0e0e0'
						d='M59.6,-61.5C72.8,-46.5,76,-23.2,74.8,-1.2C73.7,20.9,68.2,41.8,55,55.2C41.8,68.5,20.9,74.3,-0.9,75.3C-22.8,76.2,-45.6,72.3,-61.9,59C-78.1,45.6,-87.7,22.8,-85.5,2.2C-83.3,-18.4,-69.3,-36.8,-53.1,-51.9C-36.8,-67,-18.4,-78.8,2.4,-81.2C23.2,-83.6,46.5,-76.6,59.6,-61.5Z'
						transform='translate(100 100)'
					/>
					<text
						x='100'
						y='95'
						textAnchor='middle'
						fill='#666'
						fontSize='12'
						fontFamily='Arial, sans-serif'
						fontWeight='500'>
						Add your
					</text>
					<text
						x='100'
						y='110'
						textAnchor='middle'
						fill='#666'
						fontSize='12'
						fontFamily='Arial, sans-serif'
						fontWeight='500'>
						profile picture
					</text>
				</>
			)}
		</svg>
	);
};

export default ProfilePicture;
