import hooks from "./hooks";
import pts from "./pts";
import app from "./app";
import popup from "./popup";
import aabb2 from "./aabb2";

import createGraph from 'ngraph.graph';
import ngraphPath from 'ngraph.path';

/*
useful node based path finder with city examples
https://github.com/anvaka/ngraph.graph
*/

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
		[[1077, 545], [1219, 588], 'Nydal'],
	],
	places: [
		[false, [995, 326], 'New Clarks'],
		[true, [947, 447], 'Brock'],
		[false, [667, 570], 'Ludwig'],
		[false, [658, 874], 'Callaway'],
		[true, [916, 957], 'Dent'],
		[false, [1142, 997], 'Mason'],
		[false, [1134, 833], 'Branville'],
		[true, [1063, 744], 'Nydal'],
		[false, [982, 601], 'Everlyn'],
	]
}

const map_size: vec2 = [2048, 1536];

let map_division = 0.5;

class world_map {
	static instance?: world_map
	popup: popup;
	selectedLabel?: label_image
	selectedPlace?: label
	map: map = green
	graph = createGraph()
	path
	info
	dragging = false
	world_map
	world_map_inner
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
		this.setup_graph();
		this.search();
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
		this.world_map_inner.style.zoom = `${map_division}`;
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
	}
	populate() {
		this.info = document.createElement('x-world-map-info');
		const x_main_area = document.querySelector('x-main-area')!;
		x_main_area.append(this.info);

		//for (const region of this.map.regions) {
		//	let labe = new label_image(this, region);
		//}
		for (const place of this.map.places) {
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
	setup_graph() {
		this.graph = createGraph();

		// Our graph has cities:

		for (const place of this.map.places) {
			this.graph.addNode(place[2], { x: place[1][0], y: place[1][1] });
		}

		// road between nydal and everlyn
		this.graph.addNode('Three-way junction 0', { x: 1028, y: 746 });
		this.graph.addNode('Node 2', { x: 1034, y: 761 });
		this.graph.addNode('Node 3', { x: 1023, y: 637 });
		this.graph.addNode('Node 4', { x: 1016, y: 571 });
		this.graph.addNode('Node 5', { x: 995, y: 521 });
		this.graph.addLink('Nydal', 'Three-way junction 0');
		this.graph.addLink('Three-way junction 0', 'Node 2');
		this.graph.addLink('Node 2', 'Node 3');
		this.graph.addLink('Node 3', 'Node 4');
		this.graph.addLink('Node 4', 'Node 5');
		// junctions at brock
		this.graph.addNode('Three-way junction 1', { x: 989, y: 489 });
		this.graph.addNode('Three-way junction 2', { x: 964, y: 494 });
		this.graph.addLink('Node 5', 'Three-way junction 1');
		this.graph.addLink('Three-way junction 1', 'Three-way junction 2');
		this.graph.addNode('Node 6', { x: 961, y: 482 });
		this.graph.addNode('Node 7', { x: 962, y: 471 });
		this.graph.addNode('Node 8', { x: 952, y: 460 });
		this.graph.addLink('Three-way junction 2', 'Node 6');
		this.graph.addLink('Node 6', 'Node 7');
		this.graph.addLink('Node 7', 'Node 8');
		this.graph.addLink('Node 8', 'Brock');

		/*this.graph.addNode('NYC', { x: 0, y: 0 });
		this.graph.addNode('Boston', { x: 1, y: 1 });
		this.graph.addNode('Philadelphia', { x: -1, y: -1 });
		this.graph.addNode('Washington', { x: -2, y: -2 });*/

		// and railroads:
		/*this.graph.addLink('NYC', 'Boston');
		this.graph.addLink('NYC', 'Philadelphia');
		this.graph.addLink('Philadelphia', 'Washington');*/
	}
	search() {
		let pathFinder = ngraphPath.aStar(this.graph, {
			distance(fromNode, toNode) {
				// In this case we have coordinates. Lets use them as
				// distance between two nodes:
				let dx = fromNode.data.x - toNode.data.x;
				let dy = fromNode.data.y - toNode.data.y;

				return Math.sqrt(dx * dx + dy * dy);
			},
			heuristic(fromNode, toNode) {
				// this is where we "guess" distance between two nodes.
				// In this particular case our guess is the same as our distance
				// function:
				let dx = fromNode.data.x - toNode.data.x;
				let dy = fromNode.data.y - toNode.data.y;

				return Math.sqrt(dx * dx + dy * dy);
			}
		});
		this.path = pathFinder.find('Nydal', 'Brock');
		this.path = this.path.reverse();
		this.plySeg = 0;
		console.log(`path`, this.path);
	}
	plySeg = 0
	timer = 0
	step() {
		const ply = this.ply;
		//console.log('ply', ply);
		if (ply && this.path) {
			this.timer += app.delta;
			if (this.timer >= 1) {
				console.log('step');
				
				this.timer = 0;
				if (this.plySeg < this.path.length - 1)
					this.plySeg++;
				const { data } = this.path[this.plySeg];
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
		this.friend.world_map.append(this.el);
	}
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
		this.el.innerHTML = this.tuple[2];
		let pos = pts.clone(this.tuple[1]);
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