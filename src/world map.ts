import app from "./app";
import popup from "./popup";

class world_map {
	static instance?: world_map
	popup: popup;
	dragging = false
	static request_popup() {
		if (!world_map.instance) {
			world_map.instance = new world_map;
		}
		else
		{
			world_map.instance.popup.pos = [0, 0];
			world_map.instance.popup.reposition();
		}
	}
	constructor() {
		this.popup = new popup({
			class: 'world-map',
			title: 'World Map',
			zIndex: 2,
			onclose: () => { world_map.instance = undefined }
		});
		this.popup.content_inner.innerHTML = `
			<x-world-map></x-world-map>
		`;
		this.popup.attach();
	}
}

export default world_map;