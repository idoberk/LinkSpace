// Utility to format date objects or strings
// Supported format: 'DD/MM/YYYY' (default)
export function formatDate(date, format = 'DD/MM/YYYY') {
	if (!date) return '';
	const d = typeof date === 'string' ? new Date(date) : date;
	if (isNaN(d)) return '';
	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();

	if (format === 'DD/MM/YYYY') {
		return `${day}/${month}/${year}`;
	}
	// Add more formats as needed
	return d.toLocaleDateString();
}
