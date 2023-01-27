import hooks from "./hooks";
import pts from "./pts";
import rpg from "./rpg";
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
    ;
    let MOUSE;
    (function (MOUSE) {
        MOUSE[MOUSE["UP"] = -1] = "UP";
        MOUSE[MOUSE["OFF"] = 0] = "OFF";
        MOUSE[MOUSE["DOWN"] = 1] = "DOWN";
        MOUSE[MOUSE["STILL"] = 2] = "STILL";
    })(MOUSE = app.MOUSE || (app.MOUSE = {}));
    ;
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
            if (pts.equals(touchEnd, touchStart) /*&& buttons[2] != MOUSE.STILL*/) {
                //buttons[2] = MOUSE.DOWN;
            } /*
            else if (!pts.equals(touchEnd, touchStart)) {
                buttons[2] = MOUSE.UP;
            }
            //message("ontouchend");*/
            //return false;
        }
        function onerror(message) { document.querySelectorAll('.stats')[0].innerHTML = message; }
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
        await rpg.init();
        loop(0);
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
        rpg.step();
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
export default app;
