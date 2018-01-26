// general graph
class Graph {
	
	constructor() {
		this.clear();
	}

	clear() {
		this.key = 0;
		this.linkKey = 0;
		this.allNodes = new Map(); // for efficiency searching
		this.allLinks = []; // for printing ONLY
		this.child = new Group(); 
        this.graphStack = [];
	}

	// give a key to a node and add it to allNodes
	addNode(node, copyKey) { //copyKey for clean transitions with new drawing
        if(!copyKey) {
            node.key = 'nd' + this.key;
		    this.key++;
        } else {
            node.key = copyKey;
        }
        this.allNodes.set(node.key, node);
	}

	// also removes connected links
	removeNode(node) {
		for (let link of Array.from(node.findLinksConnected())) {
			link.delete();
		}
		return this.allNodes.delete(node.key);
	}

	findNodeByKey(key) {
		return this.allNodes.get(key);
	}

	addLink(link) {
		this.allLinks.push(link);
	}

	removeLink(link) {
		this.allLinks.splice(this.allLinks.indexOf(link), 1);
	}
    
    transform() {
        for(let node of this.allNodes.values()) {
            node.transform();
        }
    }
    
    drawMid(current, hide) {
        return this.graphStack[current].display(hide);
    }

	drawNext(width, height, hide) {
        var displayGraph = new Graph();
        var nodeMap = new Map();
        var groups = [];
        displayGraph.child = this.child.duplicate(nodeMap, displayGraph);
        for(let link of this.allLinks) {
            var frm = nodeMap.get(link.from);
            var to = nodeMap.get(link.to);
            if(frm && to) {
                var newLink = new Link(frm.key, to.key, link.fromPort, link.toPort, link.reverse, true);
                newLink.addToGraph(displayGraph);
                newLink.addToNode();
            }
        }
        displayGraph.transform();

        var snapshot = new GraphShot(displayGraph, width, height);
        this.graphStack.push(snapshot);
        return snapshot.display(hide);
	}
}
