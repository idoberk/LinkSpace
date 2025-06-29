import { useState } from 'react';

export function useInput(defaultValue, validationFn) {
	const [enteredValue, setEnteredValue] = useState(defaultValue);
	const [didEdit, setDidEdit] = useState(false);
	const isValueValid = validationFn(enteredValue);

	const handleInputChange = (e) => {
		setEnteredValue(e.target.value);
		setDidEdit(false);
	};

	const handleInputBlur = () => {
		setDidEdit(true);
	};

	return {
		value: enteredValue,
		handleInputChange,
		handleInputBlur,
		hasError: didEdit && !isValueValid,
	};
}
