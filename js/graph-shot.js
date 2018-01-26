class GraphShot extends SubGraph {
    constructor(graph, width, height) {
        super();
        this.graph = graph; //do not use after dot creation - wipe it??
        this.displayLinks = [];
        this.highIndex = 0;
        this.build(graph, width, height);
    }
    
    build(graph, width, height) {
        this.displayLinks = [];
        this.dot = 'digraph G {'
            //+'\n  rankdir=BT;'
            +'\n  rankdir=LR;'
            +'\n  edge[arrowhead=none,arrowtail=none];'
            +'\n  node[fixedsize=true,shape=circle]'
            +'\n  size="' + width + ',' + height + '";'
            +'\n  labeldistance=0;'
            +'\n  nodesep=.175;'
            +'\n  ranksep=.175;'
            +'\n';
        this.dot += graph.child.draw('\n  ', this, this, 0);
        
        //displaying top level links and matching children's links
        for(let node of this.internalNodes) {
            for(let link of this.graph.findNodeByKey(node).findLinksConnected()) {
                this.addLink(new DisplayLink(link, true));   
            }
        }
    }
    
    groupAdded() {
        this.highIndex++;
    }
    
    addDisplayLink(newLink, key) {
        var addLink = true;
        for(let link of this.displayLinks) {
            if(newLink.oldFrom == link.oldFrom && 
               newLink.oldTo == link.oldTo &&
               newLink.fromPort == link.fromPort &&
               newLink.toPort == link.toPort) {
                link.match();
                addLink = false;
                break;
            }
        }
        if(addLink) {
            this.displayLinks.push(newLink);
        }
    }
    
    display(hide) {
        var finalDot = this.completeDotTemplates(hide);
        finalDot += "\n";
        var linkDrawn;
        var linkIndex;
        for (let link of this.openLinks) {
            this.addDisplayLink(link);
        }
        for (let link of this.displayLinks) {
            finalDot += link.draw("\n  ");
        }
        this.displayLinks = [];
        
        return finalDot + "\n}";
    }
}