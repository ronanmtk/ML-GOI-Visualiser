// general group in a graph (subgraph)
class Group extends Node {
	constructor(opened) {
		super(null, null, null); // shape, text, name
		this.nodes = [];
		this.links = []; // for copying
        this.open = opened;
	}

	addNode(node) {
		this.nodes.push(node);
	}

	removeNode(node) {
		return this.nodes.splice(this.nodes.indexOf(node), 1);
	}

	addLink(link) {
		this.links.push(link);
	}

	removeLink(link) {
		var i = this.links.indexOf(link);
		if (i != -1)
			this.links.splice(i, 1);
	}

	delete() {
		for (let node of Array.from(this.nodes)) {
			node.delete();
		}
		super.delete();
	}
    
    draw(level, snapshot, subgraph) {
        var str = "";
        for (let node of this.nodes) {
            str += node.draw(level, snapshot, subgraph);
        }
        return str;
    }
    
    addToSubgraph(subgraph) {
        for(let node of this.nodes) {
            node.addToSubgraph(subgraph);
        }
    }
    
    duplicate(nodeMap, displayGraph) {
        var newGroup = new Group(this.open);
        for(let node of this.nodes) {
            var newNode = node.duplicate(nodeMap, displayGraph);
            if(newNode) {
                newNode.addToGroup(newGroup);
            }
        }
        newGroup.addToGraph(displayGraph, this.key);
        return newGroup;
    }
}

// general box-ed subgraph
class Box extends Group {
	constructor(opened) {
		super(opened);
		this.nodes = [];
		this.links = [];
	}

	copy(graph) {
		// this shouldnt be call, since every box should be inside a wrapper
	}	
    
    duplicate(nodeMap, displayGraph) {
        var newGroup = new Box(this.open);
        for(let node of this.nodes) {
            var newNode = node.duplicate(nodeMap, displayGraph);
            if(newNode) {
                newNode.addToGroup(newGroup);
            }
        }
        newGroup.addToGraph(displayGraph, this.key);
        return newGroup;
    }

	draw(level, snapshot, subgraph) {
        if(this.nodes.length > 1) {
            this.displayGroup = subgraph;
            var grp = new ClosableGroup(level, snapshot, this.key, this);
            subgraph.children.set(this.key, grp);
            return "%%%"+this.key;
        } else if (this.nodes.length == 1) {
            return this.nodes[0].draw(level, snapshot, subgraph);
        }
	}
}

class PairBox extends Group {
    constructor() {
        super(false);
        this.nodes = [];
        this.links = [];
    }
    
    copy(graph) {
        //As with box, should be in a wrapper so this should never directly be called
    }
    
    duplicate(nodeMap, displayGraph) {
        var newGroup = new PairBox(this.open);
        for(let node of this.nodes) {
            var newNode = node.duplicate(nodeMap, displayGraph);
            if(newNode) {
                newNode.addToGroup(newGroup);
            }
        }
        newGroup.addToGraph(displayGraph, this.key);
        return newGroup;
    }
    
    draw(level, snapshot, subgraph) {
        this.displayGroup = subgraph;
        var grp = new AbstractedGroup(level, "pair", "doublecircle", snapshot, this.key, this);
        subgraph.children.set(this.key, grp);
        return "%%%"+this.key;
    }
    
}

class PairOpBox extends Group {
    constructor(label) {
        super(false);
        this.nodes = [];
        this.links = [];
        this.label = label;
    }
    
    copy(graph) {
        //As with box, should be in a wrapper so this should never directly be called
    }
    
    duplicate(nodeMap, displayGraph) {
        var newGroup = new PairOpBox(this.label);
        for(let node of this.nodes) {
            var newNode = node.duplicate(nodeMap, displayGraph);
            if(newNode) {
                newNode.addToGroup(newGroup);
            }
        }
        newGroup.addToGraph(displayGraph, this.key);
        return newGroup;
    }
    
    draw(level, snapshot, subgraph) {
        this.displayGroup = subgraph;
        var grp = new AbstractedGroup(level, this.label, "rect", snapshot, this.key, this);
        subgraph.children.set(this.key, grp);
        return "%%%"+this.key;
    }
    
}