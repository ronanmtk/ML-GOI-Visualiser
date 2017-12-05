class Const extends Node {

	constructor(name) {
		super("square", name, name);
	}
	
	transition(token, link) {
        token.redraw = false;
		if (token.dataStack.last() == CompData.PROMPT && token.dataStack.pop()) {
			token.dataStack.push(this.name);
			token.forward = false;
			return link;
		}
	}

	copy() {
		return new Const(this.name);
	}
    
    duplicate(nodeMap, displayGraph) {
        var newNode = this.copy();
        nodeMap.set(this.key, newNode);
        if(this.focus) newNode.changeFocus(true);
        if(newNode != null) {
            this.graph.removeNode(newNode);
            newNode.addToGraph(displayGraph, this.key);
            nodeMap.set(this.key, newNode);
        }
        return newNode;
    }
}