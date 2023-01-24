var rpg = (function () {
    'use strict';

    class view {
        element;
        dropdown;
        constructor() {
            this.element = document.querySelector('x-view-dropdown-group x-view-button');
            this.dropdown = document.querySelector('x-view-dropdown-group x-dropdown');
            this.dropdown.style.display = 'none';
            this.element.onclick = () => {
                console.log('popout');
                this.dropdown.style.display = 'flex';
            };
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
            document.onkeydown = document.onkeyup = onkeys;
            document.onmousemove = (e) => { pos[0] = e.clientX; pos[1] = e.clientY; };
            document.onmousedown = (e) => { buttons[e.button] = 1; if (e.button == 1)
                return false; };
            document.onmouseup = (e) => { buttons[e.button] = MOUSE.UP; };
            document.onwheel = (e) => { app.wheel = e.deltaY < 0 ? 1 : -1; };
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
