class Weak extends Expo {

	constructor(name,redrawFlag) {
		super(redrawFlag, null, '?', name);
	}

	copy() {
		return new Weak(this.name, this.redrawFlag);
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