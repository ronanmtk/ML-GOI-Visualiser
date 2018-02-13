class App extends Node {

	constructor() {
		super("rarrow", "apply");
	}
	
	transition(token, link) {
        token.redraw = true;
		if (link.to == this.key) {
			token.dataStack.push(CompData.PROMPT);
			return this.findLinksOutOf("e")[0];

			//token.dataStack.push(CompData.R);
			//return this.findLinksOutOf("w")[0];
		}
		else if (link.from == this.key && link.fromPort == "e") {
			token.dataStack.pop();
			token.dataStack.push(CompData.R);
			token.forward = true;
			return this.findLinksOutOf("w")[0];
		}
	}

	copy() {
		return new App();
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