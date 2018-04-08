define('closable-group', function(require) {
    
var SubGraph = require('subgraph');

class ClosableGroup extends SubGraph {
    constructor(level, root, key, group) {
        super();
        this.level = level;
        this.label = "";
        this.key = key;
        this.root = root;
        this.open = group.open;
        this.closed = "";
        this.upLinks = []; //links to a higher level
        this.build(group);
    }
    
    build(group) {
        this.closed = this.level + this.key + '[shape=box,style=filled,color=lightgray,label=""];';
        this.dot = this.level + 'subgraph cluster_' + this.key + ' {' 
                 + this.level + '  graph[style=dotted];';
        for(let node of Array.from(group.nodes)) {
            this.dot += node.draw(this.level+'  ', this.root, this);
        }
        this.dot += this.level + '};';
        
        var graph = group.graph;
        for(let node of this.internalNodes) {
            for(let link of graph.findNodeByKey(node).findLinksOutOf()) {
                if(this.sameLevel(node, link.to) || this.atHigherLevelThan(link.to)) {
                    this.addLink(link);
                } else {
                    this.addUpLink(link);
                }
            }
        }
    }
    
    addUpLink(link) {
        this.upLinks.push(link.duplicate());
    }
    
    displayNodes(hide) {
        if(this.internalNodes.length != 0) {
            if(!this.open && hide) {
                for(let node of this.getAllInternalNodes()) {
                    this.root.addDisplayNode(node, this.key);    
                }
                this.root.addDisplayNode(this.key, this.key);
                return this.closed;
            } else {
                for(let node of this.internalNodes) {
                    this.root.addDisplayNode(node, node);
                }
                return this.completeDotTemplates(hide);
            }    
        } else {
            return "";
        }
    }
    
    getLinksToDisplay(hide) {
        if(this.internalNodes.length != 0) {
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
        } else {
            return "";
        }
    }
}
    
return ClosableGroup;
    
});