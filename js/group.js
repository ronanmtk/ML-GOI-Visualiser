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
        subgraph.addGroup(this.key);
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
            var groupIndex = snapshot.highIndex;
            snapshot.groupAdded();
            var grp = new ClosableGroup(level, snapshot, groupIndex, this);
            subgraph.children.set(groupIndex, grp);
            return "%%%"+groupIndex;
        } else if (this.nodes.length == 1) {
            subgraph.addGroup(this.key);
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
        var groupIndex = snapshot.highIndex;
        snapshot.groupAdded();
        var grp = new AbstractedGroup(level, snapshot, groupIndex, this);
        subgraph.children.set(groupIndex, grp);
        return "%%%"+groupIndex;
    }
    
}

class PairTermWrapper extends Group {
    constructor(isFst) {
        super(false);
        this.nodes = [];
        this.links = [];
        this.isFst = isFst;
    }
    
    duplicate(nodeMap, displayGraph) {
        var newGroup = new PairTermWrapper(this.isFst);
        for(let node of this.nodes) {
            var newNode = node.duplicate(nodeMap, displayGraph);
            if(newNode) {
                newNode.addToGroup(newGroup);
            }
        }
        newGroup.addToGraph(displayGraph, this.key);
        return newGroup;
    }
    
    copyTerm(map) {
        var newPTWrapper = new PairTermWrapper(this.isFst);
        
        for(let node of this.nodes) {
            var newNode;
            if (node instanceof BoxWrapper) {
				newNode = node.copyBox(map).addToGroup(newPTWrapper);
			}
            else if (node instanceof PairTermWrapper) {
                newNode = node.copyTerm(map).addToGroup(newPTWrapper);
            }
			else {
				var newNode = node.copy().addToGroup(newPTWrapper);
				map.set(node.key, newNode.key);
			}
        }
        
        for (let link of this.links) {
            //Okay to just do this as all nodes need to be added to map before copying links (will be done in calling function)
            //AND this will only EVER get called from this function or BoxWrapper.copyBox (so within a box)
			link.changeToGroup(this.group);
		}
        
        return newPTWrapper;
    }
    
    draw(level, snapshot, subgraph) {
        var groupIndex = snapshot.highIndex;
        snapshot.groupAdded();
        var grp = new PairTermGroup(level, snapshot, groupIndex, this, subgraph);
        subgraph.children.set(groupIndex, grp);
        return "%%%"+groupIndex;
	}
}