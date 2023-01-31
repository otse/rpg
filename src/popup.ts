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
	onmousemove
	onmouseup
	constructor(public options: options) {
		this.window = document.createElement('x-window');
		this.window.classList.add(options.class);
		this.window.style.zIndex = options.zIndex;
		this.window.innerHTML = `
			<x-title-bar>
				<x-title-bar-inner>
					<x-title>
						${options.title}
					</x-title>
					<x-button data-a="min">
						<x-button-inner>
							-
							<!-- &#8964; -->
						</x-button-inner>
					</x-button>
					<x-button data-a="close">
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
			this.window.style.zIndex = 10;
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
			}
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

export default popup;
