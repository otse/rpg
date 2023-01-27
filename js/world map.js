import popup from "./popup";
class world_map {
    static popup;
    static request_popup() {
        if (!world_map.popup) {
            world_map.popup = new popup({
                class: 'a',
                title: 'boo'
            });
            world_map.popup.attach();
        }
    }
}
export default world_map;
