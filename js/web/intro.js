import popup from "./popup.js";
class intro {
    static popup;
    static request_popup() {
        if (!intro.popup) {
            intro.popup = new popup({
                class: 'intro',
                title: 'Intro',
                zIndex: 2,
                onclose: () => { intro.popup = undefined; }
            });
            intro.popup.content_inner.innerHTML = `
				Here is the intro 
			`;
            intro.popup.attach();
        }
        else {
            intro.popup.pos = [0, 0];
            intro.popup.reposition();
        }
    }
}
export default intro;
