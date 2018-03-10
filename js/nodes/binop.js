class BinOp extends Node {

	constructor(text, redrawFlag) {
		super(redrawFlag, "Msquare", text);
		this.subType = null;
	}
	
	transition(token, link) {
		if (link.to == this.key) {
			token.dataStack.push(CompData.PROMPT);
            token.determineRedraw();
			return this.findLinksOutOf("e")[0];
		}
		else if (link.from == this.key && link.fromPort == "e") {
			token.dataStack.push(CompData.PROMPT);
			token.forward = true;
            token.determineRedraw();
			return this.findLinksOutOf("w")[0];
		}
		else if (link.from == this.key && link.fromPort == "w") {
			if (token.dataStack[token.dataStack.length-3] == CompData.PROMPT) {
				var l = token.dataStack.pop();
				var r = token.dataStack.pop();
			 			token.dataStack.pop();
			 	var result = this.binOpApply(this.subType, l, r);

				token.dataStack.push(result);
				token.rewriteFlag = RewriteFlag.F_OP;
                token.determineRedraw();
				return this.findLinksInto(null)[0];
			}
		}
	}

	rewrite(token, nextLink) {
        token.redraw = false;
		if (token.rewriteFlag == RewriteFlag.F_OP && nextLink.to == this.key) {
			token.rewriteFlag = RewriteFlag.EMPTY;

			var left = this.graph.findNodeByKey(this.findLinksOutOf("w")[0].to);
			var right = this.graph.findNodeByKey(this.findLinksOutOf("e")[0].to);

			if (left instanceof Promo && right instanceof Promo) {
				var wrapper = BoxWrapper.create(this.redrawFlag).addToGroup(this.group);
				var newConst = new Const(token.dataStack.last(), this.redrawFlag).addToGroup(wrapper.box);
				var newLink = new Link(wrapper.prin.key, newConst.key, "n", "s").addToGroup(wrapper);
				nextLink.changeTo(wrapper.prin.key, "s");
				
				left.group.delete();
				right.group.delete();
				this.delete();

				token.rewriteFlag = RewriteFlag.F_PROMO;
				token.rewrite = true;
                token.determineRedraw();
				return newLink;
			}

			token.rewrite = true;
            token.redraw = false;
			return nextLink;
		}

		else if (token.rewriteFlag == RewriteFlag.EMPTY) {
			token.rewrite = false;
            token.redraw = false;
			return nextLink;
		}
	}

	binOpApply(type, v1, v2) {
		switch(type) {
			case BinOpType.And: return v1 && v2;
			case BinOpType.Or: return v1 || v2;
			case BinOpType.Plus: return parseFloat(v1) + parseFloat(v2);
			case BinOpType.Sub: return parseFloat(v1) - parseFloat(v2);
			case BinOpType.Mult: return parseFloat(v1) * parseFloat(v2);
			case BinOpType.Div: return parseFloat(v1) / parseFloat(v2);
			case BinOpType.Lte: return parseFloat(v1) <= parseFloat(v2);
            case BinOpType.Lt: return parseFloat(v1) < parseFloat(v2);
            case BinOpType.Gte: return parseFloat(v1) >= parseFloat(v2);
            case BinOpType.Gt: return parseFloat(v1) > parseFloat(v2);
            case BinOpType.Eq: return parseFloat(v1) == parseFloat(v2);
		}
	}

	static createPlus() {
		var node = new BinOp("+");
		node.subType = BinOpType.Plus;
		return node;
	}

	static createMult() {
		var node = new BinOp("*");
		node.subType = BinOpType.Mult;
		return node;
	}

	copy() {
		var newNode = new BinOp(this.text, this.redrawFlag);
		newNode.subType = this.subType;
		return newNode;
	}
    
}