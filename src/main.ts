import app from "./app";
import popup from "./popup";
import view from "./view";

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