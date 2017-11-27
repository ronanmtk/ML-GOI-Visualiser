class Recur extends Expo {

	constructor() {
		super(null, "rec");
		this.box = null;
	}

	transition(token, link) {
		if (link.to == this.key) {
			token.rewriteFlag = RewriteFlag.F_RECUR;
            token.redraw = true;
			return this.findLinksOutOf("e")[0];
		}
	}

	rewrite(token, nextLink) {
		if (token.rewriteFlag == RewriteFlag.F_RECUR && nextLink.from == this.key) {
			token.rewriteFlag = RewriteFlag.EMPTY;

			var wrapper = this.group.copy().addToGroup(this.group);
			
			var oldGroup = this.group;
			var oldBox = this.group.box;
			this.group.moveOut();
			var leftLink = this.findLinksInto("w")[0];
			leftLink.changeTo(wrapper.prin.key, "s");
			leftLink.fromPort = "n";
			leftLink.reverse = false;
			var inLink = this.findLinksInto("s")[0];
			var outLink = this.findLinksOutOf("e")[0];
			outLink.changeFrom(inLink.from, inLink.fromPort);

			Term.joinAuxs(wrapper.auxs, oldBox.auxs, wrapper.group);
			
			oldGroup.delete();

			token.rewrite = true;
            token.redraw = true;
			return nextLink;
		}

		else if (token.rewriteFlag == RewriteFlag.EMPTY) {
			token.rewrite = false;
            token.redraw = false;
			return nextLink;
		}
	}
    
    transform() {
        for(let link of this.findLinksOutOf("e")) {
            link.changeFrom(this.key, "n");
        }
        for(let link of this.findLinksInto("w")) {
            link.changeTo(this.key, "e");
        }
        for(let link of this.findLinksInto("s")) {
            link.changeTo(this.key, "w");
        }
    }

	copy() {
		return new Recur();
	}
}