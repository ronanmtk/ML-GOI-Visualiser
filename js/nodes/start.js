class Start extends Node {

	constructor() {
		super("point", "");
	}
	
	transition(token) {
        token.redraw = true;
		if (token.link == null && token.dataStack.last() == CompData.PROMPT) {
			token.forward = true;
			return this.findLinksOutOf(null)[0];
		}
		else 
			return null;
	}
	
	copy() {
		return new Start();
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

	draw(level) {
        var str = '';
        str += (level + this.key + '[shape=' + this.shape);
        if(this.focus) {
            str += ',style=filled,color=green,fontcolor=white';
        }
		str += '];'; 
        return str;
	}

}