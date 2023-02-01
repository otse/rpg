import hooks from "./hooks";
import pts from "./pts";
import app from "./app";
import popup from "./popup";
class world_map {
    static instance;
    popup;
    dragging = false;
    world_map;
    pos = [0, 0];
    drag_start = [0, 0];
    drag = [0, 0];
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
        this.popup = new popup({
            class: 'world-map',
            title: 'World Map',
            zIndex: 2,
            onclose: () => { world_map.instance = undefined; }
        });
        this.popup.content_inner.innerHTML = `
			<x-world-map>
				<x-world-map-inner>
				</x-world-map-inner>
			</x-world-map>
		`;
        this.world_map = this.popup.content_inner.querySelector('x-world-map');
        /*this.world_map.ontouchmove = (e) => {
            e.preventDefault();
        }*/
        if (!app.mobile) {
            this.onmouseup = (e) => {
                this.dragging = false;
                this.world_map.classList.remove('dragging');
            };
            this.onmousemove = (e) => {
                if (this.dragging) {
                    this.pos = pts.subtract(this.drag_start, app.mouse());
                    this.reposition();
                }
            };
            this.world_map.onmousedown = this.world_map.ontouchstart = (e) => {
                let pos = app.mouse();
                if (e.clientX) {
                    pos[0] = e.clientX;
                    pos[1] = e.clientY;
                }
                else {
                    pos[0] = e.pageX;
                    pos[1] = e.pageY;
                }
                this.drag_start = pts.add(pos, this.pos);
                this.world_map.classList.add('dragging');
                this.dragging = true;
            };
            hooks.register('onmouseup', this.onmouseup);
            hooks.register('onmousemove', this.onmousemove);
        }
        this.popup.attach();
    }
    reposition() {
        const el = this.world_map;
        const maxWidth = Math.max(el.clientWidth, el.scrollWidth, el.offsetWidth) - el.clientWidth;
        const maxHeight = Math.max(el.clientHeight, el.scrollHeight, el.offsetHeight) - el.clientWidth;
        this.pos = pts.clamp(this.pos, [0, 0], [maxWidth, maxHeight]);
        console.log('reposition world-map', this.pos);
        this.world_map.scrollLeft = this.pos[0];
        this.world_map.scrollTop = this.pos[1];
    }
}
export default world_map;
