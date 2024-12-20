import app from "./app.js";
import hooks from "./hooks.js";
import main from "./main.js";
import pathfinder from "./pathfinder.js";
import popup from "./popup.js";
import view from "./view.js";
import world_map from "./world map.js";
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
    function sample(a) {
        return a[Math.floor(Math.random() * a.length)];
    }
    rpg.sample = sample;
    function clamp(val, min, max) {
        return val > max ? max : val < min ? min : val;
    }
    rpg.clamp = clamp;
    function init() {
        console.log(' init ');
        world_map.init();
        pathfinder.init();
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
