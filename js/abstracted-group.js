class AbstractedGroup extends SubGraph { //for any group that remains closed instead of displaying contents
    constructor(level, label, shape, root, key, group) {
        super();
        this.level = level;
        this.label = label;
        this.shape = shape;
        this.root = root;
        this.key = key;
        this.upLinks = [];
        this.build(group);
    }
    
    build(group) {
        //gives actual nodes (not groups) within the pair
        for(let node of Array.from(group.nodes)) {
            node.addToSubgraph(this);   //never "drawn" so just have to add to group object
        }
        
        var graph = group.graph;
        for(let nodeKey of this.internalNodes) {
            var node = graph.findNodeByKey(nodeKey);
            for(let link of node.findLinksOutOf()) {
                if(!this.sameLevel(nodeKey, link.to) && !this.atHigherLevelThan(link.to)) {
                    if(node instanceof Pax || node instanceof Contract) {
                        if(node.name == "pair1" || node.name == "listHead") {
                            link.changeFrom(link.from, "w");
                        } else if(node.name == "pair2" || node.name == "listTail") {
                            link.changeFrom(link.from, "e");
                        }
                    }
                    this.addUpLink(link);
                }
            }
        }
        this.dot = this.level + this.key + '[shape=' + this.shape + (this.hasFocus(graph) ? ',style=filled,color=green3,fontcolor=white' : '') + ',label="' + this.label + '"];';
    }
    
    addUpLink(link) {
        this.upLinks.push(link.duplicate());
    }
    
    hasFocus(graph) {
        for(let node of this.internalNodes) {
            if(graph.findNodeByKey(node).focus) {
                return true;
            }
        }
        return false;
    }
    
    displayNodes(hide) {
        if(this.internalNodes.length != 0) {
            for(let node of this.internalNodes) {
                this.root.addDisplayNode(node, this.key);    
            }
            this.root.addDisplayNode(this.key, this.key);
            return this.dot;   
        } else {
            return "";
        }
    }
    
    getLinksToDisplay(hide) {
        if(this.internalNodes.length != 0) {
            for(let link of this.upLinks) {
                this.root.addDisplayLink(link);
            }   
        }   
    }
}