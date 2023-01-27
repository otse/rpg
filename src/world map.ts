import app from "./app";
import popup from "./popup";

class world_map {
    static popup: popup;
    static request_popup() {
        if (!world_map.popup) {
            world_map.popup = new popup({
                class: 'a',
                title: 'The World Map'
            });
            world_map.popup.attach();
        }
    }
}

export default world_map;