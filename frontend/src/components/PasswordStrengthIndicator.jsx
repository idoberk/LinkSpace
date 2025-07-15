import { calcPasswordStrength } from '../utils/passwordStrength';

export const PasswordStrengthIndicator = ({ password }) => {
	const strength = calcPasswordStrength(password);

	const bgColorMap = {
		Weak: 'bg-red-500',
		Medium: 'bg-yellow-500',
		Strong: 'bg-green-500',
	};

	const textColorMap = {
		Weak: 'text-red-500',
		Medium: 'text-yellow-500',
		Strong: 'text-green-500',
	};

	return (
		<div className='mt-2'>
			<div className='flex items-center gap-2 mb-1'>
				<div className='flex-1 h-1 bg-gray-200 rounded-full overflow-hidden'>
					<div
						className={`h-full transition-all duration-300 ${
							bgColorMap[strength.level]
						}`}
						style={{ width: `${strength.percentage}%` }}
					/>
				</div>
				<span
					className={`text-xs font-medium ${
						textColorMap[strength.level]
					}`}>
					{strength.level}
				</span>
			</div>
		</div>
	);
};

export default PasswordStrengthIndicator;
