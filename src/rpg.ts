import app from "./app.js";
import { hooks } from "./lib/hooks.js";
import main from "./main.js";
import popup from "./web/popup.js";
import view from "./view.js";
import world_map from "./web/world map.js";
import slideshow from "./web/slideshow.js";

// fantasy:
// https://www.artstation.com/artwork/Z580PG
// https://www.artstation.com/artwork/GXnEN3
// post apo:
// https://www.artstation.com/artwork/68ax80
// https://www.artstation.com/artwork/q2doy
// https://www.artstation.com/artwork/1xQkG
// https://www.artstation.com/artwork/5B6KxW

namespace rpg {
	
	export function sample(a) {
		return a[Math.floor(Math.random() * a.length)];
	}

	export function clamp(val, min, max) {
		return val > max ? max : val < min ? min : val;
	}

	export function init() {
		console.log(' init ');
		
		world_map.init();
		slideshow.init();
		popup.init();
		main.init();
		app;

		new view;

	}

	export function step() {
		hooks.emit('wcrpgStep', 0);
	}
	
}

export default rpg;