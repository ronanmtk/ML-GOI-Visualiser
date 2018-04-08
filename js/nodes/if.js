define(function(require) {
    
var Node = require('node');
var CompData = require('token').CompData();
var RewriteFlag = require('token').RewriteFlag();
var RedrawFlag = require('token').RedrawFlag();
var Promo = require('nodes/promo');
var Weak = require('nodes/weak');

class If extends Node {

	constructor(redrawFlag) {
		super(redrawFlag, "diamond", "if");
	}

	transition(token, link) {
		if (link.to == this.key) {
			token.dataStack.push(CompData.PROMPT);
            token.determineRedraw();
			return this.findLinksOutOf("w")[0];
		}
		else if (link.from == this.key && link.fromPort == "w") {
			if (token.dataStack.last() == true) {
				token.dataStack.pop();
				token.rewriteFlag = RewriteFlag.F_IF;
				token.forward = true;
                token.determineRedraw();
				return this.findLinksOutOf("n")[0];
			}
			else if (token.dataStack.last() == false) {
				token.dataStack.pop();
				token.rewriteFlag = RewriteFlag.F_IF;
				token.forward = true;
                token.determineRedraw();
				return this.findLinksOutOf("e")[0];
			}
		} 
	}

	rewrite(token, nextLink) {
		if (token.rewriteFlag == RewriteFlag.F_IF && nextLink.from == this.key) {
			token.rewriteFlag = RewriteFlag.EMPTY;
			
			var left = this.graph.findNodeByKey(this.findLinksOutOf("w")[0].to);
			if (left instanceof Promo) {
				var downLink = this.findLinksInto(null)[0];
				var otherLink = this.findLinksOutOf(nextLink.fromPort == "n"?"e":"n")[0];
				nextLink.changeFrom(downLink.from, downLink.fromPort);
				var weak = new Weak(this.graph.findNodeByKey(otherLink.to).name, RedrawFlag.NONE).addToGroup(this.group);
				otherLink.changeFrom(weak.key, "n");
				this.delete();
				left.group.delete();
			}
            token.redraw = false;
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
		return new If(this.redrawFlag);
	}
}
   
return If;    
    
});