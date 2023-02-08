import createGraph from 'ngraph.graph';
import ngraphPath from 'ngraph.path';
import { places } from './world map';

namespace pathfinder {

	var graph = createGraph();

	export function init() {
		setup_graph();
	}

	export function setup_graph() {
		for (const place of places) {
			graph.addNode(place[1], { x: place[0][0], y: place[0][1] });
		}

		// Start at Nydal intersection
		graph.addNode('Three-way junction 1', { x: 1027, y: 746 }); // connects to road 1
		// Road from center to Nydal
		graph.addNode('Road 1', { x: 1037, y: 744 });
		graph.addNode('Road 2', { x: 1049, y: 745 });
		graph.addLink('Three-way junction 1', 'Road 1');
		graph.addLink('Road 1', 'Road 2');
		graph.addLink('Road 2', 'Nydal');
		// Road from center to Brock
		graph.addNode('Road 3', { x: 1034, y: 675 });
		graph.addNode('Road 4', { x: 1024, y: 641 });
		graph.addNode('Road 5', { x: 1020, y: 603 });
		graph.addNode('Three-way junction 1.1', { x: 1020, y: 595 });
		graph.addNode('Road 5.1', { x: 1001, y: 599 });
		graph.addNode('Road 6', { x: 1014, y: 563 });
		graph.addNode('Road 7', { x: 996, y: 530 });
		graph.addNode('Three-way junction 2', { x: 988, y: 488 });
		graph.addLink('Three-way junction 1', 'Road 3');
		graph.addLink('Road 3', 'Road 4');
		graph.addLink('Road 4', 'Road 5');
		graph.addLink('Road 5', 'Three-way junction 1.1');
		graph.addLink('Three-way junction 1.1', 'Road 5.1');
		graph.addLink('Road 5.1', 'Everlyn');
		graph.addLink('Three-way junction 1.1', 'Road 6');
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
		// We made it to Brock, now to Ludwig
		graph.addNode('Road 11', { x: 930, y: 502 });
		graph.addNode('Road 12', { x: 887, y: 531 });
		graph.addNode('Road 13', { x: 802, y: 532 });
		graph.addNode('Road 14', { x: 734, y: 548 });
		graph.addNode('Three-way junction 4', { x: 711, y: 574 });
		graph.addNode('Road 15', { x: 702, y: 572 });
		graph.addNode('Road 16', { x: 689, y: 573 });
		graph.addNode('Road 17', { x: 675, y: 568 });
		graph.addLink('Three-way junction 3', 'Road 11');
		graph.addLink('Road 11', 'Road 12');
		graph.addLink('Road 12', 'Road 13');
		graph.addLink('Road 13', 'Road 14');
		graph.addLink('Road 14', 'Three-way junction 4');
		graph.addLink('Three-way junction 4', 'Road 15');
		graph.addLink('Road 15', 'Road 16');
		graph.addLink('Road 16', 'Road 17');
		graph.addLink('Road 17', 'Ludwig');
		// Now from Ludwig to Callaway
		graph.addNode('Road 18', { x: 711, y: 578 });
		graph.addNode('Road 19', { x: 708, y: 600 });
		graph.addNode('Road 20', { x: 718, y: 631 });
		graph.addNode('Road 21', { x: 714, y: 651 });
		graph.addNode('Road 22', { x: 705, y: 673 });
		graph.addNode('Three-way junction 5', { x: 711, y: 710 });
		graph.addLink('Three-way junction 4', 'Road 18');
		graph.addLink('Road 18', 'Road 19');
		graph.addLink('Road 19', 'Road 20');
		graph.addLink('Road 20', 'Road 21');
		graph.addLink('Road 21', 'Road 22');
		graph.addLink('Road 22', 'Three-way junction 5'); // Empty Y junction
		// Now to callaway
		graph.addNode('Road 23', { x: 711, y: 762 });
		graph.addNode('Road 24', { x: 718, y: 810 });
		graph.addNode('Road 25', { x: 725, y: 854 });
		graph.addNode('Three-way junction 6', { x: 727, y: 862 });
		graph.addNode('Road 26', { x: 713, y: 864 });
		graph.addNode('Road 27', { x: 701, y: 865 });
		graph.addNode('Road 28', { x: 676, y: 870 });
		graph.addLink('Three-way junction 5', 'Road 23');
		graph.addLink('Road 23', 'Road 24');
		graph.addLink('Road 24', 'Road 25');
		graph.addLink('Road 25', 'Three-way junction 6');
		graph.addLink('Three-way junction 6', 'Road 26');
		graph.addLink('Road 26', 'Road 27');
		graph.addLink('Road 27', 'Road 28');
		graph.addLink('Road 28', 'Callaway');
		// Made it to Callaway, now to Dent
		graph.addNode('Road 29', { x: 734, y: 885 });
		graph.addNode('Road 30', { x: 754, y: 901 });
		graph.addNode('Road 31', { x: 795, y: 937 });
		graph.addNode('Road 32', { x: 848, y: 959 });
		graph.addNode('Road 33', { x: 896, y: 981 });
		graph.addNode('Three-way junction 7', { x: 920, y: 976 });
		graph.addLink('Three-way junction 6', 'Road 29');
		graph.addLink('Road 29', 'Road 30');
		graph.addLink('Road 30', 'Road 31');
		graph.addLink('Road 31', 'Road 32');
		graph.addLink('Road 32', 'Road 33');
		graph.addLink('Road 33', 'Three-way junction 7');
		graph.addLink('Three-way junction 7', 'Dent');
		// Made it to Dent, now to Mason
		graph.addNode('Road 34', { x: 941, y: 971 });
		graph.addNode('Road 35', { x: 976, y: 976 });
		graph.addNode('Road 36', { x: 1015, y: 972 });
		graph.addNode('Three-way junction 8', { x: 1043, y: 962 });
		graph.addNode('Road 37', { x: 1070, y: 967 });
		graph.addNode('Road 38', { x: 1083, y: 979 });
		graph.addNode('Road 39', { x: 1097, y: 981 });
		graph.addNode('Road 40', { x: 1115, y: 984 });
		graph.addLink('Three-way junction 7', 'Road 34');
		graph.addLink('Road 34', 'Road 35');
		graph.addLink('Road 35', 'Road 36');
		graph.addLink('Road 36', 'Three-way junction 8');
		graph.addLink('Three-way junction 8', 'Road 37');
		graph.addLink('Road 37', 'Road 38');
		graph.addLink('Road 38', 'Road 39');
		graph.addLink('Road 39', 'Road 40');
		graph.addLink('Road 40', 'Mason');
		// Now from Mason to Branville
		graph.addNode('Road 41', { x: 1045, y: 935 });
		graph.addNode('Three-way junction 9', { x: 1036, y: 841 });
		graph.addNode('Road 42', { x: 1059, y: 840 });
		graph.addNode('Road 43', { x: 1077, y: 835 });
		graph.addNode('Road 44', { x: 1089, y: 840 });
		graph.addLink('Three-way junction 8', 'Road 41');
		graph.addLink('Road 41', 'Three-way junction 9');
		graph.addLink('Three-way junction 9', 'Road 42');
		graph.addLink('Road 42', 'Road 43');
		graph.addLink('Road 43', 'Road 44');
		graph.addLink('Road 44', 'Branville');
		// Now from Branville to Nydal
		graph.addLink('Three-way junction 9', 'Three-way junction 1');
		// From Nydal to empty Y junction aka Three-way junction 5
		graph.addNode('Road 45', { x: 982, y: 745 });
		graph.addNode('Road 46', { x: 935, y: 736 });
		graph.addNode('Road 47', { x: 865, y: 736 });
		graph.addNode('Road 48', { x: 800, y: 721 });
		graph.addLink('Three-way junction 1', 'Road 45');
		graph.addLink('Road 45', 'Road 46');
		graph.addLink('Road 46', 'Road 47');
		graph.addLink('Road 47', 'Road 48');
		graph.addLink('Road 48', 'Three-way junction 5');
		// From Three-way junction 2 to New Clarks
		graph.addNode('Road 49', { x: 1008, y: 438 });
		graph.addNode('Three-way junction 10', { x: 1017, y: 390 });
		graph.addNode('Road 50', { x: 991, y: 377 });
		graph.addNode('Three-way junction 11', { x: 984, y: 375 });
		graph.addNode('Road 51', { x: 986, y: 360 });
		graph.addNode('Road 52', { x: 994, y: 342 });
		graph.addLink('Three-way junction 2', 'Road 49');
		graph.addLink('Road 49', 'Three-way junction 10');
		graph.addLink('Three-way junction 10', 'Road 50');
		graph.addLink('Road 50', 'Three-way junction 11');
		graph.addLink('Three-way junction 11', 'Road 51');
		graph.addLink('Road 51', 'Road 52');
		graph.addLink('Road 52', 'New Clarks');
		// Now loop around the mountain to Nook
		graph.addNode('Road 53', { x: 919, y: 368 });
		graph.addNode('Road 54', { x: 848, y: 387 });
		graph.addNode('Road 55', { x: 799, y: 378 });
		graph.addNode('Road 56', { x: 761, y: 363 });
		graph.addNode('Road 57', { x: 753, y: 327 });
		graph.addNode('Three-way junction 12', { x: 760, y: 303 });
		graph.addNode('Road 58', { x: 744, y: 292 });
		graph.addLink('Three-way junction 11', 'Road 53');
		graph.addLink('Road 53', 'Road 54');
		graph.addLink('Road 54', 'Road 55');
		graph.addLink('Road 55', 'Road 56');
		graph.addLink('Road 56', 'Road 57');
		graph.addLink('Road 57', 'Three-way junction 12');
		graph.addLink('Three-way junction 12', 'Road 58');
		graph.addLink('Road 58', 'Nook');
		// Now Nook to Bell
		graph.addNode('Road 59', { x: 762, y: 301 });
		graph.addNode('Road 60', { x: 822, y: 249 });
		graph.addNode('Road 61', { x: 901, y: 211 });
		graph.addNode('Road 62', { x: 927, y: 201 });
		graph.addNode('Road 63', { x: 986, y: 200 });
		graph.addNode('Road 64', { x: 1056, y: 208 });
		graph.addNode('Three-way junction 13', { x: 1087, y: 217 });
		graph.addNode('Road 65', { x: 1094, y: 201 });
		graph.addLink('Three-way junction 12', 'Road 59');
		graph.addLink('Road 59', 'Road 60');
		graph.addLink('Road 60', 'Road 61');
		graph.addLink('Road 61', 'Road 62');
		graph.addLink('Road 62', 'Road 63');
		graph.addLink('Road 63', 'Road 64');
		graph.addLink('Road 64', 'Three-way junction 13');
		graph.addLink('Three-way junction 13', 'Road 65');
		graph.addLink('Road 65', 'Bell');
		// Now Bell to Three-way junction 10
		graph.addNode('Road 66', { x: 1109, y: 224 });
		graph.addNode('Road 67', { x: 1119, y: 237 });
		graph.addNode('Road 68', { x: 1121, y: 293 });
		graph.addNode('Road 69', { x: 1110, y: 312 });
		graph.addNode('Road 70', { x: 1052, y: 344 });
		graph.addNode('Road 71', { x: 1031, y: 363 });
		graph.addLink('Three-way junction 13', 'Road 66');
		graph.addLink('Road 66', 'Road 67');
		graph.addLink('Road 67', 'Road 68');
		graph.addLink('Road 68', 'Road 69');
		graph.addLink('Road 69', 'Road 70');
		graph.addLink('Road 70', 'Road 71');
		graph.addLink('Road 71', 'Three-way junction 10');
		
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

	export function search(from: string, to: string) {
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
}

export default pathfinder;