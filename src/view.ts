import app from "./app.js";
import character from "./character.js";
import dropdown from "./dropdown.js";
import third from "./terminal.js";
import world_map from "./world map.js";

class view {
	dropdown
	constructor() {
		const handler = (tuple) => {
			console.log(tuple);
			switch(tuple[0]) {
				case 0:
					character.request_popup();
					break;
				case 1:
					world_map.request_popup();
					break;
				case 2:
					third.request_popup();
					break;
			}
		};
		this.dropdown = new dropdown({
			class: 'view',
			button: 'View',
			options: [
				[0, 'Character'],
				[1, 'World Map'],
				[2, 'Terminal']
			],
			handler: handler
		});
		const destination = document.querySelector('x-top-bar-inner x-view-destination');
		this.dropdown.attach(destination);
	}
}

export default view;