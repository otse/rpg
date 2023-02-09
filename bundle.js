var rpg = (function (createGraph, ngraphPath) {
    'use strict';

    // inspired by gmod lua !
    class hooks {
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
            this.title_bar.onmousedown = this.title_bar.ontouchstart = (e) => {
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
    let mapZoom = 1;
    class world_map {
        static instance;
        popup;
        selectedPlace;
        info;
        dragging = false;
        world_map;
        world_map_scaler;
        world_map_graphic;
        ply;
        static addedZoom = 0;
        static pos = [542, 306];
        drag_start = [0, 0];
        drag = [0, 0];
        x_text;
        x_overlay;
        x_controls;
        onmouseup;
        onmousemove;
        static init() {
            world_map.register();
            world_map.change_map_division();
            window['world_map'] = world_map;
        }
        static change_map_division() {
            if (!app$1.mobile)
                map_division = 1 / window.devicePixelRatio;
        }
        static step() {
            world_map.change_map_division();
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
				<x-controls>
				</x-controls>
			</x-top>
			<x-horz></x-horz>
			<x-relative>
				<x-overlay></x-overlay>
				<x-world-map>
					<x-world-map-scaler>
						<x-world-map-graphic>
						</x-world-map-graphic>
					</x-world-map-scaler>
				</x-world-map>
			</x-relative>
		`;
            this.x_text = this.popup.content_inner.querySelector('x-text');
            this.x_overlay = this.popup.content_inner.querySelector('x-overlay');
            this.x_controls = this.popup.content_inner.querySelector('x-controls');
            this.world_map = this.popup.content_inner.querySelector('x-world-map');
            this.world_map_scaler = this.popup.content_inner.querySelector('x-world-map-scaler');
            this.world_map_graphic = this.popup.content_inner.querySelector('x-world-map-graphic');
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
                this.world_map.onmousedown = (e) => {
                    let pos = app$1.mouse();
                    this.drag_start = pts.add(pos, world_map.pos);
                    this.world_map.classList.add('dragging');
                    this.dragging = true;
                };
                const MouseWheelHandler = (e) => {
                    var e = window.event || e; // old IE support
                    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                    e.preventDefault();
                    e.stopPropagation();
                    if (delta == 1) {
                        this.zoom(0.25);
                    }
                    if (delta == -1) {
                        this.zoom(-0.25);
                    }
                    return false;
                };
                this.world_map.addEventListener("mousewheel", MouseWheelHandler, false); // IE9, Chrome, Safari, Opera
                this.world_map.addEventListener("DOMMouseScroll", MouseWheelHandler, false); // Firefox
                hooks.register('onmouseup', this.onmouseup);
                hooks.register('onmousemove', this.onmousemove);
            }
            this.ply = new flag(this);
            this.add_svg();
            this.populate();
            this.popup.attach();
            this.add_zoom_controls();
            this.rezoom();
            this.reposition();
        }
        zoom(zoom = 0.25) {
            const prevZoom = mapZoom;
            world_map.addedZoom += zoom;
            world_map.addedZoom = rpg$1.clamp(world_map.addedZoom, 0, 3);
            this.rezoom();
            const original_map_size = [2048, 1536];
            const prev_map_size = pts.mult(original_map_size, prevZoom);
            const new_map_size = pts.mult(original_map_size, mapZoom);
            const grow_size = pts.subtract(new_map_size, prev_map_size);
            const viewport = [324, 390];
            const scroll = pts.divide(pts.add(world_map.pos, pts.divide(viewport, 2)), prev_map_size[0], prev_map_size[1]);
            console.log('scroll', scroll);
            let half = pts.mult(grow_size, scroll[0], scroll[1]);
            if (!pts.together(grow_size))
                return;
            pts.subtract(new_map_size, world_map.pos);
            world_map.pos = pts.add(world_map.pos, half);
            this.reposition();
        }
        rezoom() {
            mapZoom = map_division + world_map.addedZoom;
            this.world_map_graphic.style.zoom = `${mapZoom}`;
            //this.world_map_graphic.style.transform = `scale(${mapZoom})`;
            //this.world_map_graphic.style['transform-origin'] = `${world_map.pos[0]}px ${world_map.pos[1]}px`;
            this.x_overlay.innerHTML = `
			Base zoom: ${map_division.toFixed(2)}<br />
			Zoom: ${mapZoom.toFixed(2)}<br />
			Scalar: ${world_map.addedZoom}
		`;
            const el = this.world_map;
            this.maxWidth = Math.max(el.clientWidth, el.scrollWidth, el.offsetWidth) - el.clientWidth;
            this.maxHeight = Math.max(el.clientHeight, el.scrollHeight, el.offsetHeight) - el.clientHeight;
        }
        add_zoom_controls() {
            this.x_controls.innerHTML = `
			<x-button data-a="plus">+</x-button>
			<x-button data-a="minus">-</x-button>
		`;
            const plus = this.x_controls.querySelector('x-button[data-a="plus"]');
            const minus = this.x_controls.querySelector('x-button[data-a="minus"]');
            plus.onclick = () => {
                const zoom = 0.25;
                world_map.addedZoom += zoom;
                this.rezoom();
                world_map.pos = pts.mult(world_map.pos, 1 + zoom);
                this.reposition();
            };
            minus.onclick = () => {
                world_map.addedZoom -= 0.25;
                this.rezoom();
                this.reposition();
            };
        }
        add_svg() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttributeNS(null, 'viewBox', '0 0 20 15');
            svg.setAttributeNS(null, 'width', '2048');
            svg.setAttributeNS(null, 'height', '1536');
            svg.innerHTML = `<path d="M 10.375 7.277 C 10.302 7.274 10.294 7.295 10.205 7.278 C 10.115 7.264 10.101 7.282 10.032 7.285 C 10.0503 7.0727 10.0717 6.8553 10.093 6.638 C 10.114 6.434 9.997 6.382 9.991 6.185 C 9.9837 6.0597 9.9723 5.9403 9.965 5.817 M 9.59 5.876 C 9.695 5.887 9.703 5.856 9.771 5.858 C 9.844 5.854 9.872 5.816 9.965 5.814 C 9.953 5.665 9.923 5.466 9.829 5.357 C 9.736 5.258 9.663 4.994 9.649 4.776 M 10.61 2.121 L 10.275 2.02 L 10.084 1.987 L 9.831 1.973 L 9.581 1.959 L 9.257 1.949 C 9.15 1.947 9.061 1.949 8.977 1.981 L 8.386 2.259 L 8.003 2.445 C 7.865 2.514 7.59 2.767 7.417 2.962 C 7.375 2.904 7.336 2.868 7.265 2.854 C 7.203 2.848 7.155 2.857 7.066 2.841 M 7.415 2.967 C 7.366 3.041 7.398 3.086 7.372 3.153 C 7.333 3.249 7.341 3.347 7.368 3.408 C 7.392 3.484 7.413 3.465 7.428 3.531 C 7.455 3.607 7.547 3.654 7.61 3.667 C 7.771 3.662 7.795 3.701 7.893 3.732 C 8.094 3.795 8.175 3.79 8.297 3.783 C 8.449 3.774 8.571 3.727 8.692 3.681 C 8.814 3.632 8.907 3.593 9.075 3.584 C 9.282 3.582 9.4303 3.6333 9.613 3.664 C 9.607 3.572 9.616 3.503 9.657 3.449 C 9.719 3.362 9.719 3.324 9.721 3.188 M 9.616 3.664 C 9.756 3.679 9.855 3.718 9.936 3.803 M 10.907 1.876 C 10.862 1.921 10.685 1.874 10.68 1.983 C 10.68 2.064 10.633 2.047 10.613 2.122 L 10.834 2.192 C 10.897 2.219 10.929 2.272 10.934 2.356 L 10.948 2.812 C 10.939 2.94 10.917 3.006 10.844 3.053 L 10.286 3.362 C 10.165 3.422 10.087 3.506 10.03 3.589 C 9.982 3.656 9.955 3.731 9.939 3.805 C 9.907 3.931 9.874 4.231 9.823 4.343 C 9.766 4.499 9.701 4.661 9.649 4.776 C 9.558 4.789 9.503 4.819 9.42 4.83 M 9.266 4.375 C 9.278 4.554 9.397 4.545 9.386 4.635 C 9.373 4.724 9.421 4.781 9.419 4.83 C 8.744 4.957 8.934 5.149 8.672 5.186 C 8.454 5.217 8.2993 5.1827 8.113 5.181 C 7.939 5.171 7.856 5.207 7.731 5.202 C 7.576 5.205 7.452 5.289 7.347 5.326 C 7.237 5.37 7.199 5.337 7.114 5.371 C 6.973 5.427 6.956 5.52 6.947 5.586 M 6.502 5.56 L 6.596 5.556 C 6.675 5.558 6.682 5.588 6.731 5.593 C 6.808 5.612 6.816 5.571 6.949 5.602 C 6.953 5.75 6.919 5.789 6.918 5.875 C 6.919 5.974 7.03 6.039 7.023 6.153 C 7.02 6.257 6.97 6.267 6.969 6.388 C 6.969 6.447 6.887 6.465 6.885 6.57 C 6.874 6.787 6.948 6.767 6.94 6.934 C 7.165 6.942 7.305 7.013 7.514 7.015 C 7.671 7.016 7.79 7.032 7.922 7.063 C 8.065 7.094 8.194 7.16 8.343 7.177 C 8.48 7.198 8.591 7.202 8.718 7.19 C 8.911 7.166 9.055 7.178 9.22 7.198 C 9.369 7.224 9.501 7.273 9.633 7.287 C 9.73 7.287 9.815 7.307 9.942 7.298 C 9.9707 7.296 9.9993 7.294 10.031 7.293 C 10.053 7.428 10.046 7.585 10.066 7.719 C 10.095 7.882 10.1007 8.0477 10.121 8.201 M 11.075 8.144 C 10.846 8.148 10.758 8.2 10.624 8.203 C 10.581 8.201 10.579 8.162 10.515 8.161 C 10.447 8.16 10.407 8.202 10.335 8.203 L 10.121 8.21 C 10.1327 8.3993 10.1473 8.5867 10.172 8.768 C 10.1863 8.9323 10.2007 9.0967 10.215 9.261 L 10.191 9.392 C 10.276 9.4 10.33 9.402 10.403 9.427 C 10.503 9.452 10.481 9.515 10.562 9.552 C 10.618 9.578 10.645 9.555 10.723 9.586 C 10.793 9.61 10.792 9.583 10.885 9.61 C 10.987 9.639 11.0637 9.6927 11.158 9.736 M 10.192 9.398 C 10.19 9.444 10.168 9.446 10.096 9.462 C 10.011 9.485 9.932 9.499 9.834 9.491 C 9.726 9.489 9.66 9.539 9.541 9.533 C 9.376 9.53 9.289 9.406 8.985 9.53 L 8.941 9.342 M 8.979 9.532 C 8.913 9.547 8.844 9.607 8.755 9.584 C 8.603 9.55 8.45 9.443 8.288 9.363 C 8.117 9.28 7.941 9.262 7.769 9.161 C 7.636 9.077 7.529 8.948 7.439 8.856 C 7.3213 8.7143 7.149 8.795 7.095 8.432 M 6.429 8.529 L 6.652 8.491 L 6.827 8.452 C 6.9317 8.4313 6.986 8.454 7.093 8.424 C 7.069 8.257 7.051 8.093 7.017 7.929 C 6.994 7.778 7.036 7.718 6.952 7.442 C 6.914 7.296 6.912 7.108 6.94 6.934" opacity="0.4" stroke="#FFFFFF" stroke-width="0.04" fill="none"/>`;
            this.world_map_graphic.append(svg);
            //this.popup.content_inner.append(svg);
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
        maxWidth;
        maxHeight;
        reposition() {
            const el = this.world_map;
            this.maxWidth = Math.max(el.clientWidth, el.scrollWidth, el.offsetWidth) - el.clientWidth;
            this.maxHeight = Math.max(el.clientHeight, el.scrollHeight, el.offsetHeight) - el.clientHeight;
            world_map.pos = pts.clamp(world_map.pos, [0, 0], [this.maxWidth, this.maxHeight]);
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
            this.rezoom();
            for (const pin of pins)
                pin.step();
            let path = pathfinder$1.search(travel.from, travel.to);
            if (!path.length)
                return;
            const ply = this.ply;
            if (ply && path.length > 1) {
                this.timer += app$1.delta;
                if (this.timer >= .25) {
                    this.timer = 0;
                    const node = path[1];
                    const { id, data } = node;
                    travel.from = id;
                    //console.log('travel', travel);
                    ply.pos = [data.x, data.y];
                    ply.step();
                }
            }
            ply?.step();
            return false;
        }
    }
    var pins = [];
    class pin {
        element;
        pos = [0, 0];
        constructor() {
            pins.push(this);
        }
        step() {
            let pos = pts.mult(this.pos, mapZoom);
            this.element.style.top = `${pos[1]}px`;
            this.element.style.left = `${pos[0]}px`;
        }
    }
    class flag extends pin {
        friend;
        constructor(friend) {
            super();
            this.friend = friend;
            this.pos = [1063, 744];
            this.element = document.createElement('x-flag');
            this.step();
            this.attach();
        }
        step() {
            super.step();
        }
        attach() {
            this.friend.world_map_scaler.append(this.element);
        }
    }
    const travel = {
        from: 'Nydal',
        to: 'Brock'
    };
    class label extends pin {
        friend;
        tuple;
        constructor(friend, tuple) {
            super();
            this.friend = friend;
            this.tuple = tuple;
            console.log('new text');
            this.create();
        }
        create() {
            this.element = document.createElement('x-place');
            if (this.tuple[2])
                this.element.classList.add('large');
            this.element.innerHTML = this.tuple[1];
            this.step();
            this.attach();
            this.element.onclick = () => {
                this.friend.selectedPlace?.unselect();
                this.select();
                travel.to = this.tuple[1];
                this.friend.selectedPlace = this;
                this.friend.x_text.innerHTML = `Selected: ${this.tuple[1]}`;
            };
        }
        step() {
            this.pos = pts.clone(this.tuple[0]);
            super.step();
        }
        attach() {
            this.friend.world_map_scaler.append(this.element);
        }
        select() {
            this.element.classList.add('selected');
        }
        unselect() {
            this.element.classList.remove('selected');
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
            graph.addNode('Three-way junction 1.1', { x: 1020, y: 595 });
            graph.addNode('Road 5.1', { x: 1001, y: 599 });
            graph.addNode('Road 6', { x: 1014, y: 563 });
            graph.addNode('Road 7', { x: 996, y: 530 });
            graph.addNode('Three-way junction 2', { x: 988, y: 488 });
            graph.addLink('Three-way junction 1', 'Road 3');
            graph.addLink('Road 3', 'Road 4');
            graph.addLink('Road 4', 'Road 5');
            graph.addLink('Road 5', 'Three-way junction 1.1');
            graph.addLink('Three-way junction 1.1', 'Road 5.1');
            graph.addLink('Road 5.1', 'Everlyn');
            graph.addLink('Three-way junction 1.1', 'Road 6');
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
        function sample(a) {
            return a[Math.floor(Math.random() * a.length)];
        }
        rpg.sample = sample;
        function clamp(val, min, max) {
            return val > max ? max : val < min ? min : val;
        }
        rpg.clamp = clamp;
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
