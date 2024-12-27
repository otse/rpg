import popup from "./popup.js";
class character {
    static popup;
    static request_popup() {
        if (!character.popup) {
            character.popup = new popup({
                class: 'character',
                title: 'Character',
                hasMin: true,
                hasClose: true,
                zIndex: 2,
                onclose: () => { character.popup = undefined; }
            });
            character.popup.content.innerHTML = `
				Strength: 10
			`;
            character.popup.attach();
        }
        else {
            character.popup.pos = [0, 0];
            character.popup.reposition();
        }
    }
}
export default character;
