class ClosableGroup extends SubGraph {
    constructor(level, root, key, group) {
        super();
        this.level = level;
        this.label = "";
        this.key = key;
        this.root = root;
        this.group = group;
        this.displayGroup = group.displayGroup;
        this.open = group.open;
        this.closed = "";
        this.upLinks = []; //links to a higher level
        this.build();
    }
    
    build() {
        this.closed = this.level + this.key + '[shape=box,style=filled,color=lightgray,label=""];';
        this.dot = this.level + 'subgraph cluster_' + this.key + ' {' 
                 + this.level + '  graph[style=dotted];';
        for(let node of Array.from(this.group.nodes)) {
            this.dot += node.draw(this.level+'  ', this.root, this);
        }
        this.dot += this.level + '};';
        
        for(let node of this.internalNodes) {
            for(let link of this.root.graph.findNodeByKey(node).findLinksOutOf()) {
                if(this.sameLevel(node, link.to) || this.atHigherLevelThan(link.to)) {
                    this.addLink(link);
                } else {
                    this.addUpLink(link);
                }
            }
        }
    }
    
    addUpLink(link) {
        this.upLinks.push(link);
    }
    
    displayNodes(hide) {
        if(!this.open && hide) {
            this.root.addDisplayNode(this.key);
            return this.closed;
        } else {
            for(let node of this.internalNodes) {
                this.root.addDisplayNode(node);
            }
            return this.completeDotTemplates(hide);
        }
    }
    
    getLinksToDisplay(hide) {
        if(this.open || !hide) {
            for(let link of this.openLinks) {
                this.root.addDisplayLink(link);
            }
            for(let key of this.children.keys()) {
                this.children.get(key).getLinksToDisplay(hide);
            }
        }
        for(let link of this.upLinks) {
            this.root.addDisplayLink(link);
        }
    }
}