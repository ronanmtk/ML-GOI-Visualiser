class Pax extends Expo {

	constructor(name) {
		super(null, "?", name);
	}

	copy() {
		return new Pax(this.name);
	}
    
    transition(token, link) {
        this.redraw = false;
        return super.transition(token, link);
    }

	delete() {
		this.group.auxs.splice(this.group.auxs.indexOf(this), 1);
		super.delete();
	}
    
    transform() {
        this.deleteAndPreserveInLink();
    }
}