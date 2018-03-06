class Start extends Node {

	constructor() {
		super(RedrawFlag.NONE, "point", "");
	}
	
	transition(token) {
        token.redraw = true;
		if (token.link == null && token.dataStack.last() == CompData.PROMPT) {
			token.forward = true;
			return this.findLinksOutOf(null)[0];
		}
		else 
			return null;
	}
	
	copy() {
		return new Start();
	}
    
    linkedToStart() {
        return true;
    }

	draw(level, snapshot, subgraph) {
        subgraph.addInternalNode(this.key);
        this.displayGroup = subgraph;
        for(let link of this.findLinksOutOf()) {
            link.displayGroup = subgraph;
        }
        var str = '';
        str += (level + this.key + '[shape=' + this.shape);
        if(this.focus) {
            str += ',style=filled,color=green3,fontcolor=white';
        }
		str += '];'; 
        return str;
	}

}