class NoErrorThrownError extends Error {}
const getError = async (call) => {
	try {
		await call();

		throw new NoErrorThrownError();
	} catch (error) {
		return error;
	}
};
const testError = async (testF, type, errorMessage, extraChecks = []) => {
	const error = await getError(testF);

	await expect(error).not.toBeInstanceOf(NoErrorThrownError);
	await expect(error).toBeInstanceOf(type);
	await expect(error).toBeDefined();
	await expect(error.message).toBe(errorMessage);
	if (extraChecks) {
		const promises = extraChecks.map(async (fn) => fn(error));
		await Promise.all(promises);
	}
};

module.exports = {
	testError,
};
