import aabb2 from "./aabb2"
import app from "./app"
import hooks from "./hooks"
import pts from "./pts"

interface options {
	class: string
	title: string
	zIndex: number
	hasClose?: boolean
	hasMin?: boolean
	onclose?: () => any
}

var popups: popup[] = [];

class popup {
	static on_top?: popup
	pos: vec2 = [0, 0]
	drag_start: vec2 = [0, 0]
	drag: vec2 = [0, 0]
	dragging = false
	minimized = false
	window
	title_bar
	content
	content_inner
	title_drag
	min
	close
	index = 0
	onmousemove
	onmouseup
	constructor(public options: options) {
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
		}
		this.onmousemove = (e) => {
			if (this.dragging) {
				this.pos = pts.subtract(app.mouse(), this.drag_start);
				let us = new aabb2([0, 0], [this.title_bar.clientWidth, this.title_bar.clientHeight]);
				us.translate(this.pos);				
				const destination = document.querySelector('x-main-area')!;
				let bound = new aabb2([0, 0], [destination.clientWidth, destination.clientHeight]);
				const test = bound.test(us);
				if (app.mobile && test == 0) {
					this.pos = [0, 0];
				}
				this.reposition();
			}
		}
		hooks.register('onmouseup', this.onmouseup);
		hooks.register('onmousemove', this.onmousemove);
		this.title_drag.onmousedown = this.title_drag.ontouchstart = (e) => {
			let pos: vec2 = app.mouse();
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
		}
		this.close = this.window.querySelector('x-button[data-a="close"]');
		if (this.close)
			this.close.onclick = () => {
				this.destroy();
			}
		this.min = this.window.querySelector('x-button[data-a="min"]');
		if (this.min)
			this.min.onclick = () => {
				this.toggle_min();
				popup.handle_on_top(this);
			}
		this.content.onclick = () => {
			popup.handle_on_top(this);
		}
		popup.handle_on_top(this);
		this.reposition();
		this.reindex();
	}
	static handle_on_top(wnd: popup) {
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
		popups.sort((a: popup, b: popup) => a.index < b.index ? -1 : 1);
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

export default popup;
