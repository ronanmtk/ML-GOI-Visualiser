define(function(require) {
    
var Expo = require('nodes/expo');

class Pax extends Expo {

	constructor(name, redrawFlag) {
		super(redrawFlag, null, "", name);
        this.width = ".0";
		this.height = ".0";
	}

	copy() {
		return new Pax(this.name, this.redrawFlag);
	}
    
    transition(token, link) {
        token.redraw = false;
        return super.transition(token, link);
    }

	delete() {
		this.group.auxs.splice(this.group.auxs.indexOf(this), 1);
		super.delete();
	}
}
   
return Pax;    

});