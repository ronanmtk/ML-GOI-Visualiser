class Pax extends Expo {

	constructor(name, redrawFlag) {
		super(redrawFlag, null, "", name);
        this.width = ".0";
		this.height = ".0";
	}

	copy() {
		return new Pax(this.name, this.redrawFlag);
	}
    
    transition(token, link) {
        token.redraw = false;
        return super.transition(token, link);
    }

	delete() {
		this.group.auxs.splice(this.group.auxs.indexOf(this), 1);
		super.delete();
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