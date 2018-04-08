define('group', function(require) {
    
var Node = require('node');
    
// general group in a graph (subgraph)
class Group extends Node {
	constructor(opened) {
		super(null, null, null); // shape, text, name
		this.nodes = [];
		this.links = []; // for copying
        this.open = opened;
	}

	addNode(node) {
		this.nodes.push(node);
	}

	removeNode(node) {
		return this.nodes.splice(this.nodes.indexOf(node), 1);
	}

	addLink(link) {
		this.links.push(link);
	}

	removeLink(link) {
		var i = this.links.indexOf(link);
		if (i != -1)
			this.links.splice(i, 1);
	}

	delete() {
		for (let node of Array.from(this.nodes)) {
			node.delete();
		}
		super.delete();
	}
    
    getDisplayedGroup() {
        if(this.group) {
            return this.group.getDisplayedGroup();
        }
        return null;
    }
    
    draw(level, snapshot, subgraph) {
        var str = "";
        for (let node of this.nodes) {
            str += node.draw(level, snapshot, subgraph);
        }
        return str;
    }
    
    addToSubgraph(subgraph) {
        for(let node of this.nodes) {
            node.addToSubgraph(subgraph);
        }
    }
    
    duplicate(nodeMap, displayGraph) {
        var newGroup = this.getBasicCopy();
        for(let node of this.nodes) {
            var newNode = node.duplicate(nodeMap, displayGraph);
            if(newNode) {
                newNode.addToGroup(newGroup);
            }
        }
        newGroup.addToGraph(displayGraph, this.key);
        return newGroup;
    }
    
    getBasicCopy() {
        return new Group(this.open);
    }
}
    
return Group;

});

define('displayed-group', function(require) {
	
var Group = require('group');

class DisplayedGroup extends Group {
    constructor(opened) {
        super(opened);
        this.blocking = true;
    }
    
    getDisplayedGroup() {
        if(this.group) {
            var higherLevelGroup = this.group.getDisplayedGroup();
            if(higherLevelGroup) {
                return higherLevelGroup;
            }
        }
        return this;
    }
    
    duplicate(nodeMap, displayGraph) {
        var newGroup = this.getBasicCopy();
        newGroup.blocking = this.blocking;
        for(let node of this.nodes) {
            var newNode = node.duplicate(nodeMap, displayGraph);
            if(newNode) {
                newNode.addToGroup(newGroup);
            }
        }
        newGroup.addToGraph(displayGraph, this.key);
        return newGroup;
    }
    
    getBasicCopy() {
        return new Group(this.open);
    }
    
    showContents() {
        this.blocking = false;
    }
    
    draw(level, snapshot, subgraph) {
        if(!this.blocking) {
            return super.draw(level, snapshot, subgraph);
        } else {
            var grp = this.getDrawingGroup(level,snapshot,subgraph);
            subgraph.children.set(this.key, grp);
            return "%%%"+this.key;
        }
    }
}
    
return DisplayedGroup;
    
});

define('box', function(require) {
    
var DisplayedGroup = require('displayed-group');
var ClosableGroup = require('closable-group');

// general box-ed subgraph
class Box extends DisplayedGroup {
	constructor(opened) {
		super(opened);
		this.nodes = [];
		this.links = [];
	}

	copy(graph) {
		// this shouldnt be call, since every box should be inside a wrapper
	}
    
    getBasicCopy() {
        return new Box(this.open);
    }

	draw(level, snapshot, subgraph) {
        if(this.nodes.length > 1) {
            return super.draw(level, snapshot, subgraph);
        } else if (this.nodes.length == 1) {
            return this.nodes[0].draw(level, snapshot, subgraph);
        }
	}
    
    getDrawingGroup(level, snapshot, subgraph) {
        return new ClosableGroup(level, snapshot, this.key, this);
    }
}
    
return Box;
    
});

define('copyable-box', function(require) {
    
var DisplayedGroup = require('displayed-group');
var BoxWrapper = require('box-wrapper');
var Link = require('link');

class CopyableBox extends DisplayedGroup {
    constructor() {
      super(false);
    }
    
    isCopyableBox() {
        return true;
    }
    
    copyBox(map) {
        var boxCopy = this.getBasicCopy();
        for(let node of this.nodes) {
            if(node instanceof BoxWrapper || node.isCopyableBox()) {
                node.copyBox(map).addToGroup(boxCopy);
            } else {
                var newNode = node.copy().addToGroup(boxCopy);
                map.set(node.key, newNode.key);
            }
        }
        
        for (let link of this.links) {
            var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort,                 link.toPort).addToGroup(boxCopy);
            newLink.reverse = link.reverse;
        }
        
        return boxCopy;
    }
}
    
return CopyableBox;
    
});

define('pair-box', function(require) {
    
var CopyableBox = require('copyable-box');
var AbstractedGroup = require('abstracted-group');

class PairBox extends CopyableBox {
    constructor() {
        super(false);
    }
    
    copy(graph) {
        //As with box, should be in a wrapper so this should never directly be called
    }
    
    getBasicCopy() {
        return new PairBox();
    }
    
    getDrawingGroup(level, snapshot, subgraph) {
        return new AbstractedGroup(level, "pair", "doublecircle", snapshot, this.key, this);
    }
    
    addToGroup(wrapper) {
        wrapper.addNode(this, true);
        this.group = wrapper;
        return this;
    }
    
}
    
return PairBox;
    
});

define('empty-list-box', function(require) {
    
var CopyableBox = require('copyable-box');
var AbstractedGroup = require('abstracted-group');

class EmptyListBox extends CopyableBox {
    constructor() {
        super(false);
    }
    
    getBasicCopy() {
        return new EmptyListBox();
    }
    
    getDrawingGroup(level, snapshot, subgraph) {
        return new AbstractedGroup(level, "[ ]", "circle", snapshot, this.key, this);
    }
}
    
return EmptyListBox;
    
});

define('cons-box', function(require) {
    
var CopyableBox = require('copyable-box');
var AbstractedGroup = require('abstracted-group');

class ConsBox extends CopyableBox {
    constructor() {
        super(false);
    }
    
    getBasicCopy() {
        return new ConsBox();
    }
    
    getDrawingGroup(level, snapshot, subgraph) {
        return new AbstractedGroup(level, "::", "hexagon", snapshot, this.key, this);
    }
}
    
return ConsBox;
    
});

define('pair-op-box', function(require) {
    
var CopyableBox = require('copyable-box');
var AbstractedGroup = require('abstracted-group');

class PairOpBox extends CopyableBox {
    constructor(label) {
        super(false);
        this.label = label;
    }
    
    getBasicCopy() {
        return new PairOpBox(this.label);
    }
    
    getDrawingGroup(level, snapshot, subgraph) {
        return new AbstractedGroup(level, this.label, "rect", snapshot, this.key, this);
    }
    
}
    
return PairOpBox;
    
});


define('list-op-box', function(require) {
    
var CopyableBox = require('copyable-box');
var AbstractedGroup = require('abstracted-group');
    
class ListOpBox extends CopyableBox {
    constructor(label) {
        super(false);
        this.label = label;
    }
    
    getBasicCopy() {
        return new ListOpBox(this.label);
    }
    
    getDrawingGroup(level, snapshot, subgraph) {
        return new AbstractedGroup(level, this.label, "rect", snapshot, this.key, this);
    }
    
}
    
return ListOpBox;
    
});