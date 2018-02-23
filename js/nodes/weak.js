class Weak extends Expo {

	constructor(redrawFlag) {
		super(redrawFlag, null, '?', null);
	}

	copy() {
		return new Weak(this.redrawFlag);
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