import app from "./app";
import view from "./view";
// https://www.artstation.com/artwork/Z580PG
// https://www.artstation.com/artwork/GXnEN3
var rpg;
(function (rpg) {
    function init() {
        console.log(' init ');
        app;
        new view;
    }
    rpg.init = init;
    function step() {
    }
    rpg.step = step;
})(rpg || (rpg = {}));
export default rpg;
