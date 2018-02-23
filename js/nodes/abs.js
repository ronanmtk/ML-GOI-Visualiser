class Abs extends Node {

	constructor(redrawFlag) {
		super(redrawFlag, "ellipse", "fun");
	}
	
	transition(token, link) {
		if (link.to == this.key && link.toPort == "s") {
			var data = token.dataStack.last();
			if (data == CompData.PROMPT) {
				token.dataStack.pop();
				token.dataStack.push(CompData.LAMBDA);
				token.forward = false;
                token.redraw = false;
				return link;
			}
			else if (data == CompData.R) {
				token.dataStack.pop();
				token.rewriteFlag = RewriteFlag.F_LAMBDA;
                if (this.graph.findNodeByKey(link.from).redrawFlag == this.redrawFlag) {
                    token.determineRedraw(this.redrawFlag);
                } else {
                    token.redraw = false;
                }
				return this.findLinksOutOf(null)[0];
			}
		}
	}

	rewrite(token, nextLink) {
		if (token.rewriteFlag == RewriteFlag.F_LAMBDA && nextLink.from == this.key) {
			token.rewriteFlag = RewriteFlag.EMPTY;

			var app = this.graph.findNodeByKey(this.findLinksInto("s")[0].from);
			if (app instanceof App) {
				// M rule
				var appLink = app.findLinksInto(null)[0];
				var appOtherLink = app.findLinksOutOf("e")[0];
				var otherNextLink = this.findLinksInto("w")[0];

				nextLink.changeFrom(appLink.from, appLink.fromPort);
				nextLink.changeToGroup(appLink.group);
				
				otherNextLink.changeTo(appOtherLink.to, appOtherLink.toPort);
				otherNextLink.reverse = false;

				var otherNode = this.graph.findNodeByKey(otherNextLink.from);
				if (otherNode instanceof Expo) 
					otherNextLink.fromPort = "n";
				otherNextLink.changeToGroup(appOtherLink.group);
				
				this.delete();
				app.delete();
                
                if (this.redrawFlag == RedrawFlag.NONE) {
                    token.determineRedraw(this.redrawFlag);
                } else {
                    token.redraw = false;
                }
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

	copy() {
		return new Abs(this.redrawFlag);
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