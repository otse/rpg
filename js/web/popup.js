import aabb2 from "../lib/aabb2.js";
import app from "../app.js";
import { hooks } from "../lib/hooks.js";
import pts from "../lib/pts.js";
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
    popup;
    title_bar;
    content_outer;
    content;
    title_drag;
    close;
    min;
    index = 0;
    onmousemove;
    onmouseup;
    constructor(options) {
        this.options = options;
        popups.push(this);
        this.popup = document.createElement('x-popup');
        this.popup.classList.add(options.class);
        this.popup.style.zIndex = options.zIndex;
        this.popup.innerHTML = `
			<x-title-bar>
				<x-title-bar-inner>
					<x-title>
						${options.title}
					</x-title>
					<x-button data-a="min" title="minimize">
						<x-button-grad>
							<x-button-inner>
								-
							<!-- &#8964; -->
							</x-button-inner>
						</x-button-grad>
					</x-button>
					<x-button data-a="close" title="close">
						<x-button-grad>
							<x-button-inner>
								x
							</x-button-inner>
						</x-button-grad>
					</x-button>
				</x-title-bar-inner>
			</x-title-bar>
			<x-popup-content-outer>
				<x-popup-content-inner>
				</x-popup-content-inner>
			</x-popup-content-outer>
		`;
        this.title_bar = this.popup.querySelector('x-title-bar');
        this.content_outer = this.popup.querySelector('x-popup-content-outer');
        this.content = this.popup.querySelector('x-popup-content-outer x-popup-content-inner');
        this.title_drag = this.popup.querySelector('x-title-bar x-title');
        this.onmouseup = (e) => {
            this.dragging = false;
            this.title_bar.classList.remove('dragging');
        };
        this.onmousemove = (e) => {
            if (this.dragging) {
                this.pos = pts.subtract(app.mouse(), this.drag_start);
                let us = new aabb2([0, 0], [this.title_bar.clientWidth, this.title_bar.clientHeight]);
                us.translate(this.pos);
                const destination = document.querySelector('x-main-area');
                let bound = new aabb2([0, 0], [destination.clientWidth, destination.clientHeight]);
                const test = bound.test(us);
                if (app.mobile && test == 0) {
                    this.pos = [0, 0];
                }
                this.reposition();
            }
        };
        hooks.addListener('onmouseup', this.onmouseup);
        hooks.addListener('onmousemove', this.onmousemove);
        this.title_bar.onmousedown = this.title_bar.ontouchstart = (e) => {
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
            popup.handle_on_top(this);
        };
        this.close = this.popup.querySelector('x-button[data-a="close"]');
        if (this.close)
            this.close.onclick = () => {
                this.destroy();
            };
        this.min = this.popup.querySelector('x-button[data-a="min"]');
        if (this.min)
            this.min.onclick = () => {
                this.toggle_min();
                popup.handle_on_top(this);
            };
        if (!this.options.hasClose)
            this.close.remove();
        if (!this.options.hasMin)
            this.min.remove();
        this.content_outer.onclick = () => {
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
        this.popup.style.zIndex = base_index + this.index;
    }
    reposition() {
        //console.log('reposition popup');
        this.popup.style.top = this.pos[1];
        this.popup.style.left = this.pos[0];
    }
    attach() {
        const destination = document.querySelector('x-main-area');
        destination?.append(this.popup);
    }
    destroy() {
        hooks.removeListener('onmousemove', this.onmousemove);
        hooks.removeListener('onmouseup', this.onmouseup);
        this.popup.remove();
        popups.splice(popups.indexOf(this), 1);
        this.options.onclose?.();
    }
    toggle_min() {
        this.minimized = !this.minimized;
        if (this.minimized) {
            this.content_outer.style.display = 'none';
            //this.min.querySelector('x-button-inner').innerHTML = '+';
        }
        else {
            this.content_outer.style.display = 'flex';
            //this.min.querySelector('x-button-inner').innerHTML = '-';
        }
    }
}
export default popup;
