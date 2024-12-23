import app from "../app.js";
import popup from "./popup.js";

class third {
	static popup?: popup;
	static request_popup() {
		if (!third.popup) {
			third.popup = new popup({
				class: 'terminal',
				title: 'Terminal',
				zIndex: 2,
				onclose: () => { third.popup = undefined }
			});
			third.popup.content_inner.innerHTML = `
				The computer buzzes monotonously.
				<x-terminal>
				<x-terminal-inner>
				Computer Booted!<br /><br />
				There are { two } files on this system.
				</x-terminal-inner>
				</x-terminal>
			`;
			third.popup.attach();
		}
		else
		{
			third.popup.pos = [0, 0];
			third.popup.reposition();
		}
	}
}

export default third;