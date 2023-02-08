import app from "./app";
import hooks from "./hooks";
import main from "./main";
import popup from "./popup";
import view from "./view";
import world_map from "./world map";
// fantasy:
// https://www.artstation.com/artwork/Z580PG
// https://www.artstation.com/artwork/GXnEN3
// post apo:
// https://www.artstation.com/artwork/68ax80
// https://www.artstation.com/artwork/q2doy
// https://www.artstation.com/artwork/1xQkG
// https://www.artstation.com/artwork/5B6KxW
var rpg;
(function (rpg) {
    function init() {
        console.log(' init ');
        world_map.init();
        popup.init();
        main.init();
        app;
        new view;
    }
    rpg.init = init;
    function step() {
        hooks.call('rpgStep', 0);
    }
    rpg.step = step;
})(rpg || (rpg = {}));
export default rpg;
