class GraphShot extends SubGraph {
    constructor(graph, width, height) {
        super();
        this.graph = graph; //do not use after dot creation - wipe it??
        this.key = "root";
        this.displayNodes = [];
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
        
        //displaying top level links and matching children's links
        for(let node of this.internalNodes) {
            for(let link of this.graph.findNodeByKey(node).findLinksOutOf()) {
                this.addLink(link);   
            }
        }
    }
    
    addDisplayLink(link) {
        var fromExists = this.containsNode(link.from, this.displayNodes);
        var toExists = this.containsNode(link.to, this.displayNodes);
        
        //can't edit original links as that changes internal representation of graph
        var newLink = link;
        var changed = false;
        if(!fromExists) {
            var group = this.getDisplayedGroup(this.graph.findNodeByKey(newLink.from));
            if(group != "root") {
                newLink = new Link(group, newLink.to, newLink.fromPort, newLink.toPort, newLink.reverse, true);
                changed = true;
            }
        }
        if(!toExists) {
            var group = this.getDisplayedGroup(this.graph.findNodeByKey(newLink.to));
            if(group != "root") {
                newLink = new Link(newLink.from, group, newLink.fromPort, newLink.toPort, newLink.reverse, true);
                changed = true;
            }
        }
        //same as (!changed || (changed && !=) )
        //don't display self-looping links onto groups, but do if they exist on standard nodes
        if(!(changed && (newLink.to == newLink.from)))
            this.displayLinks.push(newLink);
        
    }
    
    addDisplayNode(key) {
        this.displayNodes.push(key);
    }
    
    getDisplayedGroup(node) {
        var found = false;
        var target = node;
        while(!found) {
            if(target.key == "root") {
                found = true;
            } else {
                found = this.containsNode(target.key, this.displayNodes);
                if(!found) {
                    target = target.displayGroup;
                }
            }
        }
        return target.key;
    }
    
    display(hide) {
        this.displayNodes = [];
        //create dot for nodes hierarchically
        var finalDot = this.completeDotTemplates(hide);
        finalDot += "\n";
        //display everything at the top level
        for(let node of this.internalNodes) {
            this.addDisplayNode(node);
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
