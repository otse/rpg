import app from "./app";
import character from "./character";
import dropdown from "./dropdown";
import third from "./third";
import world_map from "./world map";

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
				[2, 'Third']
			],
			handler: handler
		});
		const destination = document.querySelector('x-top-bar-inner x-dropdown-destination');
		this.dropdown.attach(destination);
	}
}

export default view;