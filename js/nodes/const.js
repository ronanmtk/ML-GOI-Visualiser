define(function(require) {
    
var Node = require('node');
var CompData = require('token').CompData();

class Const extends Node {

	constructor(name, redrawFlag) {
		super(redrawFlag, "circle", name, name);
	}
	
	transition(token, link) {
        token.determineRedraw();
		if (token.dataStack.last() == CompData.PROMPT && token.dataStack.pop()) {
			token.dataStack.push(this.name);
			token.forward = false;
			return link;
		}
	}

	copy() {
		return new Const(this.name, this.redrawFlag);
	}
}
   
return Const;
    
});