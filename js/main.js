var main;
(function (main) {
    let content_inner;
    function init() {
        console.log(' init ');
        content_inner = document.querySelector('x-popup.persist x-popup-content-inner');
        console.log('content inner', content_inner);
        rewrite();
    }
    main.init = init;
    function step() {
    }
    main.step = step;
    function rewrite() {
        /*content_inner.innerHTML = `
            You are at { location }
        `*/
    }
    main.rewrite = rewrite;
})(main || (main = {}));
export default main;
