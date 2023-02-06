var main;
(function (main) {
    function init() {
        console.log(' init ');
    }
    main.init = init;
    function step() {
    }
    main.step = step;
})(main || (main = {}));
export default main;
