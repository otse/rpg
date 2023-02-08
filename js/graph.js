import createGraph from 'ngraph.graph';
import ngraphPath from 'ngraph.path';
var paths;
(function (paths) {
    paths.places = [
        [false, [995, 326], 'New Clarks'],
        [true, [947, 447], 'Brock'],
        [false, [667, 570], 'Ludwig'],
        [false, [658, 874], 'Callaway'],
        [true, [916, 957], 'Dent'],
        [false, [1142, 997], 'Mason'],
        [false, [1134, 833], 'Branville'],
        [true, [1063, 744], 'Nydal'],
        [false, [982, 601], 'Everlyn'],
    ];
    var graph = createGraph();
    function init() {
        setup_graph();
        search();
    }
    paths.init = init;
    function setup_graph() {
        for (const place of paths.places) {
            graph.addNode(place[2], { x: place[1][0], y: place[1][1] });
        }
        // Start at Nydal intersection
        graph.addNode('Three-way junction', { x: 1027, y: 746 });
        // Road to Nydal
        graph.addNode('Road 1', { x: 1037, y: 744 });
        graph.addNode('Road 2', { x: 1049, y: 745 });
        graph.addLink('Road 2', 'Nydal');
        // road 2 links to Nydal
        /*graph.addNode('NYC', { x: 0, y: 0 });
        graph.addNode('Boston', { x: 1, y: 1 });
        graph.addNode('Philadelphia', { x: -1, y: -1 });
        graph.addNode('Washington', { x: -2, y: -2 });*/
        // and railroads:
        /*graph.addLink('NYC', 'Boston');
        graph.addLink('NYC', 'Philadelphia');
        graph.addLink('Philadelphia', 'Washington');*/
    }
    paths.setup_graph = setup_graph;
    setup_graph();
    {
    }
    function search() {
        let pathFinder = ngraphPath.aStar(graph, {
            distance(fromNode, toNode) {
                // In this case we have coordinates. Lets use them as
                // distance between two nodes:
                let dx = fromNode.data.x - toNode.data.x;
                let dy = fromNode.data.y - toNode.data.y;
                return Math.sqrt(dx * dx + dy * dy);
            },
            heuristic(fromNode, toNode) {
                // this is where we "guess" distance between two nodes.
                // In this particular case our guess is the same as our distance
                // function:
                let dx = fromNode.data.x - toNode.data.x;
                let dy = fromNode.data.y - toNode.data.y;
                return Math.sqrt(dx * dx + dy * dy);
            }
        });
        this.path = pathFinder.find('Nydal', 'Brock');
        this.path = this.path.reverse();
        this.plySeg = 0;
        console.log(`path`, this.path);
    }
    paths.search = search;
})(paths || (paths = {}));
export default paths;
