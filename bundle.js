var rpg = (function (createGraph, ngraphPath) {
    'use strict';

    // inspired by gmod lua !
    class hooks {
        //static readonly table: { [name: string]: func[] } = {}
        //list: func[] = []
        static register(name, f) {
            if (!hooks[name])
                hooks[name] = [];
            hooks[name].push(f);
            return f;
        }
        static unregister(name, f) {
            hooks[name] = hooks[name].filter(e => e != f);
        }
        static call(name, x) {
            if (!hooks[name])
                return;
            for (let i = hooks[name].length; i--;)
                if (hooks[name][i](x))
                    return;
        }
    }

    class pts {
        static pt(a) {
            return { x: a[0], y: a[1] };
        }
        static clone(zx) {
            return [zx[0], zx[1]];
        }
        static make(n, m) {
            return [n, m];
        }
        static to_string(a, p) {
            const e = (i) => a[i].toFixed(p);
            return `${e(0)}, ${e(1)}`;
        }
        static fixed(a) {
            return [a[0]];
        }
        static func(bb, callback) {
            let y = bb.min[1];
            for (; y <= bb.max[1]; y++) {
                let x = bb.max[0];
                for (; x >= bb.min[0]; x--) {
                    callback([x, y]);
                }
            }
        }
        static project(a) {
            return [a[0] / 2 + a[1] / 2, a[1] / 4 - a[0] / 4];
        }
        static unproject(a) {
            return [a[0] - a[1] * 2, a[1] * 2 + a[0]];
        }
        static equals(a, b) {
            return a[0] == b[0] && a[1] == b[1];
        }
        //static range(a: vec2, b: vec2): boolean {
        //	return true 
        //}
        static clamp(a, min, max) {
            const clamp = (val, min, max) => val > max ? max : val < min ? min : val;
            return [clamp(a[0], min[0], max[0]), clamp(a[1], min[1], max[1])];
        }
        static floor(a) {
            return [Math.floor(a[0]), Math.floor(a[1])];
        }
        static ceil(a) {
            return [Math.ceil(a[0]), Math.ceil(a[1])];
        }
        static round(a) {
            return [Math.round(a[0]), Math.round(a[1])];
        }
        static inv(a) {
            return [-a[0], -a[1]];
        }
        static mult(a, n, m) {
            return [a[0] * n, a[1] * (m || n)];
        }
        static mults(a, b) {
            return [a[0] * b[0], a[1] * b[1]];
        }
        static divide(a, n, m) {
            return [a[0] / n, a[1] / (m || n)];
        }
        static divides(a, b) {
            return [a[0] / b[0], a[1] / b[1]];
        }
        static subtract(a, b) {
            return [a[0] - b[0], a[1] - b[1]];
        }
        static add(a, b) {
            return [a[0] + b[0], a[1] + b[1]];
        }
        static addn(a, b) {
            return [a[0] + b, a[1] + b];
        }
        static abs(a) {
            return [Math.abs(a[0]), Math.abs(a[1])];
        }
        static min(a, b) {
            return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
        }
        static max(a, b) {
            return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
        }
        static together(zx) {
            return zx[0] + zx[1];
        }
        static length_(a) {
            return a[0] * a[0] + a[1] * a[1];
        }
        // todo even and uneven are useless freak functions
        static uneven(a, n = -1) {
            let b = pts.clone(a);
            if (b[0] % 2 != 1) {
                b[0] += n;
            }
            if (b[1] % 2 != 1) {
                b[1] += n;
            }
            return b;
        }
        static even(a, n = -1) {
            let b = pts.clone(a);
            if (b[0] % 2 != 0) {
                b[0] += n;
            }
            if (b[1] % 2 != 0) {
                b[1] += n;
            }
            return b;
        }
        static angle(a, b) {
            return Math.atan2(a[0] - b[0], a[1] - b[1]);
        }
        static towards(angle, speed) {
            return [speed * Math.sin(angle), speed * Math.cos(angle)];
        }
        // https://vorg.github.io/pex/docs/pex-geom/Vec2.html
        static dist(a, b) {
            let dx = b[0] - a[0];
            let dy = b[1] - a[1];
            return Math.sqrt(dx * dx + dy * dy);
        }
        static distsimple(a, b) {
            let c = pts.abs(pts.subtract(a, b));
            return Math.max(c[0], c[1]);
        }
        ;
    }

    var main;
    (function (main) {
        let content_inner;
        function init() {
            console.log(' init ');
            content_inner = document.querySelector('x-window.persist x-window-content-inner');
            console.log('content inner', content_inner);
            rewrite();
        }
        main.init = init;
        function step() {
        }
        main.step = step;
        function rewrite() {
            content_inner.innerHTML = `
			You are at { location }
		`;
        }
        main.rewrite = rewrite;
    })(main || (main = {}));
    var main$1 = main;

    var TEST;
    (function (TEST) {
        TEST[TEST["Outside"] = 0] = "Outside";
        TEST[TEST["Inside"] = 1] = "Inside";
        TEST[TEST["Overlap"] = 2] = "Overlap";
    })(TEST || (TEST = {}));
    class aabb2 {
        static TEST = TEST;
        min;
        max;
        static dupe(bb) {
            return new aabb2(bb.min, bb.max);
        }
        constructor(a, b) {
            this.min = this.max = [...a];
            if (b) {
                this.extend(b);
            }
        }
        extend(v) {
            this.min = pts.min(this.min, v);
            this.max = pts.max(this.max, v);
        }
        diagonal() {
            return pts.subtract(this.max, this.min);
        }
        center() {
            return pts.add(this.min, pts.mult(this.diagonal(), 0.5));
        }
        translate(v) {
            this.min = pts.add(this.min, v);
            this.max = pts.add(this.max, v);
        }
        test(b) {
            if (this.max[0] < b.min[0] || this.min[0] > b.max[0] ||
                this.max[1] < b.min[1] || this.min[1] > b.max[1])
                return 0;
            if (this.min[0] <= b.min[0] && this.max[0] >= b.max[0] &&
                this.min[1] <= b.min[1] && this.max[1] >= b.max[1])
                return 1;
            return 2;
        }
    }

    var popups = [];
    class popup {
        options;
        static init() {
            /*
            hooks.register('animationFrame', (x) => {
                console.log('animation frame');
                
                for (const popup of popups)
                    popup.reposition();
                return false;
            });
            */
        }
        static on_top;
        pos = [0, 0];
        drag_start = [0, 0];
        drag = [0, 0];
        dragging = false;
        minimized = false;
        window;
        title_bar;
        content;
        content_inner;
        title_drag;
        min;
        close;
        index = 0;
        onmousemove;
        onmouseup;
        constructor(options) {
            this.options = options;
            popups.push(this);
            this.window = document.createElement('x-window');
            this.window.classList.add(options.class);
            this.window.style.zIndex = options.zIndex;
            this.window.innerHTML = `
			<x-title-bar>
				<x-title-bar-inner>
					<x-title>
						${options.title}
					</x-title>
					<x-button data-a="min" title="minimize">
						<x-button-inner>
							-
							<!-- &#8964; -->
						</x-button-inner>
					</x-button>
					<x-button data-a="close" title="close">
						<x-button-inner>
							x
						</x-button-inner>
					</x-button>
				</x-title-bar-inner>
			</x-title-bar>
			<x-window-content>
				<x-window-content-inner>
					
				</x-window-content-inner>
			</x-window-content>
		`;
            this.title_bar = this.window.querySelector('x-title-bar');
            this.content = this.window.querySelector('x-window-content');
            this.content_inner = this.window.querySelector('x-window-content x-window-content-inner');
            this.title_drag = this.window.querySelector('x-title-bar x-title');
            this.onmouseup = (e) => {
                this.dragging = false;
                this.title_bar.classList.remove('dragging');
            };
            this.onmousemove = (e) => {
                if (this.dragging) {
                    this.pos = pts.subtract(app$1.mouse(), this.drag_start);
                    let us = new aabb2([0, 0], [this.title_bar.clientWidth, this.title_bar.clientHeight]);
                    us.translate(this.pos);
                    const destination = document.querySelector('x-main-area');
                    let bound = new aabb2([0, 0], [destination.clientWidth, destination.clientHeight]);
                    const test = bound.test(us);
                    if (app$1.mobile && test == 0) {
                        this.pos = [0, 0];
                    }
                    this.reposition();
                }
            };
            hooks.register('onmouseup', this.onmouseup);
            hooks.register('onmousemove', this.onmousemove);
            this.title_drag.onmousedown = this.title_drag.ontouchstart = (e) => {
                let pos = app$1.mouse();
                if (e.clientX) {
                    pos[0] = e.clientX;
                    pos[1] = e.clientY;
                }
                else {
                    pos[0] = e.pageX;
                    pos[1] = e.pageY;
                }
                this.drag_start = pts.subtract(pos, this.pos);
                this.title_bar.classList.add('dragging');
                this.dragging = true;
                popup.handle_on_top(this);
            };
            this.close = this.window.querySelector('x-button[data-a="close"]');
            if (this.close)
                this.close.onclick = () => {
                    this.destroy();
                };
            this.min = this.window.querySelector('x-button[data-a="min"]');
            if (this.min)
                this.min.onclick = () => {
                    this.toggle_min();
                    popup.handle_on_top(this);
                };
            this.content.onclick = () => {
                popup.handle_on_top(this);
            };
            popup.handle_on_top(this);
            this.reposition();
            this.reindex();
        }
        static handle_on_top(wnd) {
            const total = popups.length;
            const { on_top } = popup;
            if (on_top) {
                wnd.index = on_top.index + 2;
                on_top.index = total;
            }
            else {
                wnd.index = total + 1;
            }
            popup.on_top = wnd;
            popups.sort((a, b) => a.index < b.index ? -1 : 1);
            for (let i = 0; i < popups.length; i++) {
                popups[i].index = i;
                popups[i].reindex();
            }
        }
        reindex() {
            const base_index = 2;
            this.window.style.zIndex = base_index + this.index;
        }
        reposition() {
            //console.log('reposition popup');
            this.window.style.top = this.pos[1];
            this.window.style.left = this.pos[0];
        }
        attach() {
            const destination = document.querySelector('x-main-area');
            destination?.append(this.window);
        }
        destroy() {
            hooks.unregister('onmousemove', this.onmousemove);
            hooks.unregister('onmouseup', this.onmouseup);
            this.window.remove();
            popups.splice(popups.indexOf(this), 1);
            this.options.onclose?.();
        }
        toggle_min() {
            this.minimized = !this.minimized;
            if (this.minimized) {
                this.content.style.display = 'none';
                //this.min.querySelector('x-button-inner').innerHTML = '+';
            }
            else {
                this.content.style.display = 'flex';
                //this.min.querySelector('x-button-inner').innerHTML = '-';
            }
        }
    }

    var places = [
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
            if (!app$1.mobile) {
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
            if (!app$1.mobile) {
                this.world_map.onscroll = (e) => {
                    this.reposition();
                };
                this.onmouseup = (e) => {
                    this.dragging = false;
                    this.world_map.classList.remove('dragging');
                };
                this.onmousemove = (e) => {
                    if (this.dragging) {
                        world_map.pos = pts.subtract(this.drag_start, app$1.mouse());
                        this.reposition();
                    }
                };
                this.world_map.onmousedown = this.world_map.ontouchstart = (e) => {
                    let pos = app$1.mouse();
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
                new label(this, place);
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
            let path = pathfinder$1.search('Nydal', 'Bell');
            if (!path.length)
                return;
            const ply = this.ply;
            if (ply && path) {
                this.timer += app$1.delta;
                if (this.timer >= 1) {
                    console.log('step');
                    this.timer = 0;
                    if (this.plySeg < path.length - 1)
                        this.plySeg++;
                    const { data } = path[this.plySeg];
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

    var pathfinder;
    (function (pathfinder) {
        var graph = createGraph();
        function init() {
            setup_graph();
        }
        pathfinder.init = init;
        function setup_graph() {
            for (const place of places) {
                graph.addNode(place[1], { x: place[0][0], y: place[0][1] });
            }
            // Start at Nydal intersection
            graph.addNode('Three-way junction 1', { x: 1027, y: 746 }); // connects to road 1
            // Road from center to Nydal
            graph.addNode('Road 1', { x: 1037, y: 744 });
            graph.addNode('Road 2', { x: 1049, y: 745 });
            graph.addLink('Three-way junction 1', 'Road 1');
            graph.addLink('Road 1', 'Road 2');
            graph.addLink('Road 2', 'Nydal');
            // Road from center to Brock
            graph.addNode('Road 3', { x: 1034, y: 675 });
            graph.addNode('Road 4', { x: 1024, y: 641 });
            graph.addNode('Road 5', { x: 1020, y: 603 });
            graph.addNode('Road 6', { x: 1014, y: 563 });
            graph.addNode('Road 7', { x: 996, y: 530 });
            graph.addNode('Three-way junction 2', { x: 988, y: 488 });
            graph.addLink('Three-way junction 1', 'Road 3');
            graph.addLink('Road 3', 'Road 4');
            graph.addLink('Road 4', 'Road 5');
            graph.addLink('Road 5', 'Road 6');
            graph.addLink('Road 6', 'Road 7');
            graph.addLink('Road 7', 'Three-way junction 2');
            graph.addNode('Three-way junction 3', { x: 964, y: 494 });
            graph.addNode('Road 8', { x: 962, y: 483 });
            graph.addNode('Road 9', { x: 961, y: 472 });
            graph.addNode('Road 10', { x: 952, y: 462 });
            graph.addLink('Three-way junction 2', 'Three-way junction 3');
            graph.addLink('Three-way junction 3', 'Road 8');
            graph.addLink('Road 8', 'Road 9');
            graph.addLink('Road 9', 'Road 10');
            graph.addLink('Road 10', 'Brock');
            // We made it to Brock, now to Ludwig
            graph.addNode('Road 11', { x: 930, y: 502 });
            graph.addNode('Road 12', { x: 887, y: 531 });
            graph.addNode('Road 13', { x: 802, y: 532 });
            graph.addNode('Road 14', { x: 734, y: 548 });
            graph.addNode('Three-way junction 4', { x: 711, y: 574 });
            graph.addNode('Road 15', { x: 702, y: 572 });
            graph.addNode('Road 16', { x: 689, y: 573 });
            graph.addNode('Road 17', { x: 675, y: 568 });
            graph.addLink('Three-way junction 3', 'Road 11');
            graph.addLink('Road 11', 'Road 12');
            graph.addLink('Road 12', 'Road 13');
            graph.addLink('Road 13', 'Road 14');
            graph.addLink('Road 14', 'Three-way junction 4');
            graph.addLink('Three-way junction 4', 'Road 15');
            graph.addLink('Road 15', 'Road 16');
            graph.addLink('Road 16', 'Road 17');
            graph.addLink('Road 17', 'Ludwig');
            // Now from Ludwig to Callaway
            graph.addNode('Road 18', { x: 711, y: 578 });
            graph.addNode('Road 19', { x: 708, y: 600 });
            graph.addNode('Road 20', { x: 718, y: 631 });
            graph.addNode('Road 21', { x: 714, y: 651 });
            graph.addNode('Road 22', { x: 705, y: 673 });
            graph.addNode('Three-way junction 5', { x: 711, y: 710 });
            graph.addLink('Three-way junction 4', 'Road 18');
            graph.addLink('Road 18', 'Road 19');
            graph.addLink('Road 19', 'Road 20');
            graph.addLink('Road 20', 'Road 21');
            graph.addLink('Road 21', 'Road 22');
            graph.addLink('Road 22', 'Three-way junction 5'); // Empty Y junction
            // Now to callaway
            graph.addNode('Road 23', { x: 711, y: 762 });
            graph.addNode('Road 24', { x: 718, y: 810 });
            graph.addNode('Road 25', { x: 725, y: 854 });
            graph.addNode('Three-way junction 6', { x: 727, y: 862 });
            graph.addNode('Road 26', { x: 713, y: 864 });
            graph.addNode('Road 27', { x: 701, y: 865 });
            graph.addNode('Road 28', { x: 676, y: 870 });
            graph.addLink('Three-way junction 5', 'Road 23');
            graph.addLink('Road 23', 'Road 24');
            graph.addLink('Road 24', 'Road 25');
            graph.addLink('Road 25', 'Three-way junction 6');
            graph.addLink('Three-way junction 6', 'Road 26');
            graph.addLink('Road 26', 'Road 27');
            graph.addLink('Road 27', 'Road 28');
            graph.addLink('Road 28', 'Callaway');
            // Made it to Callaway, now to Dent
            graph.addNode('Road 29', { x: 734, y: 885 });
            graph.addNode('Road 30', { x: 754, y: 901 });
            graph.addNode('Road 31', { x: 795, y: 937 });
            graph.addNode('Road 32', { x: 848, y: 959 });
            graph.addNode('Road 33', { x: 896, y: 981 });
            graph.addNode('Three-way junction 7', { x: 920, y: 976 });
            graph.addLink('Three-way junction 6', 'Road 29');
            graph.addLink('Road 29', 'Road 30');
            graph.addLink('Road 30', 'Road 31');
            graph.addLink('Road 31', 'Road 32');
            graph.addLink('Road 32', 'Road 33');
            graph.addLink('Road 33', 'Three-way junction 7');
            graph.addLink('Three-way junction 7', 'Dent');
            // Made it to Dent, now to Mason
            graph.addNode('Road 34', { x: 941, y: 971 });
            graph.addNode('Road 35', { x: 976, y: 976 });
            graph.addNode('Road 36', { x: 1015, y: 972 });
            graph.addNode('Three-way junction 8', { x: 1043, y: 962 });
            graph.addNode('Road 37', { x: 1070, y: 967 });
            graph.addNode('Road 38', { x: 1083, y: 979 });
            graph.addNode('Road 39', { x: 1097, y: 981 });
            graph.addNode('Road 40', { x: 1115, y: 984 });
            graph.addLink('Three-way junction 7', 'Road 34');
            graph.addLink('Road 34', 'Road 35');
            graph.addLink('Road 35', 'Road 36');
            graph.addLink('Road 36', 'Three-way junction 8');
            graph.addLink('Three-way junction 8', 'Road 37');
            graph.addLink('Road 37', 'Road 38');
            graph.addLink('Road 38', 'Road 39');
            graph.addLink('Road 39', 'Road 40');
            graph.addLink('Road 40', 'Mason');
            // Now from Mason to Branville
            graph.addNode('Road 41', { x: 1045, y: 935 });
            graph.addNode('Three-way junction 9', { x: 1036, y: 841 });
            graph.addNode('Road 42', { x: 1059, y: 840 });
            graph.addNode('Road 43', { x: 1077, y: 835 });
            graph.addNode('Road 44', { x: 1089, y: 840 });
            graph.addLink('Three-way junction 8', 'Road 41');
            graph.addLink('Road 41', 'Three-way junction 9');
            graph.addLink('Three-way junction 9', 'Road 42');
            graph.addLink('Road 42', 'Road 43');
            graph.addLink('Road 43', 'Road 44');
            graph.addLink('Road 44', 'Branville');
            // Now from Branville to Nydal
            graph.addLink('Three-way junction 9', 'Three-way junction 1');
            // From Nydal to empty Y junction aka Three-way junction 5
            graph.addNode('Road 45', { x: 982, y: 745 });
            graph.addNode('Road 46', { x: 935, y: 736 });
            graph.addNode('Road 47', { x: 865, y: 736 });
            graph.addNode('Road 48', { x: 800, y: 721 });
            graph.addLink('Three-way junction 1', 'Road 45');
            graph.addLink('Road 45', 'Road 46');
            graph.addLink('Road 46', 'Road 47');
            graph.addLink('Road 47', 'Road 48');
            graph.addLink('Road 48', 'Three-way junction 5');
            // From Three-way junction 2 to New Clarks
            graph.addNode('Road 49', { x: 1008, y: 438 });
            graph.addNode('Three-way junction 10', { x: 1017, y: 390 });
            graph.addNode('Road 50', { x: 991, y: 377 });
            graph.addNode('Three-way junction 11', { x: 984, y: 375 });
            graph.addNode('Road 51', { x: 986, y: 360 });
            graph.addNode('Road 52', { x: 994, y: 342 });
            graph.addLink('Three-way junction 2', 'Road 49');
            graph.addLink('Road 49', 'Three-way junction 10');
            graph.addLink('Three-way junction 10', 'Road 50');
            graph.addLink('Road 50', 'Three-way junction 11');
            graph.addLink('Three-way junction 11', 'Road 51');
            graph.addLink('Road 51', 'Road 52');
            graph.addLink('Road 52', 'New Clarks');
            // Now loop around the mountain to Nook
            graph.addNode('Road 53', { x: 919, y: 368 });
            graph.addNode('Road 54', { x: 848, y: 387 });
            graph.addNode('Road 55', { x: 799, y: 378 });
            graph.addNode('Road 56', { x: 761, y: 363 });
            graph.addNode('Road 57', { x: 753, y: 327 });
            graph.addNode('Three-way junction 12', { x: 760, y: 303 });
            graph.addNode('Road 58', { x: 744, y: 292 });
            graph.addLink('Three-way junction 11', 'Road 53');
            graph.addLink('Road 53', 'Road 54');
            graph.addLink('Road 54', 'Road 55');
            graph.addLink('Road 55', 'Road 56');
            graph.addLink('Road 56', 'Road 57');
            graph.addLink('Road 57', 'Three-way junction 12');
            graph.addLink('Three-way junction 12', 'Road 58');
            graph.addLink('Road 58', 'Nook');
            // Now Nook to Bell
            graph.addNode('Road 59', { x: 762, y: 301 });
            graph.addNode('Road 60', { x: 822, y: 249 });
            graph.addNode('Road 61', { x: 901, y: 211 });
            graph.addNode('Road 62', { x: 927, y: 201 });
            graph.addNode('Road 63', { x: 986, y: 200 });
            graph.addNode('Road 64', { x: 1056, y: 208 });
            graph.addNode('Three-way junction 13', { x: 1087, y: 217 });
            graph.addNode('Road 65', { x: 1094, y: 201 });
            graph.addLink('Three-way junction 12', 'Road 59');
            graph.addLink('Road 59', 'Road 60');
            graph.addLink('Road 60', 'Road 61');
            graph.addLink('Road 61', 'Road 62');
            graph.addLink('Road 62', 'Road 63');
            graph.addLink('Road 63', 'Road 64');
            graph.addLink('Road 64', 'Three-way junction 13');
            graph.addLink('Three-way junction 13', 'Road 65');
            graph.addLink('Road 65', 'Bell');
            // Now Bell to Three-way junction 10
            graph.addNode('Road 66', { x: 1109, y: 224 });
            graph.addNode('Road 67', { x: 1119, y: 237 });
            graph.addNode('Road 68', { x: 1121, y: 293 });
            graph.addNode('Road 69', { x: 1110, y: 312 });
            graph.addNode('Road 70', { x: 1052, y: 344 });
            graph.addNode('Road 71', { x: 1031, y: 363 });
            graph.addLink('Three-way junction 13', 'Road 66');
            graph.addLink('Road 66', 'Road 67');
            graph.addLink('Road 67', 'Road 68');
            graph.addLink('Road 68', 'Road 69');
            graph.addLink('Road 69', 'Road 70');
            graph.addLink('Road 70', 'Road 71');
            graph.addLink('Road 71', 'Three-way junction 10');
            // Now plot a road to Brock
            // road 2 links to Nydal
            /*graph.addNode('NYC', { x: 0, y: 0 });
            graph.addNode('Boston', { x: 1, y: 1 });
            graph.addNode('Philadelphia', { x: -1, y: -1 });
            graph.addNode('Washington', { x: -2, y: -2 });*/
            // and railroads:
            /*graph.addLink('NYC', 'Boston');
            graph.addLink('NYC', 'Philadelphia');
            graph.addLink('Philadelphia', 'Washington');*/
        }
        pathfinder.setup_graph = setup_graph;
        function search(from, to) {
            let pathFinder = ngraphPath.aStar(graph, {
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
            let path = pathFinder.find(from, to);
            path = path.reverse();
            return path;
        }
        pathfinder.search = search;
    })(pathfinder || (pathfinder = {}));
    var pathfinder$1 = pathfinder;

    class character {
        static popup;
        static request_popup() {
            if (!character.popup) {
                character.popup = new popup({
                    class: 'character',
                    title: 'Character',
                    zIndex: 2,
                    onclose: () => { character.popup = undefined; }
                });
                character.popup.content_inner.innerHTML = `
				Strength: 10
			`;
                character.popup.attach();
            }
            else {
                character.popup.pos = [0, 0];
                character.popup.reposition();
            }
        }
    }

    class dropdown {
        options;
        button;
        dropdown;
        inner;
        group;
        opened = false;
        constructor(options) {
            this.options = options;
            this.group = document.createElement('x-dropdown-group');
            this.group.classList.add(options.class);
            this.group.innerHTML = `
			<x-dropdown-button>
				<x-dropdown-button-inner>
					${options.button}
				</x-dropdown-button-inner>
			</x-dropdown-button>
			<x-dropdown-offset>
				<x-dropdown>
					<x-dropdown-inner>
					</x-dropdown-inner>
				</x-dropdown>
			</x-dropdown-offset>
		`;
            this.button = this.group.querySelector('x-dropdown-button');
            this.dropdown = this.group.querySelector('x-dropdown');
            this.inner = this.group.querySelector('x-dropdown-inner');
            this.button.onclick = () => {
                this.opened = !this.opened;
                if (this.opened)
                    this.open();
                else
                    this.close();
            };
            for (const tuple of options.options) {
                const value = document.createElement('x-dropdown-value');
                value.innerHTML = tuple[1];
                value.onclick = () => {
                    this.close();
                    options.handler(tuple);
                };
                this.inner.append(value);
            }
        }
        open() {
            this.opened = true;
            this.dropdown.style.display = 'flex';
        }
        close() {
            this.opened = false;
            this.dropdown.style.display = 'none';
        }
        attach(element) {
            element.append(this.group);
        }
    }

    class third {
        static popup;
        static request_popup() {
            if (!third.popup) {
                third.popup = new popup({
                    class: 'character',
                    title: 'Character',
                    zIndex: 2,
                    onclose: () => { third.popup = undefined; }
                });
                third.popup.content_inner.innerHTML = `
				Strength: 10
			`;
                third.popup.attach();
            }
            else {
                third.popup.pos = [0, 0];
                third.popup.reposition();
            }
        }
    }

    class view {
        dropdown;
        constructor() {
            const handler = (tuple) => {
                console.log(tuple);
                switch (tuple[0]) {
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
            const destination = document.querySelector('x-top-bar-inner x-view-destination');
            this.dropdown.attach(destination);
        }
    }

    // fantasy:
    // https://www.artstation.com/artwork/Z580PG
    // https://www.artstation.com/artwork/GXnEN3
    // post apo:
    // https://www.artstation.com/artwork/68ax80
    // https://www.artstation.com/artwork/q2doy
    // https://www.artstation.com/artwork/1xQkG
    // https://www.artstation.com/artwork/5B6KxW
    var rpg;
    (function (rpg) {
        function init() {
            console.log(' init ');
            world_map.init();
            pathfinder$1.init();
            main$1.init();
            new view;
        }
        rpg.init = init;
        function step() {
            hooks.call('rpgStep', 0);
        }
        rpg.step = step;
    })(rpg || (rpg = {}));
    var rpg$1 = rpg;

    var app;
    (function (app) {
        window['App'] = app;
        let KEY;
        (function (KEY) {
            KEY[KEY["OFF"] = 0] = "OFF";
            KEY[KEY["PRESS"] = 1] = "PRESS";
            KEY[KEY["WAIT"] = 2] = "WAIT";
            KEY[KEY["AGAIN"] = 3] = "AGAIN";
            KEY[KEY["UP"] = 4] = "UP";
        })(KEY = app.KEY || (app.KEY = {}));
        let MOUSE;
        (function (MOUSE) {
            MOUSE[MOUSE["UP"] = -1] = "UP";
            MOUSE[MOUSE["OFF"] = 0] = "OFF";
            MOUSE[MOUSE["DOWN"] = 1] = "DOWN";
            MOUSE[MOUSE["STILL"] = 2] = "STILL";
        })(MOUSE = app.MOUSE || (app.MOUSE = {}));
        var keys = {};
        var buttons = {};
        var pos = [0, 0];
        app.wheel = 0;
        app.mobile = false;
        function onkeys(event) {
            if (!event.key)
                return;
            const key = event.key.toLowerCase();
            if ('keydown' == event.type)
                keys[key] = keys[key] ? KEY.AGAIN : KEY.PRESS;
            else if ('keyup' == event.type)
                keys[key] = KEY.UP;
            if (event.keyCode == 114)
                event.preventDefault();
        }
        app.onkeys = onkeys;
        function key(k) {
            return keys[k];
        }
        app.key = key;
        function button(b) {
            return buttons[b];
        }
        app.button = button;
        function mouse() {
            return [...pos];
        }
        app.mouse = mouse;
        async function boot(version) {
            console.log('boot');
            app.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            function onmousemove(e) {
                pos[0] = e.clientX;
                pos[1] = e.clientY;
                hooks.call('onmousemove', false);
            }
            function onmousedown(e) {
                buttons[e.button] = 1;
                if (e.button == 1)
                    return false;
                hooks.call('onmousedown', false);
            }
            function onmouseup(e) {
                buttons[e.button] = MOUSE.UP;
                hooks.call('onmouseup', false);
            }
            function onwheel(e) {
                app.wheel = e.deltaY < 0 ? 1 : -1;
            }
            let touchStart = [0, 0];
            function ontouchstart(e) {
                //message("ontouchstart");
                touchStart = [e.pageX, e.pageY];
                pos[0] = e.pageX;
                pos[1] = e.pageY;
                hooks.call('onmousedown', false);
                //if (app.mobile)
                //	glob.win_propagate_events(e);
                //buttons[2] = MOUSE.UP;
                //buttons[2] = MOUSE.DOWN; // rclick
                //return false;
            }
            function ontouchmove(e) {
                //message("ontouchmove");
                pos[0] = e.pageX;
                pos[1] = e.pageY;
                //if (!buttons[0])
                buttons[0] = KEY.PRESS;
                //return false;
                //console.log('touch move');
                //if (app.mobile)
                //	glob.win_propagate_events(e);
                e.preventDefault();
                hooks.call('onmousemove', false);
                return false;
            }
            function ontouchend(e) {
                //message("ontouchend");
                const touchEnd = [e.pageX, e.pageY];
                buttons[0] = MOUSE.UP;
                hooks.call('onmouseup', false);
                //buttons[2] = MOUSE.UP;
                if (pts.equals(touchEnd, touchStart) /*&& buttons[2] != MOUSE.STILL*/) ; /*
                else if (!pts.equals(touchEnd, touchStart)) {
                    buttons[2] = MOUSE.UP;
                }
                //message("ontouchend");*/
                //return false;
            }
            if (app.mobile) {
                document.ontouchstart = ontouchstart;
                document.ontouchmove = ontouchmove;
                document.ontouchend = ontouchend;
            }
            else {
                document.onkeydown = document.onkeyup = onkeys;
                document.onmousemove = onmousemove;
                document.onmousedown = onmousedown;
                document.onmouseup = onmouseup;
                document.onwheel = onwheel;
            }
            await rpg$1.init();
            loop();
        }
        app.boot = boot;
        function process_keys() {
            for (let i in keys) {
                if (keys[i] == KEY.PRESS)
                    keys[i] = KEY.WAIT;
                else if (keys[i] == KEY.UP)
                    keys[i] = KEY.OFF;
            }
        }
        function process_mouse_buttons() {
            for (let b of [0, 1, 2])
                if (buttons[b] == MOUSE.DOWN)
                    buttons[b] = MOUSE.STILL;
                else if (buttons[b] == MOUSE.UP)
                    buttons[b] = MOUSE.OFF;
        }
        var last, current;
        function loop(timestamp) {
            requestAnimationFrame(loop);
            current = performance.now();
            if (!last)
                last = current;
            app.delta = (current - last) / 1000;
            //if (delta > 1 / 10)
            //	delta = 1 / 10;
            last = current;
            rpg$1.step();
            hooks.call('animationFrame', false);
            app.wheel = 0;
            process_keys();
            process_mouse_buttons();
        }
        app.loop = loop;
        function sethtml(selector, html) {
            let element = document.querySelector(selector);
            element.innerHTML = html;
        }
        app.sethtml = sethtml;
    })(app || (app = {}));
    var app$1 = app;

    return app$1;

})(createGraph, ngraphPath);
