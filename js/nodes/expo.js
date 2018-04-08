define(function(require) {
    
var Node = require('node');

class Expo extends Node {

	constructor(redrawFlag, shape, text, name) {
		super(redrawFlag, shape, text, name);
		this.width = ".4";
		this.height = ".4";
	}

	transition(token, link) {
		if (link.to == this.key) {
			return this.findLinksOutOf(null)[0];
		}
		else if (link.from == this.key) {
			return this.findLinksInto(null)[0];
		}
	}

	deleteAndPreserveInLink() { 
		var inLink = this.findLinksInto(null)[0];
		var outLink = this.findLinksOutOf(null)[0];
		if (outLink != null && inLink != null) {
			inLink.changeTo(outLink.to, outLink.toPort);
		}
		super.delete();
	}

	deleteAndPreserveOutLink() { 
		var inLink = this.findLinksInto(null)[0];
		var outLink = this.findLinksOutOf(null)[0];
		if (inLink != null && outLink != null) {
			outLink.changeFrom(inLink.from, inLink.fromPort);
		}
		super.delete();
	}
}
    
return Expo;
    
});