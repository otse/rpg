import app from "./app";
import popup from "./popup";
import view from "./view";

// https://www.artstation.com/artwork/Z580PG
// https://www.artstation.com/artwork/GXnEN3

namespace rpg {
	export function init() {
		console.log(' init ');
		
		popup.init();
		app;
		new view;

	}

	export function step() {
		
	}

	
}

export default rpg;