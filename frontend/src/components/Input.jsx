const Input = ({ label, id, error, inputStyle, labelStyle, ...props }) => {
	return (
		<div className='relative group'>
			<label htmlFor={id} className={labelStyle}>
				{label}
			</label>
			<input id={id} className={inputStyle} {...props} />
			<div className='text-red-500'>{error && <p>{error}</p>}</div>
		</div>
	);
};

export default Input;
