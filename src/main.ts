import app from "./app.js";
import popup from "./web/popup.js";
import view from "./view.js";

namespace main {
	let content_inner

	export function init() {
		console.log(' init ');
		
		content_inner = document.querySelector('x-window.persist x-window-content-inner');

		console.log('content inner', content_inner);

		rewrite();
	}

	export function step() {
		
	}

	export function rewrite() {

		content_inner.innerHTML = `
			You are at { location }
		`
	}
	
}

export default main;