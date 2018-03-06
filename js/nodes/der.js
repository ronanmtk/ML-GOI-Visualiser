class Der extends Expo {

	constructor(name, redrawFlag) {
        if(!name) {
            super(redrawFlag, null, "D", name);
        } else {
            super(redrawFlag, "rect", name, name);   
        }
	}

    transform() {
        if(this.text == "D") {
            if(this.focus) {
                this.changeFocus(false);
                this.graph.findNodeByKey(this.findLinksOutOf(null)[0].to).changeFocus(true);   
            }
            this.deleteAndPreserveInLink();
        }
    }
    
    transition(token, link) {
        if (this.text != "D") {
            token.determineRedraw();
        } else {
            token.redraw = false;
        }
        return super.transition(token, link);
    }
    
	copy() {
		var der = new Der(this.name, this.redrawFlag);
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
