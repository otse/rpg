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
        /*
        static clamp(a: vec2, min: vec2, max: vec2): vec2 {
            const clamp = (val, min, max) =>
                val > max ? max : val < min ? min : val;
            return [clamp(a[0], min[0], max[0]), clamp(a[1], min[1], max[1])];
        }
        */
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

    class popup {
        options;
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
        onmousemove;
        onmouseup;
        constructor(options) {
            this.options = options;
            this.window = document.createElement('x-window');
            this.window.classList.add(options.class);
            this.window.style.zIndex = options.zIndex;
            this.window.innerHTML = `
			<x-title-bar>
				<x-title-bar-inner>
					<x-title>
						${options.title}
					</x-title>
					<x-min>
						&#8964;
					</x-min>
					<x-close>
						x
					</x-close>
				</x-title-bar-inner>
			</x-title-bar>
			<x-window-content>
				<x-inner>
					
				</x-inner>
			</x-window-content>
		`;
            this.title_bar = this.window.querySelector('x-title-bar');
            this.content = this.window.querySelector('x-window-content');
            this.content_inner = this.window.querySelector('x-window-content x-inner');
            this.title_drag = this.window.querySelector('x-title-bar x-title');
            this.onmouseup = (e) => {
                this.dragging = false;
                this.title_bar.classList.remove('dragging');
            };
            this.onmousemove = (e) => {
                if (this.dragging) {
                    this.pos = pts.subtract(app$1.mouse(), this.drag_start);
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
                this.window.style.zIndex = 10;
            };
            this.close = this.window.querySelector('x-close');
            this.close.onclick = () => {
                this.destroy();
            };
            this.min = this.window.querySelector('x-min');
            this.min.onclick = () => {
                this.toggle_min();
            };
            this.reposition();
        }
        reposition() {
            console.log('reposition popup');
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
            this.options.onclose?.();
        }
        toggle_min() {
            this.minimized = !this.minimized;
            if (this.minimized) {
                this.content.style.display = 'none';
            }
            else {
                this.content.style.display = 'flex';
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

    class world_map {
        static popup;
        static request_popup() {
            if (!world_map.popup) {
                world_map.popup = new popup({
                    class: 'world-map',
                    title: 'World Map',
                    zIndex: 2,
                    onclose: () => { world_map.popup = undefined; }
                });
                world_map.popup.content_inner.innerHTML = `
				<x-world-map></x-world-map>
			`;
                world_map.popup.attach();
            }
            else {
                world_map.popup.pos = [0, 0];
                world_map.popup.reposition();
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
                }
            };
            this.dropdown = new dropdown({
                class: 'view',
                button: 'View',
                options: [
                    [0, 'Character'],
                    [1, 'World Map']
                ],
                handler: handler
            });
            const destination = document.querySelector('x-top-bar-inner x-dropdown-destination');
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
