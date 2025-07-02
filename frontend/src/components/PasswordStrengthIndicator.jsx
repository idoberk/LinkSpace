import {
	calcPasswordStrength,
	getStrengthColor,
} from '../utils/passwordStrength';

export const PasswordStrengthIndicator = ({ password }) => {
	const strength = calcPasswordStrength(password);

	const strengthColor = getStrengthColor(strength.level);

	return (
		<div className='mt-2'>
			<div className='flex items-center gap-2 mb-1'>
				<div className='flex-1 h-1 bg-gray-200 rounded-full overflow-hidden'>
					<div
						className={`h-full transition-all duration-300 ${
							'bg-' + strengthColor
						}`}
						style={{ width: `${strength.percentage}%` }}
					/>
				</div>
				<span
					className={`text-xs font-medium ${
						'text-' + strengthColor
					}`}>
					{strength.level}
				</span>
			</div>
		</div>
	);
};

export default PasswordStrengthIndicator;
