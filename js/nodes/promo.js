class Promo extends Expo {

	constructor(redrawFlag) {
		super(redrawFlag, null, "!", null);
	}

	transition(token, link) {
		if (link.to == this.key) {
            token.redraw = false;
			token.rewriteFlag = RewriteFlag.F_PROMO;
			return this.findLinksOutOf(null)[0];
		}
		else if (link.from == this.key) {
            if (this.graph.findNodeByKey(link.from).redrawFlag == this.redrawFlag) {
                token.determineRedraw(this.redrawFlag);
            } else {
                token.redraw = false;
            }
			return this.findLinksInto(null)[0];
		}
	}

	rewrite(token, nextLink) {
        token.redraw = false;
		if (token.rewriteFlag == RewriteFlag.F_PROMO) {
			token.rewriteFlag = RewriteFlag.EMPTY;
			var prev = this.graph.findNodeByKey(this.findLinksInto(null)[0].from);

			if (prev instanceof Der) {
				var oldGroup = this.group;
				oldGroup.moveOut(); // this.group is a box-wrapper
				oldGroup.deleteAndPreserveLink();
				var newNextLink = prev.findLinksInto(null)[0];
				prev.deleteAndPreserveInLink(); // preserve inLink
				token.rewrite = true;
				return newNextLink;
			}
			else if (prev instanceof Contract && token.boxStack.length >= 1) {
				if (nextLink.from == this.key) {
					var link = token.boxStack.pop();
					var inLinks = prev.findLinksInto(null);
					if (inLinks.length == 1) { 
						// this will not happen as the C-node should have taken care of it
					}
					else {
						var newBoxWrapper = this.group.copy().addToGroup(this.group.group);
						Term.joinAuxs(this.group.auxs, newBoxWrapper.auxs, newBoxWrapper.group, this.redrawFlag);
						prev.findLinksOutOf(null)[0].changeTo(newBoxWrapper.prin.key, prev.findLinksOutOf(null)[0].toPort);
						link.changeTo(this.key, "s");
					}
					token.rewriteFlag = RewriteFlag.F_PROMO;
				}
			} 
			token.rewrite = true;
			return nextLink;
		}
		
		else if (token.rewriteFlag == RewriteFlag.EMPTY) {
			token.rewrite = false;
			return nextLink;
		}
	}
    
    //ONLY ever called on the display representation of the graph
    transform() {
        if(this.focus) {
            this.changeFocus(false);
            this.graph.findNodeByKey(this.findLinksOutOf(null)[0].to).changeFocus(true);   
        }
        this.deleteAndPreserveInLink();
    }

	copy() {
		return new Promo(this.redrawFlag);
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