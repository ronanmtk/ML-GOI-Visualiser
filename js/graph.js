class SubGraph {
    constructor() {
        this.templateMarker = "%%%";
        this.dot = "";
        this.internalNodes = [];
        this.openLinks = [];
        this.children = new Map();
    }
    
    addInternalNode(key) {
        this.internalNodes.push(key);
    }
    
    addLink(link) {
        this.openLinks.push(link);
    }
    
    sameLevel(node1, node2) {
        var firstFound = false;
        var secondFound = false;
        for(let node of this.internalNodes) {
            if(node == node1) {
                firstFound = true;
                if(secondFound) {
                    break;
                }
            }
            if(node == node2) {
                secondFound = true;
                if(firstFound) {
                    break;
                }
            }
        }
        return (firstFound && secondFound);
    }
    
    completeDotTemplates(hide) {
        var str = this.dot;
        for(let groupIndex of this.children.keys()) {
            str = str.replace(this.templateMarker+groupIndex,this.children.get(groupIndex).display(hide));
        }
        return str;
    }
    
}

class GraphShot extends SubGraph {
    constructor(graph, width, height) {
        super();
        this.graph = graph; //do not use after dot creation - wipe it??
        this.displayLinks = [];
        this.highIndex = 0;
        this.build(graph, width, height);
    }
    
    build(graph, width, height) {
        this.displayLinks = [];
        this.dot = 'digraph G {'
            //+'\n  rankdir=BT;'
            +'\n  rankdir=LR;'
            +'\n  edge[arrowhead=none,arrowtail=none];'
            +'\n  node[fixedsize=true,shape=circle]'
            +'\n  size="' + width + ',' + height + '";'
            +'\n  labeldistance=0;'
            +'\n  nodesep=.175;'
            +'\n  ranksep=.175;'
            +'\n';
        this.dot += graph.child.draw('\n  ', this, this, 0);
        
        //displaying top level links and matching children's links
        for(let node of this.internalNodes) {
            for(let link of this.graph.findNodeByKey(node).findLinksConnected()) {
                this.addLink(new DisplayLink(link, true));   
            }
        }
    }
    
    groupAdded() {
        this.highIndex++;
    }
    
    addDisplayLink(newLink, key) {
        var addLink = true;
        for(let link of this.displayLinks) {
            if(newLink.oldFrom == link.oldFrom && 
               newLink.oldTo == link.oldTo &&
               newLink.fromPort == link.fromPort &&
               newLink.toPort == link.toPort) {
                link.match();
                addLink = false;
                break;
            }
        }
        if(addLink) {
            this.displayLinks.push(newLink);
        }
    }
    
    display(hide) {
        var finalDot = this.completeDotTemplates(hide);
        finalDot += "\n";
        var linkDrawn;
        var linkIndex;
        for (let link of this.openLinks) {
            this.addDisplayLink(link);
        }
        for (let link of this.displayLinks) {
            finalDot += link.draw("\n  ");
        }
        this.displayLinks = [];
        
        return finalDot + "\n}";
    }
}

class ClosableGroup extends SubGraph {
    constructor(level, root, index, group) {
        super();
        this.level = level;
        this.label = "";
        this.index = index;
        this.key = "gp" + this.index;
        this.root = root;
        this.group = group;
        this.open = group.open;
        this.closed = "";
        this.extLinks = [];
        this.build();
    }
    
    build() {
        var otherNode;
        this.closed = this.level + this.key + '[shape=box,style=filled,color=lightgray,label='+this.key+'];';
        this.dot = this.level + 'subgraph cluster_' + this.group.key + ' {' 
                 + this.level + '  graph[style=dotted];';
        for(let node of Array.from(this.group.nodes)) {
            this.dot += node.draw(this.level+'  ', this.root, this, this.root.highIndex+1);
        }
        this.dot += this.level + '};';
        
        for(let node of this.internalNodes) {
            for(let link of this.root.graph.findNodeByKey(node).findLinksOutOf()) {
                if(this.sameLevel(node, link.to)) {
                    this.addLink(new DisplayLink(link, true));
                } else {
                    this.addExtLink(new DisplayLink(link, false, this.key, true));
                }
            }
            for(let link of this.root.graph.findNodeByKey(node).findLinksInto()) {
                if(this.sameLevel(node, link.from)) {
                    this.addLink(new DisplayLink(link, true));
                } else {
                    this.addExtLink(new DisplayLink(link, false, this.key, false));
                }
            }
        }
    }
    
    addExtLink(link) {
        this.extLinks.push(link);
    }
    
    display(hide) {
        if(!this.open && hide) {
            for(let link of this.extLinks) {
                this.root.addDisplayLink(link, this.key);
            }
            return this.closed;
        } else {
            for(let link of this.openLinks) {
                this.root.addDisplayLink(link);
            }
            for(let link of this.extLinks) {
                this.root.addDisplayLink(link.createNewOpenLink());
            }
            return this.completeDotTemplates(hide);
        }
    }
}

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
