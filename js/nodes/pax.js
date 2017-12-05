class Pax extends Expo {

	constructor(name) {
		super(null, "", name);
        this.width = ".0";
		this.height = ".0";
	}

	copy() {
		return new Pax(this.name);
	}
    
    transition(token, link) {
        this.redraw = false;
        return super.transition(token, link);
    }

	delete() {
		this.group.auxs.splice(this.group.auxs.indexOf(this), 1);
		super.delete();
	}
    
    transform() {
        var outLink = this.findLinksOutOf(null)[0];
        var inLink = this.findLinksInto(null)[0];
        if(outLink.reverse) {
            outLink.changeFrom(this.key, "w");
            inLink.reverse = true;
            inLink.changeTo(this.key, "e");
        }
        else {
            outLink.changeFrom(this.key, "e");
            inLink.changeTo(this.key, "w");
        }
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