class AbstractedGroup extends SubGraph { //for any group that remains closed instead of displaying contents
    constructor(level, label, shape, root, key, group) {
        super();
        this.level = level;
        this.label = label;
        this.shape = shape;
        this.root = root;
        this.key = key;
        this.upLinks = [];
        this.group = group;
        this.displayGroup = group.displayGroup;
        this.build();
    }
    
    build() {
        for(let node of Array.from(this.group.nodes)) { //gives actual nodes (not groups) within the pair
            node.addToSubgraph(this);   //never "drawn" so just have to add to group object
        }
        
        for(let nodeKey of this.internalNodes) {
            var node = this.root.graph.findNodeByKey(nodeKey);
            for(let link of node.findLinksOutOf()) {
                if(!this.sameLevel(nodeKey, link.to) && !this.atHigherLevelThan(link.to)) {
                    this.addUpLink(link);
                    if(node instanceof Pax || node instanceof Contract) {
                        if(node.name == "pair1" || node.name == "listHead") {
                            link.changeFrom(link.from, "w");
                        } else if(node.name == "pair2" || node.name == "listTail") {
                            link.changeFrom(link.from, "e");
                        }
                    }
                }
            }
        }
        this.dot = this.level + this.key + '[shape=' + this.shape + (this.hasFocus() ? ',style=filled,color=green3,fontcolor=white' : '') + ',label="' + this.label + '"];';
    }
    
    addUpLink(link) {
        this.upLinks.push(link);
    }
    
    hasFocus() {
        for(let node of this.internalNodes) {
            if(this.root.graph.findNodeByKey(node).focus) {
                return true;
            }
        }
        return false;
    }
    
    displayNodes(hide) {
        if(this.internalNodes.length != 0) {
            this.root.addDisplayNode(this.key);
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