var showKey = false;

define(function(require) {
    
var TransitionFlag = require('token').TransitionFlag();
    
class Node {

	constructor(redrawFlag, shape, text, name) {
		this.key = null;
        this.redrawFlag = redrawFlag;
		this.shape = shape;
		this.text = text;
		this.name = name; // identifier name or constant name if any
        this.focus = false;
		this.graph = null;
		this.group = null;
        this.transitionFlag = TransitionFlag.NONE;
        this.forceDraw = false;
		this.width = null;
		this.height = null;
		this.links = [];
		this.addToGraph(graph); // cheating!
	}

	addToGraph(graph, key) {
		if (graph != null)
			graph.addNode(this, key);
		this.graph = graph;
		return this; // to provide chain operation
	}

	addToGroup(group) {
		group.addNode(this);
		this.group = group;
		return this; // to provide chain operation
	}

	changeToGroup(group) {
		this.group.removeNode(this);
		this.addToGroup(group);
		return this;
	}

	findLinksConnected() {
		return this.links;
	}

	findLinksInto(toPort) {
		var links = [];
		for (let link of this.links) {
			if (link.to == this.key && (toPort == null ? true : link.toPort == toPort))
				links.push(link);
		}
		return links;
	}

	findLinksOutOf(fromPort) {
		var links = [];
		for (let link of this.links) {
			if (link.from == this.key && (fromPort == null ? true : link.fromPort == fromPort))
				links.push(link);
		}
		return links;
	}
    
    linkedToStart() {
        var linked = false;
        for(let link of this.findLinksInto("s")) {
            if(this.graph.findNodeByKey(link.from).linkedToStart()) {
                return true;
            }
        }
        return linked;
    }

	copy(graph) {
		var newNode = new Node(this.shape, this.text, this.name).addToGraph(graph);
		newNode.width = this.width;
		newNode.height = this.height;
        return newNode;
	}	
    
    duplicate(nodeMap, displayGraph) {
        var newNode = this.copy();
        newNode.forceDraw = this.forceDraw;
        nodeMap.set(this.key, newNode);
        if(this.focus) newNode.changeFocus(true);
        if(newNode != null) {
            this.graph.removeNode(newNode);
            newNode.addToGraph(displayGraph, this.key);
            nodeMap.set(this.key, newNode);
        }
        return newNode;
    }
    
    changeFocus(value) {
        this.focus = value;
        if(this.group) this.group.open = true;
    }
    
	// also delete any connected links
	delete() {
        if(this.group) {
            this.group.removeNode(this);   
        }
        if(this.graph) {
            this.graph.removeNode(this);
        }
	}
    
    transform() {
    }

    addToSubgraph(subgraph) {
        if(this.linkedToStart()) {
            if(this.forceDraw) {
                subgraph.root.addForcedNode(this.key);
                subgraph.root.addInternalNode(this.key);
                return false;
            }
            subgraph.addInternalNode(this.key);
            return true;
        }
        return false;
    }
    
	draw(level, snapshot, subgraph) {
        if(this.addToSubgraph(subgraph)) {
            return this.makeDot(level);   
        }
        return "";
	}
    
    isCopyableBox() {
        return false;
    }
    
    makeDot(level) {
        var str = level + this.key + '[label="' + this.text; 
        if (showKey)
            str += ':' + this.key;
        str += '"';
        if (this.shape != null)
            str += ',shape=' + this.shape;
        if (this.width != null)
            str += ',width=' + this.width;
        if (this.height != null)
            str += ',height=' + this.height;
        if (this.focus)
            str += ',style=filled,color=green3,fontcolor=white';
        return str += '];'
    }

	// machine instructions
	transition(token, link) {
		return link;
	}

	rewrite(token, nextLink) {
		token.rewrite = false;
        token.redraw = false;
		return nextLink;
	}
    
    //quick fix at VERY end, no time to do in a better way
    isAbs() {
        return false;
    }
}
    
return Node;
    
});