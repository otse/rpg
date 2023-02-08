import app from "./app";
import main from "./main";
import popup from "./popup";
import view from "./view";
import world_map from "./world map";

// fantasy:
// https://www.artstation.com/artwork/Z580PG
// https://www.artstation.com/artwork/GXnEN3
// post apo:
// https://www.artstation.com/artwork/68ax80
// https://www.artstation.com/artwork/q2doy
// https://www.artstation.com/artwork/1xQkG
// https://www.artstation.com/artwork/5B6KxW

namespace rpg {
	export function init() {
		console.log(' init ');
		
		world_map.init();
		popup.init();
		main.init();
		app;
		new view;

	}

	export function step() {
		
	}

	
}

export default rpg;