const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'js/app.js',
	output: {
		name: 'rpg',
		file: 'bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: false,
		globals: { }
	}
};