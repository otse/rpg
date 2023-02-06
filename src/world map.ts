import hooks from "./hooks";
import pts from "./pts";
import app from "./app";
import popup from "./popup";
import aabb2 from "./aabb2";

type region = [min: vec2, max: vec2, name: string]
type place = [large: boolean, pos: vec2, name: string]

interface map {
	name: string
	regions: region[]
	places: place[]
}

var green: map = {
	name: 'map.jpg',
	regions: [
		/*
		[[1077, 545], [1219, 588], 'Shire'],
		[[1260, 616], [1352, 642], 'Forest'],
		[[1505, 612], [1591, 631], 'Outlands'],
		[[603, 403], [905, 450], 'Dunes of Seif'],
		[[853, 625], [949, 660], 'Rocky Passage'],
		[[459, 706], [603, 728], 'Salt Plains'],
		[[1118, 779], [1194, 856], 'Green Hike'],
		[[1039, 1029], [1205, 1069], 'Alrond'],
		[[1279, 879], [1415, 936], 'Temple of Time'],
		[[801, 1068], [908, 1087], 'Footy Trail'],
		[[465, 1044], [655, 1090], 'Bogged Gorge'],
		*/
		[[1077, 545], [1219, 588], 'Nydal'],
	],
	places: [
		[false, [995, 326], 'New Clarks'],
		[true, [947, 447], 'Brock'],
		[false, [667, 570], 'Ludwig'],
		[false, [658, 874], 'Callaway'],
		[true, [916, 962], 'Dent'],
		[false, [1142, 997], 'Mason'],
		[false, [1134, 833], 'Branville'],
		[false, [1027, 746], 'Nydal'],
		[false, [982, 601], 'Everlyn'],
	]
}

const map_size: vec2 = [2048, 1536];

const map_division = 2;

class world_map {
	static instance?: world_map
	popup: popup;
	selectedLabel?: label
	selectedPlace?: place_text
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
			<x-top>
				<x-text>
					Selected: None
				</x-text>
			</x-top>
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
		for (const place of this.map.places) {
			let tex = new place_text(this, place);
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

class place_text {
	el
	constructor(
		public readonly friend: world_map,
		public readonly tuple: place
	) {
		console.log('new text');
		
		this.create();
	}
	create() {
		this.el = document.createElement('x-place');
		this.el.innerHTML = this.tuple[2];
		let pos = pts.clone(this.tuple[1]);
		pos = pts.divide(pos, map_division);
		this.attach();
		pos = pts.subtract(pos, [0, 0]);
		const rect = this.el.getBoundingClientRect();
		console.log('rect', rect);
		
		console.log('width', rect.width);
		
		this.el.style.top = `${pos[1]}px`;
		this.el.style.left = `${pos[0]}px`;

		this.el.onclick = () => {
			this.friend.selectedPlace?.unselect();
			this.select();
			this.friend.selectedPlace = this;
			this.friend.x_text.innerHTML = `Selected: ${this.tuple[2]}`;
		}
	}
	attach() {
		this.friend.world_map.append(this.el);
	}
	select() {
		this.el.classList.add('selected');
	}
	unselect() {
		this.el.classList.remove('selected');
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
		const shrink_grow = 10;
		this.el = document.createElement('x-region');
		let aabb = new aabb2(this.tuple[0], this.tuple[1]);
		aabb.min = pts.add(aabb.min, [-shrink_grow, -shrink_grow]);
		aabb.max = pts.add(aabb.max, [shrink_grow, shrink_grow]);
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
			this.friend.selectedLabel?.unselect();
			this.select();
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