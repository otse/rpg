import popup from "./popup";
class third {
    static popup;
    static request_popup() {
        if (!third.popup) {
            third.popup = new popup({
                class: 'character',
                title: 'Character',
                zIndex: 2,
                onclose: () => { third.popup = undefined; }
            });
            third.popup.content_inner.innerHTML = `
				Strength: 10
			`;
            third.popup.attach();
        }
        else {
            third.popup.pos = [0, 0];
            third.popup.reposition();
        }
    }
}
export default third;
