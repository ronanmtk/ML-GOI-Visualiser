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
            var groupIndex = snapshot.highIndex;
            snapshot.groupAdded();
            var grp = new ClosableGroup(level, snapshot, groupIndex, this);
            subgraph.children.set(groupIndex, grp);
            return "%%%"+groupIndex;
        } else if (this.nodes.length == 1) {
            return this.nodes[0].draw(level, snapshot, subgraph);
        }
	}
}