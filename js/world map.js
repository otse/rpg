import hooks from "./hooks";
import pts from "./pts";
import app from "./app";
import popup from "./popup";
import aabb2 from "./aabb2";
import pathfinder from "./pathfinder";
export var places = [
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
const map_size = [2048, 1536];
let map_division = 0.5;
class world_map {
    static instance;
    popup;
    selectedPlace;
    info;
    dragging = false;
    world_map;
    world_map_inner;
    ply;
    static pos = [542, 306];
    drag_start = [0, 0];
    drag = [0, 0];
    x_text;
    onmouseup;
    onmousemove;
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
            };
            this.onmouseup = (e) => {
                this.dragging = false;
                this.world_map.classList.remove('dragging');
            };
            this.onmousemove = (e) => {
                if (this.dragging) {
                    world_map.pos = pts.subtract(this.drag_start, app.mouse());
                    this.reposition();
                }
            };
            this.world_map.onmousedown = this.world_map.ontouchstart = (e) => {
                let pos = app.mouse();
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
            };
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
        const x_main_area = document.querySelector('x-main-area');
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
    plySeg = 0;
    timer = 0;
    step() {
        let path = pathfinder.search(travel.from, travel.to);
        if (!path.length)
            return;
        const ply = this.ply;
        if (ply && path.length > 1) {
            this.timer += app.delta;
            if (this.timer >= 1) {
                console.log(path);
                console.log('step');
                this.timer = 0;
                const node = path[1];
                const { id, data } = node;
                travel.from = id;
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
    friend;
    el;
    pos = [1063, 744];
    constructor(friend) {
        this.friend = friend;
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
const travel = {
    from: 'Nydal',
    to: 'Brock'
};
class label {
    friend;
    tuple;
    el;
    constructor(friend, tuple) {
        this.friend = friend;
        this.tuple = tuple;
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
        };
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
// old code for fantasy labels
class label_image {
    friend;
    tuple;
    el;
    constructor(friend, tuple) {
        this.friend = friend;
        this.tuple = tuple;
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
        };
        this.el.onmouseover = () => {
            this.select();
        };
        this.el.onmouseout = () => {
            //if (this.friend.selectedLabel != this)
            this.unselect();
        };
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
