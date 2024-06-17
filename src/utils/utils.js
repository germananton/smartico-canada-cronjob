const classNameToSnakeUpperCase = (className) => {
	if (!className) {
		return '';
	}
	return className
		.replace(/([A-Z])/g, '_$1')
		.toUpperCase()
		.slice(1);
};

module.exports = { classNameToSnakeUpperCase };
