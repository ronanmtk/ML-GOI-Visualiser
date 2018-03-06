class App extends Node {

	constructor(redrawFlag) {
		super(redrawFlag, "rarrow", "apply");
	}
	
	transition(token, link) {
		if (link.to == this.key) {
			token.dataStack.push(CompData.PROMPT);
            var otherEnd = this.graph.findNodeByKey(link.from);
            if(otherEnd.redrawFlag < this.redrawFlag && otherEnd instanceof App) {
                token.upChangeTransition(this.redrawFlag);
            } else {
                token.determineRedraw();
            }
			return this.findLinksOutOf("e")[0];
		}
		else if (link.from == this.key && link.fromPort == "e") {
			token.dataStack.pop();
			token.dataStack.push(CompData.R);
            var otherEnd = this.graph.findNodeByKey(link.to);
            if(otherEnd.redrawFlag > this.redrawFlag) {
                var force = false;
                if(otherEnd.transitionFlag == TransitionFlag.LISTEXIT) {
                    otherEnd.transitionFlag = TransitionFlag.NONE; //use once
                    force = true;
                }
                token.downChangeTransition(otherEnd.redrawFlag, force, RedrawFlag.INLIST);
            } else {
                token.determineRedraw();
            }
			token.forward = true;
			return this.findLinksOutOf("w")[0];
		}
	}

	copy() {
		return new App(this.redrawFlag);
	}
}