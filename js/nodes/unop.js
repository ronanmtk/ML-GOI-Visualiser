class UnOp extends Node {

	constructor(text, redrawFlag) {
		super(redrawFlag, "Mcircle", text);
		this.subType = null;
	}

	transition(token, link) {
        if (this.graph.findNodeByKey(link.from).redrawFlag == this.redrawFlag) {
            token.determineRedraw(this.redrawFlag);
        } else {
            token.redraw = false;
        }
		if (link.to == this.key) {
			token.dataStack.push(CompData.PROMPT);
			return this.findLinksOutOf(null)[0];
		}
		else if (link.from == this.key) {
			if (token.dataStack[token.dataStack.length-2] == CompData.PROMPT) {
				var v1 = token.dataStack.pop();
						 token.dataStack.pop();
				token.dataStack.push(this.unOpApply(this.subType, v1));
				token.rewriteFlag = RewriteFlag.F_OP;
				return this.findLinksInto(null)[0];
			}
		}
	}

	rewrite(token, nextLink) {
		if (token.rewriteFlag == RewriteFlag.F_OP && nextLink.to == this.key) {
			token.rewriteFlag = RewriteFlag.EMPTY;
			var next = this.graph.findNodeByKey(this.findLinksOutOf(null)[0].to);
			if (next instanceof Promo) {
				var wrapper = BoxWrapper.create(this.redrawFlag).addToGroup(this.group);
				var newConst = new Const(token.dataStack.last(), this.redrawFlag).addToGroup(wrapper.box);
				var newLink = new Link(wrapper.prin.key, newConst.key, "n", "s").addToGroup(wrapper);
				nextLink.changeTo(wrapper.prin.key, "s");
				next.group.delete();
				this.delete();

				token.rewriteFlag = RewriteFlag.F_PROMO;
				token.rewrite = true;
                if (this.redrawFlag == RedrawFlag.NONE) {
                    token.determineRedraw(this.redrawFlag);
                } else {
                    token.redraw = false;
                }
				return newLink;
			} else {
                token.redraw = false;
            }

			token.rewrite = true;
			return nextLink;
		}

		else if (token.rewriteFlag == RewriteFlag.EMPTY) {
			token.rewrite = false;
            token.redraw = false;
			return nextLink;
		}
	}

	unOpApply(type, v1) {
		switch(type) {
			case UnOpType.Not: return !v1;
		}
	}

	copy() {
		var newNode = new UnOp(this.text, this.redrawFlag);
		newNode.subType = this.subType;
		return newNode;
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