// general group in a graph (subgraph)
class Group extends Node {
	constructor() {
		super(null, null, null); // shape, text, name
		this.nodes = [];
		this.links = []; // for copying
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

	draw(level) {
		var str = "";
		for (let node of this.nodes) {
			str += node.draw(level);
		}
		return str;
	}
    
    duplicate(nodeMap, displayGraph) {
        var newGroup = new Group();
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
	constructor() {
		super();
		this.nodes = [];
		this.links = [];
	}

	copy(graph) {
		// this shouldnt be call, since every box should be inside a wrapper
	}	
    
    duplicate(nodeMap, displayGraph) {
        var newGroup = new Box();
        for(let node of this.nodes) {
            var newNode = node.duplicate(nodeMap, displayGraph);
            if(newNode) {
                newNode.addToGroup(newGroup);
            }
        }
        newGroup.addToGraph(displayGraph, this.key);
        return newGroup;
    }

	draw(level) {
		var str = "";
        if(this.nodes.length > 0) {
            for (let node of this.nodes) {
                str += node.draw(level + '  ');
            }
            return level + 'subgraph cluster_' + this.key + ' {' 
                 + level + '  graph[style=dotted];'
                 + str 
                 + level + '};';
        } else {
            return str;
        }
	}
}