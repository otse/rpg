import app from "./app";
import popup from "./popup";

class world_map {
	static popup?: popup;
	static request_popup() {
		if (!world_map.popup) {
			world_map.popup = new popup({
				class: 'world-map',
				title: 'World Map',
				zIndex: 2,
				onclose: () => { world_map.popup = undefined }
			});
			world_map.popup.content_inner.innerHTML = `
				<x-world-map></x-world-map>
			`;
			world_map.popup.attach();
		}
		else
		{
			world_map.popup.pos = [0, 0];
			world_map.popup.reposition();
		}
	}
}

export default world_map;