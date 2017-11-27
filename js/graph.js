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
        /*node.key = 'nd' + this.key;
        this.allNodes.set(node.key, node);
        this.key++;*/
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
    
    drawMid(width, height, current) {
        return this.graphStack[current];
    }

	drawNext(width, height) {
        var displayGraph = new Graph();
        var nodeMap = new Map();
        for(let node of this.allNodes.values()) {
            if(!(node instanceof Group)) { //only want vanilla nodes
                var newNode = node.copy();
                this.removeNode(newNode);
                if(newNode != null) {
                    newNode.addToGraph(displayGraph, node.key);
                    nodeMap.set(node.key, newNode); //map of old node to new node
                }
            } 
        }
        for(let link of this.allLinks) {
            var frm = nodeMap.get(link.from);
            var to = nodeMap.get(link.to);
            if(frm && to) {
                var newLink = new Link(frm.key, to.key, link.fromPort, link.toPort, link.reverse, true);
                if(link.hasFocus) newLink.focus("green");
                newLink.addToGraph(displayGraph);
                newLink.addToNode();
            }
        }
        displayGraph.transform();
        var str = '';
        for(let node of displayGraph.allNodes.values()) {
            str += node.draw('\n  ');
        }
        str += '\n';
        for (let link of displayGraph.allLinks) {
            str += link.draw('\n  ');
        }
        var graphDot = 'digraph G {'
            //+'\n  rankdir=BT;'
            +'\n  rankdir=LR;'
            +'\n  edge[arrowhead=none,arrowtail=none];'
            +'\n  node[fixedsize=true,shape=circle]'
            +'\n  size="' + width + ',' + height + '";'
            +'\n  labeldistance=0;'
            +'\n  nodesep=.175;'
            +'\n  ranksep=.175;'
            +'\n' 
            +     str 
            +'\n}';
        this.graphStack.push(graphDot);
        return graphDot;
	}
}
