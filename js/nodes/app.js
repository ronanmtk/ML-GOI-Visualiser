class App extends Node {

	constructor(redrawFlag) {
		super(redrawFlag, "rarrow", "apply");
	}
	
	transition(token, link) {
		if (link.to == this.key) {
			token.dataStack.push(CompData.PROMPT);
            token.determineRedraw();
			return this.findLinksOutOf("e")[0];
		}
		else if (link.from == this.key && link.fromPort == "e") {
			token.dataStack.pop();
			token.dataStack.push(CompData.R);
            var otherFlag = this.graph.findNodeByKey(link.to).redrawFlag;
            if(otherFlag > this.redrawFlag) {
                token.downChangeTransition(otherFlag);
            } else {
                token.determineRedraw();
            }
			token.forward = true;
			return this.findLinksOutOf("w")[0];
		}
	}

	copy() {
		return new App(this.redrawFlag);
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