class GraphShot extends SubGraph {
    constructor(graph, width, height) {
        super();
        this.key = "root";
        this.displayNodes = new Map();
        this.forcedNodes = [];
        this.displayLinks = [];
        this.build(graph, width, height);
    }
    
    build(graph, width, height) {
        this.displayLinks = [];
        this.dot = 'digraph G {'
            +'\n  rankdir=BT;'
            +'\n  edge[arrowhead=none,arrowtail=none];'
            +'\n  node[fixedsize=true,shape=circle]'
            +'\n  size="' + width + ',' + height + '";'
            +'\n  labeldistance=0;'
            +'\n  nodesep=.175;'
            +'\n  ranksep=.175;'
            +'\n';
        
        this.dot += graph.child.draw('\n  ', this, this);
        
        for(let node of this.forcedNodes) {
            this.dot += graph.findNodeByKey(node).makeDot('\n  ');
        }
        
        //displaying top level links and matching children's links
        for(let node of this.internalNodes) {
            for(let link of graph.findNodeByKey(node).findLinksOutOf()) {
                this.addLink(link);   
            }
        }
    }
    
    addDisplayLink(link) {
        var display = true;
        var newLink = link.duplicate(this.getDisplayedGroup(link.from), this.getDisplayedGroup(link.to));
        if((newLink.to == newLink.from) && (newLink.to != link.to)) {
            if(newLink.to != link.to) { //if the links are equal and links have been changed (loop onto self for group)
                display = false;
            }        
        }
        if(display) {
            this.displayLinks.push(newLink);
        }
        
    }
    
    addForcedNode(key) {
        this.forcedNodes.push(key);
    }
    
    addDisplayNode(key, displaykey) {
        this.displayNodes.set(key, displaykey);
    }
    
    getDisplayedGroup(node) {
        var found = false;
        var target = node;
        while(!found) {
            var group = this.displayNodes.get(target)
            if(target == group) {
                found = true;
            } else {
                target = group;
            }
        }
        return target;
    }
    
    display(hide) {
        this.displayNodes = new Map();
        //create dot for nodes hierarchically
        var finalDot = this.completeDotTemplates(hide);
        finalDot += "\n";
        //display everything at the top level
        for(let node of this.internalNodes) {
            this.addDisplayNode(node, node);
        }
        for (let link of this.openLinks) {
            this.addDisplayLink(link);
        }
        for (let child of this.children.keys()) {
            this.children.get(child).getLinksToDisplay(hide);
        }
        for (let link of this.displayLinks) {
            finalDot += link.draw("\n  ");
        }
        this.displayLinks = [];
        
        return finalDot + "\n}";
    }
}
