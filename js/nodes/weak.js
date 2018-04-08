define(function(require) {
    
var Node = require('node');
var Expo = require('nodes/expo');

class Weak extends Expo {

	constructor(name,redrawFlag) {
		super(redrawFlag, null, '?', name);
	}

	copy() {
		return new Weak(this.name, this.redrawFlag);
	}
	
}
    
return Weak;
    
});