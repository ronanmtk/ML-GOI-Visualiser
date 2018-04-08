define(function(require) {
    
var CompData = require('token').CompData();
var RewriteFlag = require('token').RewriteFlag();
var Expo = require('nodes/expo');

class Contract extends Expo {

	constructor(name, redrawFlag) {
		super(redrawFlag, "square", name, name);
	}

	transition(token, link) {
        token.determineRedraw();
		if (link.to == this.key) {
			token.boxStack.push(link);
			token.rewriteFlag = RewriteFlag.F_C;
			return this.findLinksOutOf(null)[0];
		}
		else if (link.from == this.key && token.boxStack.length > 0) {
			return token.boxStack.pop();
		}
	}

	rewrite(token, nextLink) {
		if (token.rewriteFlag == RewriteFlag.F_C && nextLink.from == this.key) {
			token.rewriteFlag = RewriteFlag.EMPTY;

			if (this.findLinksInto(null).length == 1) {
				token.boxStack.pop();
				var inLink = this.findLinksInto(null)[0];
				nextLink.changeFrom(inLink.from, inLink.fromPort);
				this.delete();
			}
			else {
				var i = token.boxStack.last();
				var prev = this.graph.findNodeByKey(i.from);
				if (prev instanceof Contract) {
					token.boxStack.pop();
					for (let link of prev.findLinksInto(null)) {
						link.changeTo(this.key, "s");
					}
					prev.delete();
					token.rewriteFlag = RewriteFlag.F_C;
				} 
			}
			
            token.determineRedraw();
			token.rewrite = false;
			return nextLink;
		}
		
		else if (token.rewriteFlag == RewriteFlag.EMPTY) {
			token.rewrite = false;
            token.redraw = false;
			return nextLink;
		}
	}

	copy() {
		var con = new Contract(this.name, this.redrawFlag);
		con.text = this.text;
		return con;
	}
}
    
return Contract;
    
});