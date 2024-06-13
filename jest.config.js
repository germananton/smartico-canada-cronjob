module.exports = {
	testEnvironment: 'node',
	testEnvironmentOptions: {
		NODE_ENV: 'test',
	},
	restoreMocks: true,
	testTimeout: 20000,
	coveragePathIgnorePatterns: [
		'node_modules',
		'src/config',
		'src/app.js',
		'tests',
	],
	coverageReporters: ['text', 'lcov', 'clover', 'html'],
	coverageDirectory: 'coverage',
};
