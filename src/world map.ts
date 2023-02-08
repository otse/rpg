import hooks from "./hooks";
import pts from "./pts";
import app from "./app";
import popup from "./popup";
import aabb2 from "./aabb2";
import pathfinder from "./pathfinder";

/*
useful node based path finder with city examples
https://github.com/anvaka/ngraph.graph
*/

export type region = [min: vec2, max: vec2, name: string]
export type place = [pos: vec2, name: string, large: boolean]

export var places: place[] = [
	[[995, 326], 'New Clarks', false],
	[[947, 447], 'Brock', true],
	[[667, 570], 'Ludwig', false],
	[[658, 874], 'Callaway', false],
	[[916, 957], 'Dent', true],
	[[1142, 997], 'Mason', false],
	[[1134, 833], 'Branville', false],
	[[1063, 744], 'Nydal', true],
	[[982, 601], 'Everlyn', false],
	[[723, 290], 'Nook', false],
	[[1117, 192], 'Bell', false],
];

const map_size: vec2 = [2048, 1536];

let map_division = 0.5;

class world_map {
	static instance?: world_map
	popup: popup
	selectedPlace?: label
	info
	dragging = false
	world_map
	world_map_scaler
	world_map_graphic
	ply?: flag
	static pos: vec2 = [542, 306]
	drag_start: vec2 = [0, 0]
	drag: vec2 = [0, 0]
	x_text
	onmouseup
	onmousemove
	static init() {
		world_map.register();

		if (!app.mobile) {
			// pixel perfection on mobile results in very tiny image
			const dpi = window.devicePixelRatio;
			map_division = 1 / dpi;
			console.log('map division', map_division);
		}
		window['world_map'] = world_map;
	}
	static step() {
		world_map.instance?.step();
		return false;
	}
	static request_popup() {
		if (!world_map.instance) {
			world_map.instance = new world_map;
		}
		else {
			world_map.instance.popup.pos = [0, 0];
			world_map.instance.popup.reposition();
		}
	}
	static register() {
		console.log('register rpgStep');

		hooks.register('rpgStep', world_map.step);
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
				<x-world-map-scaler>
					<x-world-map-graphic>
					</x-world-map-graphic>
				</x-world-map-scaler>
			</x-world-map>
		`;
		this.x_text = this.popup.content_inner.querySelector('x-text');
		this.world_map = this.popup.content_inner.querySelector('x-world-map');
		this.world_map_scaler = this.popup.content_inner.querySelector('x-world-map-scaler');
		this.world_map_graphic = this.popup.content_inner.querySelector('x-world-map-graphic');
		this.world_map_graphic.style.zoom = `${map_division}`;
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
		this.ply = new flag(this);
		this.populate();
		this.popup.attach();
		this.reposition();
		this.add_svg();
	}
	add_svg() {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttributeNS(null, 'viewBox', '0 0 20 15');
		svg.innerHTML = `<path d="M 10.375 7.277 C 10.302 7.274 10.294 7.295 10.205 7.278 C 10.115 7.264 10.101 7.282 10.032 7.285 C 10.0503 7.0727 10.0717 6.8553 10.093 6.638 C 10.114 6.434 9.997 6.382 9.991 6.185 C 9.9837 6.0597 9.9723 5.9403 9.965 5.817 M 9.59 5.876 C 9.695 5.887 9.703 5.856 9.771 5.858 C 9.844 5.854 9.872 5.816 9.965 5.814 C 9.953 5.665 9.923 5.466 9.829 5.357 C 9.736 5.258 9.663 4.994 9.649 4.776 M 10.61 2.121 L 10.275 2.02 L 10.084 1.987 L 9.831 1.973 L 9.581 1.959 L 9.257 1.949 C 9.15 1.947 9.061 1.949 8.977 1.981 L 8.386 2.259 L 8.003 2.445 C 7.865 2.514 7.59 2.767 7.417 2.962 C 7.375 2.904 7.336 2.868 7.265 2.854 C 7.203 2.848 7.155 2.857 7.066 2.841 M 7.415 2.967 C 7.366 3.041 7.398 3.086 7.372 3.153 C 7.333 3.249 7.341 3.347 7.368 3.408 C 7.392 3.484 7.413 3.465 7.428 3.531 C 7.455 3.607 7.547 3.654 7.61 3.667 C 7.771 3.662 7.795 3.701 7.893 3.732 C 8.094 3.795 8.175 3.79 8.297 3.783 C 8.449 3.774 8.571 3.727 8.692 3.681 C 8.814 3.632 8.907 3.593 9.075 3.584 C 9.282 3.582 9.4303 3.6333 9.613 3.664 C 9.607 3.572 9.616 3.503 9.657 3.449 C 9.719 3.362 9.719 3.324 9.721 3.188 M 9.616 3.664 C 9.756 3.679 9.855 3.718 9.936 3.803 M 10.907 1.876 C 10.862 1.921 10.685 1.874 10.68 1.983 C 10.68 2.064 10.633 2.047 10.613 2.122 L 10.834 2.192 C 10.897 2.219 10.929 2.272 10.934 2.356 L 10.948 2.812 C 10.939 2.94 10.917 3.006 10.844 3.053 L 10.286 3.362 C 10.165 3.422 10.087 3.506 10.03 3.589 C 9.982 3.656 9.955 3.731 9.939 3.805 C 9.907 3.931 9.874 4.231 9.823 4.343 C 9.766 4.499 9.701 4.661 9.649 4.776 C 9.558 4.789 9.503 4.819 9.42 4.83 M 9.266 4.375 C 9.278 4.554 9.397 4.545 9.386 4.635 C 9.373 4.724 9.421 4.781 9.419 4.83 C 8.744 4.957 8.934 5.149 8.672 5.186 C 8.454 5.217 8.2993 5.1827 8.113 5.181 C 7.939 5.171 7.856 5.207 7.731 5.202 C 7.576 5.205 7.452 5.289 7.347 5.326 C 7.237 5.37 7.199 5.337 7.114 5.371 C 6.973 5.427 6.956 5.52 6.947 5.586 M 6.502 5.56 L 6.596 5.556 C 6.675 5.558 6.682 5.588 6.731 5.593 C 6.808 5.612 6.816 5.571 6.949 5.602 C 6.953 5.75 6.919 5.789 6.918 5.875 C 6.919 5.974 7.03 6.039 7.023 6.153 C 7.02 6.257 6.97 6.267 6.969 6.388 C 6.969 6.447 6.887 6.465 6.885 6.57 C 6.874 6.787 6.948 6.767 6.94 6.934 C 7.165 6.942 7.305 7.013 7.514 7.015 C 7.671 7.016 7.79 7.032 7.922 7.063 C 8.065 7.094 8.194 7.16 8.343 7.177 C 8.48 7.198 8.591 7.202 8.718 7.19 C 8.911 7.166 9.055 7.178 9.22 7.198 C 9.369 7.224 9.501 7.273 9.633 7.287 C 9.73 7.287 9.815 7.307 9.942 7.298 C 9.9707 7.296 9.9993 7.294 10.031 7.293 C 10.053 7.428 10.046 7.585 10.066 7.719 C 10.095 7.882 10.1007 8.0477 10.121 8.201 M 11.075 8.144 C 10.846 8.148 10.758 8.2 10.624 8.203 C 10.581 8.201 10.579 8.162 10.515 8.161 C 10.447 8.16 10.407 8.202 10.335 8.203 L 10.121 8.21 C 10.1327 8.3993 10.1473 8.5867 10.172 8.768 C 10.1863 8.9323 10.2007 9.0967 10.215 9.261 L 10.191 9.392 C 10.276 9.4 10.33 9.402 10.403 9.427 C 10.503 9.452 10.481 9.515 10.562 9.552 C 10.618 9.578 10.645 9.555 10.723 9.586 C 10.793 9.61 10.792 9.583 10.885 9.61 C 10.987 9.639 11.0637 9.6927 11.158 9.736 M 10.192 9.398 C 10.19 9.444 10.168 9.446 10.096 9.462 C 10.011 9.485 9.932 9.499 9.834 9.491 C 9.726 9.489 9.66 9.539 9.541 9.533 C 9.376 9.53 9.289 9.406 8.985 9.53 L 8.941 9.342 M 8.979 9.532 C 8.913 9.547 8.844 9.607 8.755 9.584 C 8.603 9.55 8.45 9.443 8.288 9.363 C 8.117 9.28 7.941 9.262 7.769 9.161 C 7.636 9.077 7.529 8.948 7.439 8.856 C 7.3213 8.7143 7.149 8.795 7.095 8.432 M 6.429 8.529 L 6.652 8.491 L 6.827 8.452 C 6.9317 8.4313 6.986 8.454 7.093 8.424 C 7.069 8.257 7.051 8.093 7.017 7.929 C 6.994 7.778 7.036 7.718 6.952 7.442 C 6.914 7.296 6.912 7.108 6.94 6.934" opacity="0.4" stroke="#FFFFFF" stroke-width="0.02" fill="none"/>`;
		this.world_map_graphic.append(svg);
		//this.popup.content_inner.append(svg);
	}
	populate() {
		this.info = document.createElement('x-world-map-info');
		const x_main_area = document.querySelector('x-main-area')!;
		x_main_area.append(this.info);

		//for (const region of this.map.regions) {
		//	let labe = new label_image(this, region);
		//}
		for (const place of places) {
			let text = new label(this, place);
		}
	}
	reposition() {

		const el = this.world_map;
		const maxWidth = Math.max(el.clientWidth, el.scrollWidth, el.offsetWidth) - el.clientWidth;
		const maxHeight = Math.max(el.clientHeight, el.scrollHeight, el.offsetHeight) - el.clientHeight;

		world_map.pos = pts.clamp(world_map.pos, [0, 0], [maxWidth, maxHeight]);
		//console.log('clamp', world_map.pos);

		//console.log('reposition world-map', this.pos);
		this.world_map.scrollLeft = world_map.pos[0];
		this.world_map.scrollTop = world_map.pos[1];
	}
	destroy() {
		console.log('destroy the world map');

		hooks.unregister('onmousemove', this.onmousemove);
		hooks.unregister('onmouseup', this.onmouseup);
	}

	plySeg = 0
	timer = 0
	step() {
		let path = pathfinder.search(travel.from, travel.to);
		if (!path.length)
			return;
		const ply = this.ply;
		if (ply && path.length > 1) {
			this.timer += app.delta;
			if (this.timer >= 1) {
				this.timer = 0;
				const node = path[1];
				const { id, data } = node;
				travel.from = id as string;
				console.log('travel', travel);
				ply.pos = [data.x, data.y];
				ply.update();
			}
		}
		ply?.update();
		return false;
	}
}

class flag {
	el
	pos: vec2 = [1063, 744]
	constructor(
		public readonly friend: world_map
	) {
		this.el = document.createElement('x-flag');
		this.update();
		this.attach();
	}
	update() {
		let pos = pts.mult(this.pos, map_division);
		this.el.style.top = `${pos[1]}px`;
		this.el.style.left = `${pos[0]}px`;
	}
	attach() {
		this.friend.world_map_scaler.append(this.el);
	}
}
const travel = {
	from: 'Nydal',
	to: 'Brock'
}
class label {
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
		if (this.tuple[0])
			this.el.classList.add('large');
		this.el.innerHTML = this.tuple[1];
		let pos = pts.clone(this.tuple[0]);
		pos = pts.mult(pos, map_division);
		this.attach();
		pos = pts.subtract(pos, [0, 0]);
		//const rect = this.el.getBoundingClientRect();
		//console.log('rect', rect);
		//console.log('width', rect.width);

		this.el.style.top = `${pos[1]}px`;
		this.el.style.left = `${pos[0]}px`;

		this.el.onclick = () => {
			this.friend.selectedPlace?.unselect();
			this.select();
			travel.to = this.tuple[1];
			this.friend.selectedPlace = this;
			this.friend.x_text.innerHTML = `Selected: ${this.tuple[1]}`;
		}
	}
	attach() {
		this.friend.world_map_scaler.append(this.el);
	}
	select() {
		this.el.classList.add('selected');
	}
	unselect() {
		this.el.classList.remove('selected');
	}
}

// old code for fantasy labels
class label_image {
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
		const diag = pts.mult(aabb.diagonal(), map_division);
		const min = pts.mult(aabb.min, map_division);
		const map_size_scaled = pts.mult(map_size, map_division);
		this.el.style.width = `${diag[0]}px`;
		this.el.style.height = `${diag[1]}px`;
		this.el.style.top = `${min[1]}px`;
		this.el.style.left = `${min[0]}px`;
		this.el.style.backgroundPositionX = `-${min[0]}px`;
		this.el.style.backgroundPositionY = `-${min[1]}px`;
		this.el.style.backgroundSize = `${map_size_scaled[0]}px ${map_size_scaled[1]}px`;

		this.el.onclick = () => {
			//this.friend.selectedLabel?.unselect();
			this.select();
			//this.friend.selectedLabel = this;
			this.friend.x_text.innerHTML = `Selected: ${this.tuple[2]}`;
		}
		this.el.onmouseover = () => {
			this.select();
		}
		this.el.onmouseout = () => {
			//if (this.friend.selectedLabel != this)
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