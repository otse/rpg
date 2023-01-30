import app from "./app";
import hooks from "./hooks";
import pts from "./pts";
var popups = [];
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
                this.pos = pts.subtract(app.mouse(), this.drag_start);
                this.reposition();
            }
        };
        hooks.register('onmouseup', this.onmouseup);
        hooks.register('onmousemove', this.onmousemove);
        this.title_drag.onmousedown = this.title_drag.ontouchstart = (e) => {
            let pos = app.mouse();
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
export default popup;
