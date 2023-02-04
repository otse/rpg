var rpg = (function () {
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

    var green = {
        name: 'map.jpg',
        regions: [
            //[[300, 300], [2048 - 500, 1536 - 600], 'Desert'],
            //[[700, 346], [2048 - 500, 1536 - 600], 'Desert'],
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
        ]
    };
    const map_size = [2048, 1536];
    const map_division = 2;
    class world_map {
        static instance;
        popup;
        selectedLabel;
        map = green;
        info;
        dragging = false;
        world_map;
        world_map_inner;
        static pos = [0, 0];
        drag_start = [0, 0];
        drag = [0, 0];
        x_text;
        onmouseup;
        onmousemove;
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
            this.populate();
            this.popup.attach();
            this.reposition();
        }
        populate() {
            this.info = document.createElement('x-world-map-info');
            const x_main_area = document.querySelector('x-main-area');
            x_main_area.append(this.info);
            for (const region of this.map.regions) {
                new label(this, region);
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
            };
            this.el.onmouseover = () => {
                this.select();
            };
            this.el.onmouseout = () => {
                if (this.friend.selectedLabel != this)
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

    // https://www.artstation.com/artwork/Z580PG
    // https://www.artstation.com/artwork/GXnEN3
    var rpg;
    (function (rpg) {
        function init() {
            console.log(' init ');
            new view;
        }
        rpg.init = init;
        function step() {
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

})();
