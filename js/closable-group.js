class ClosableGroup extends SubGraph {
    constructor(level, root, index, group) {
        super();
        this.level = level;
        this.label = "";
        this.index = index;
        this.key = "gp" + this.index;
        this.root = root;
        this.group = group;
        this.open = group.open;
        this.closed = "";
        this.extLinks = [];
        this.build();
    }
    
    build() {
        var otherNode;
        this.closed = this.level + this.key + '[shape=box,style=filled,color=lightgray,label='+this.key+'];';
        this.dot = this.level + 'subgraph cluster_' + this.group.key + ' {' 
                 + this.level + '  graph[style=dotted];';
        for(let node of Array.from(this.group.nodes)) {
            this.dot += node.draw(this.level+'  ', this.root, this, this.root.highIndex+1);
        }
        this.dot += this.level + '};';
        
        for(let node of this.internalNodes) {
            for(let link of this.root.graph.findNodeByKey(node).findLinksOutOf()) {
                if(this.sameLevel(node, link.to)) {
                    this.addLink(new DisplayLink(link, true));
                } else {
                    this.addExtLink(new DisplayLink(link, false, this.key, true));
                }
            }
            for(let link of this.root.graph.findNodeByKey(node).findLinksInto()) {
                if(this.sameLevel(node, link.from)) {
                    this.addLink(new DisplayLink(link, true));
                } else {
                    this.addExtLink(new DisplayLink(link, false, this.key, false));
                }
            }
        }
    }
    
    addExtLink(link) {
        this.extLinks.push(link);
    }
    
    display(hide) {
        if(!this.open && hide) {
            for(let link of this.extLinks) {
                this.root.addDisplayLink(link, this.key);
            }
            return this.closed;
        } else {
            for(let link of this.openLinks) {
                this.root.addDisplayLink(link);
            }
            for(let link of this.extLinks) {
                this.root.addDisplayLink(link.createNewOpenLink());
            }
            return this.completeDotTemplates(hide);
        }
    }
}