import hooks from "./hooks";
import pts from "./pts";
import app from "./app";
import popup from "./popup";
import aabb2 from "./aabb2";

interface map {
	name: string
	regions: [min: vec2, max: vec2, name: string][]
}

var green: map = {
	name: 'map.jpg',
	regions: [
		//[[300, 300], [2048 - 500, 1536 - 600], 'Desert'],
		//[[700, 346], [2048 - 500, 1536 - 600], 'Desert'],
		[[707, 346], [900, 434], 'Desert'],
		[[1071, 538], [1222, 609], 'Shire'],
		[[1165, 616], [1253, 650], 'Forest'],
	]
}

const map_size: vec2 = [2048, 1536];

const map_division = 3;

class world_map {
	static instance?: world_map
	popup: popup;
	map: map = green
	dragging = false
	world_map
	world_map_inner
	pos: vec2 = [0, 0]
	drag_start: vec2 = [0, 0]
	drag: vec2 = [0, 0]
	onmouseup
	onmousemove
	static request_popup() {
		if (!world_map.instance) {
			world_map.instance = new world_map;
		}
		else {
			world_map.instance.popup.pos = [0, 0];
			world_map.instance.popup.reposition();
		}
	}
	constructor() {
		this.popup = new popup({
			class: 'world-map',
			title: 'World Map',
			zIndex: 2,
			onclose: () => { world_map.instance = undefined; this.destroy(); }
		});
		this.popup.content_inner.innerHTML = `
			<x-text>
				Here you can travel.
			</x-text>
			<x-horz></x-horz>
			<x-world-map>
				<x-world-map-inner>
				</x-world-map-inner>
			</x-world-map>
		`;
		this.world_map = this.popup.content_inner.querySelector('x-world-map');
		this.world_map_inner = this.popup.content_inner.querySelector('x-world-map-inner');
		/*this.world_map.ontouchmove = (e) => {
			e.preventDefault();
		}*/
		//width: calc(2048px/3);
		//height: calc(1536px/3);
		//
		if (!app.mobile) {
			this.world_map.onscroll = (e) => {
				this.reposition();
			}
			this.onmouseup = (e) => {
				this.dragging = false;
				this.world_map.classList.remove('dragging');
			}
			this.onmousemove = (e) => {
				if (this.dragging) {
					this.pos = pts.subtract(this.drag_start, app.mouse());
					this.reposition();
				}
			}
			this.world_map.onmousedown = this.world_map.ontouchstart = (e) => {
				let pos: vec2 = app.mouse();
				if (e.clientX) {
					pos[0] = e.clientX;
					pos[1] = e.clientY;
				}
				else {
					pos[0] = e.pageX;
					pos[1] = e.pageY;
				}
				this.drag_start = pts.add(pos, this.pos);
				this.world_map.classList.add('dragging');
				this.dragging = true;
			}
			hooks.register('onmouseup', this.onmouseup);
			hooks.register('onmousemove', this.onmousemove);
		}
		this.populate();
		this.popup.attach();
	}
	populate() {
		for (let region of this.map.regions) {
			const el = document.createElement('x-region');
			let aabb = new aabb2(region[0], region[1]);
			const diag = pts.divide(aabb.diagonal(), map_division);
			const min = pts.divide(aabb.min, map_division);
			el.style.width = `${diag[0]}px`;
			el.style.height = `${diag[1]}px`;
			el.style.top = `${min[1]}px`;
			el.style.left = `${min[0]}px`;
			const map_size_scaled = pts.divide(map_size, map_division);
			//const div = pts.divide(map_size_scaled, diag[0], diag[1]);
			//const bg = pts.mult(map_size_scaled, div[0], div[1]);
			const bg = map_size_scaled;
			// how many times can our region fit into map
			console.log('div', bg);

			el.style.backgroundSize = `${bg[0]}px ${bg[1]}px`;

			el.style.backgroundPositionX = `-${min[0]}px`;
			el.style.backgroundPositionY = `-${min[1]}px`;
			el.onmouseover = () => {
				console.log('aabb', aabb);

				el.style.backgroundImage = `url(img/map_hover.jpg)`;

			}
			el.onmouseout = () => {
				el.style.backgroundImage = ``;
			}
			this.world_map.append(el);
		}
	}
	reposition() {
		const el = this.world_map;
		const maxWidth = Math.max(el.clientWidth, el.scrollWidth, el.offsetWidth) - el.clientWidth;
		const maxHeight = Math.max(el.clientHeight, el.scrollHeight, el.offsetHeight) - el.clientHeight;

		this.pos = pts.clamp(this.pos, [0, 0], [maxWidth, maxHeight]);

		//console.log('reposition world-map', this.pos);
		this.world_map.scrollLeft = this.pos[0];
		this.world_map.scrollTop = this.pos[1];
	}
	destroy() {
		console.log('destroy the world map');

		hooks.unregister('onmousemove', this.onmousemove);
		hooks.unregister('onmouseup', this.onmouseup);
	}
}

export default world_map;