class Der extends Expo {

	constructor(name) {
        if(name == undefined) {
            super(null, "D", name);
        } else {
            super(null, name, name);   
        }
	}

    transform() {
        if(this.text == "D") {
            this.deleteAndPreserveInLink();
        } else {
            for(let link of this.findLinksOutOf(null)) {
                link.changeFrom(this.key, "w");
            }
            super.transform();
        }   
    }
    
    transition(token, link) {
        token.redraw = (this.text != "D");
        return super.transition(token, link);
    }
    
	copy() {
		var der = new Der(this.name);
		der.text = this.text;
		return der;
	}
}

class Var extends Der {

	deleteAndPreserveOutLink() { 
		var inLink = this.findLinksInto(null)[0];
		var outLink = this.findLinksOutOf(null)[0];
		var inNode = this.graph.findNodeByKey(inLink.from);
		if (inLink != null && outLink != null) {
			if (this.graph.findNodeByKey(outLink.to) instanceof Abs && (inNode instanceof Expo))
				outLink.changeFrom(inLink.from, "nw");
			else
				outLink.changeFrom(inLink.from, inLink.fromPort);
		}
		super.delete();
	}

}
