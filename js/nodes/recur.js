class Recur extends Expo {

	constructor() {
		super("invtrapezium", "rec");
		this.box = null;
	}

	transition(token, link) {
		if (link.to == this.key) {
			token.rewriteFlag = RewriteFlag.F_RECUR;
            token.redraw = true;
			return this.findLinksOutOf("e")[0];
		}
	}

	rewrite(token, nextLink) {
		if (token.rewriteFlag == RewriteFlag.F_RECUR && nextLink.from == this.key) {
			token.rewriteFlag = RewriteFlag.EMPTY;

			var wrapper = this.group.copy().addToGroup(this.group);
			
			var oldGroup = this.group;
			var oldBox = this.group.box;
			this.group.moveOut();
			var leftLink = this.findLinksInto("w")[0];
			leftLink.changeTo(wrapper.prin.key, "s");
			leftLink.fromPort = "n";
			leftLink.reverse = false;
			var inLink = this.findLinksInto("s")[0];
			var outLink = this.findLinksOutOf("e")[0];
			outLink.changeFrom(inLink.from, inLink.fromPort);

			Term.joinAuxs(wrapper.auxs, oldBox.auxs, wrapper.group);
			
			oldGroup.delete();

			token.rewrite = true;
            token.redraw = true;
			return nextLink;
		}

		else if (token.rewriteFlag == RewriteFlag.EMPTY) {
			token.rewrite = false;
            token.redraw = false;
			return nextLink;
		}
	}

	copy() {
		return new Recur();
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