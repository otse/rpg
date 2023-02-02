import hooks from "./hooks";
import pts from "./pts";
import rpg from "./rpg";
import space from "./rpg";

namespace app {
	window['App'] = app;
	export enum KEY {
		OFF = 0,
		PRESS,
		WAIT,
		AGAIN,
		UP
	};
	export enum MOUSE {
		UP = - 1,
		OFF = 0,
		DOWN,
		STILL
	};
	export var error;
	var keys = {};
	var buttons = {};
	var pos: vec2 = [0, 0];
	export var delta;
	export var wheel = 0;
	export var mobile = false;

	export function onkeys(event) {
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
	export function key(k: string) {
		return keys[k];
	}
	export function button(b: number) {
		return buttons[b];
	}
	export function mouse(): vec2 {
		return [...pos];
	}
	export async function boot(version: string) {
		console.log('boot');
		mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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
			wheel = e.deltaY < 0 ? 1 : -1;
		}
		let touchStart: vec2 = [0, 0];
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
			const touchEnd: vec2 = [e.pageX, e.pageY];
			buttons[0] = MOUSE.UP;
			hooks.call('onmouseup', false);
			//buttons[2] = MOUSE.UP;

			if (pts.equals(touchEnd, touchStart) /*&& buttons[2] != MOUSE.STILL*/) {
				//buttons[2] = MOUSE.DOWN;
			}/*
			else if (!pts.equals(touchEnd, touchStart)) {
				buttons[2] = MOUSE.UP;
			}
			//message("ontouchend");*/
			//return false;
		}

		function onerror(message) { document.querySelectorAll('.stats')[0].innerHTML = message; }
		if (mobile) {
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
	var last, current
	export function loop(timestamp) {
		requestAnimationFrame(loop);
		current = performance.now();
		if (!last)
			last = current;
		delta = (current - last) / 1000;
		//if (delta > 1 / 10)
		//	delta = 1 / 10;
		last = current;
		rpg.step();
		hooks.call('animationFrame', false);
		wheel = 0;
		process_keys();
		process_mouse_buttons();
	}
	export function sethtml(selector, html) {
		let element = document.querySelector(selector);
		element.innerHTML = html;
	}
}

export default app;