import app from "./app"
import hooks from "./hooks"
import pts from "./pts"

interface options {
	class: string
	title: string
}

class popup {
	pos: vec2 = [0, 0]
	drag_start: vec2 = [0, 0]
	drag: vec2 = [0, 0]
	dragging = false
	window
	title_bar
	title_drag
	onmousemove
	onmouseup
	constructor(public options: options) {
		this.window = document.createElement('x-window');
		this.window.classList.add(options.class);
		this.window.innerHTML = `
			<x-title-bar>
				<x-title-bar-inner>
					<x-title>
						${options.title}
					</x-title>
					<x-close>
						x
					</x-close>
				</x-title-bar-inner>
			</x-title-bar>
			<x-window-content>
				<x-inner>
					<x-world-map>

					</x-world-map>
				</x-inner>
			</x-window-content>
		`;
		this.title_bar = this.window.querySelector('x-title-bar');
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
			let pos: vec2 = [0, 0];
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
	}
}

export default popup;
