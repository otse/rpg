import createGraph from 'ngraph.graph';
import ngraphPath from 'ngraph.path';
import { places } from './world map';
var pathfinder;
(function (pathfinder) {
    var graph = createGraph();
    function init() {
        setup_graph();
    }
    pathfinder.init = init;
    function setup_graph() {
        for (const place of places) {
            graph.addNode(place[1], { x: place[0][0], y: place[0][1] });
        }
        // Start at Nydal intersection
        graph.addNode('Three-way junction 1', { x: 1027, y: 746 }); // connects to road 1
        // Road from center to Nydal
        graph.addNode('Road 1', { x: 1037, y: 744 });
        graph.addNode('Road 2', { x: 1049, y: 745 }); // connects to Nydal
        graph.addLink('Three-way junction 1', 'Road 1');
        graph.addLink('Road 1', 'Road 2');
        graph.addLink('Road 2', 'Nydal');
        // Road from center to Brock
        graph.addNode('Road 3', { x: 1034, y: 675 });
        graph.addNode('Road 4', { x: 1024, y: 641 });
        graph.addNode('Road 5', { x: 1020, y: 603 });
        graph.addNode('Road 6', { x: 1014, y: 563 });
        graph.addNode('Road 7', { x: 996, y: 530 });
        graph.addNode('Three-way junction 2', { x: 988, y: 488 });
        graph.addLink('Three-way junction 1', 'Road 3');
        graph.addLink('Road 3', 'Road 4');
        graph.addLink('Road 4', 'Road 5');
        graph.addLink('Road 5', 'Road 6');
        graph.addLink('Road 6', 'Road 7');
        graph.addLink('Road 7', 'Three-way junction 2');
        graph.addNode('Three-way junction 3', { x: 964, y: 494 });
        graph.addNode('Road 8', { x: 962, y: 483 });
        graph.addNode('Road 9', { x: 961, y: 472 });
        graph.addNode('Road 10', { x: 952, y: 462 });
        graph.addLink('Three-way junction 2', 'Three-way junction 3');
        graph.addLink('Three-way junction 3', 'Road 8');
        graph.addLink('Road 8', 'Road 9');
        graph.addLink('Road 9', 'Road 10');
        graph.addLink('Road 10', 'Brock');
        // Now plot a road to Brock
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
    pathfinder.setup_graph = setup_graph;
    function search(from, to) {
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
        let path = pathFinder.find(from, to);
        path = path.reverse();
        return path;
    }
    pathfinder.search = search;
})(pathfinder || (pathfinder = {}));
export default pathfinder;
