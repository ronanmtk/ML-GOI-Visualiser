class Weak extends Expo {

	constructor(name,redrawFlag) {
		super(redrawFlag, null, '?', name);
	}

	copy() {
		return new Weak(this.name, this.redrawFlag);
	}
	
}