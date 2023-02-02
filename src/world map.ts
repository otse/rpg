import hooks from "./hooks";
import pts from "./pts";
import app from "./app";
import popup from "./popup";
import aabb2 from "./aabb2";

type region = [min: vec2, max: vec2, name: string]
interface map {
	name: string
	regions: region[]
}

var green: map = {
	name: 'map.jpg',
	regions: [
		//[[300, 300], [2048 - 500, 1536 - 600], 'Desert'],
		//[[700, 346], [2048 - 500, 1536 - 600], 'Desert'],
		[[707, 346], [900, 434], 'Desert'],
		[[1071, 538], [1222, 609], 'Shire'],
		[[1257, 613], [1560, 646], 'Forest'],
		[[809, 616], [1007, 663], 'Rocky Passage'],
	]
}

const map_size: vec2 = [2048, 1536];

const map_division = 2;

class world_map {
	static instance?: world_map
	popup: popup;
	selectedLabel?: label
	map: map = green
	info
	dragging = false
	world_map
	world_map_inner
	static pos: vec2 = [0, 0]
	drag_start: vec2 = [0, 0]
	drag: vec2 = [0, 0]
	x_text
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
		console.log(world_map.pos);

		this.popup = new popup({
			class: 'world-map',
			title: 'World Map',
			zIndex: 2,
			onclose: () => { world_map.instance = undefined; this.destroy(); }
		});
		this.popup.content_inner.innerHTML = `
			<x-text>
				Selected: None
			</x-text>
			<x-horz></x-horz>
			<x-world-map>
				<x-world-map-inner>
				</x-world-map-inner>
			</x-world-map>
		`;
		this.x_text = this.popup.content_inner.querySelector('x-text');
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
					world_map.pos = pts.subtract(this.drag_start, app.mouse());
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
				this.drag_start = pts.add(pos, world_map.pos);
				this.world_map.classList.add('dragging');
				this.dragging = true;
			}
			hooks.register('onmouseup', this.onmouseup);
			hooks.register('onmousemove', this.onmousemove);
		}
		this.populate();
		this.popup.attach();
		this.reposition();
	}
	populate() {
		this.info = document.createElement('x-world-map-info');
		const x_main_area = document.querySelector('x-main-area')!;
		x_main_area.append(this.info);

		for (const region of this.map.regions) {
			let labe = new label(this, region);
		}
	}
	reposition() {

		const el = this.world_map;
		const maxWidth = Math.max(el.clientWidth, el.scrollWidth, el.offsetWidth) - el.clientWidth;
		const maxHeight = Math.max(el.clientHeight, el.scrollHeight, el.offsetHeight) - el.clientHeight;

		world_map.pos = pts.clamp(world_map.pos, [0, 0], [maxWidth, maxHeight]);
		console.log('clamp', world_map.pos);

		//console.log('reposition world-map', this.pos);
		this.world_map.scrollLeft = world_map.pos[0];
		this.world_map.scrollTop = world_map.pos[1];
	}
	destroy() {
		console.log('destroy the world map');

		hooks.unregister('onmousemove', this.onmousemove);
		hooks.unregister('onmouseup', this.onmouseup);
	}
}

class label {
	el
	constructor(
		public readonly friend: world_map,
		public readonly tuple: region
	) {
		this.create();
	}
	create() {
		this.el = document.createElement('x-region');
		let aabb = new aabb2(this.tuple[0], this.tuple[1]);
		const diag = pts.divide(aabb.diagonal(), map_division);
		const min = pts.divide(aabb.min, map_division);
		const map_size_scaled = pts.divide(map_size, map_division);
		this.el.style.width = `${diag[0]}px`;
		this.el.style.height = `${diag[1]}px`;
		this.el.style.top = `${min[1]}px`;
		this.el.style.left = `${min[0]}px`;
		this.el.style.backgroundPositionX = `-${min[0]}px`;
		this.el.style.backgroundPositionY = `-${min[1]}px`;
		this.el.style.backgroundSize = `${map_size_scaled[0]}px ${map_size_scaled[1]}px`;

		this.el.onclick = () => {
			this.select();
			this.friend.selectedLabel?.unselect();
			this.friend.selectedLabel = this;
			this.friend.x_text.innerHTML = `Selected: ${this.tuple[2]}`;
		}
		this.el.onmouseover = () => {
			this.select();
		}
		this.el.onmouseout = () => {
			if (this.friend.selectedLabel != this)
				this.unselect();
		}
		this.attach();
	}
	attach() {
		this.friend.world_map.append(this.el);
	}
	select() {
		this.el.style.backgroundImage = `url(img/map_hover.jpg)`;
	}
	unselect() {
		this.el.style.backgroundImage = ``;

	}
}

export default world_map;