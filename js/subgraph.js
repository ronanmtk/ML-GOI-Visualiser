class SubGraph {
    constructor() {
        this.templateMarker = "%%%";
        this.dot = "";
        this.internalNodes = [];
        this.openLinks = [];
        this.children = new Map();
    }
    
    addInternalNode(key) {
        this.internalNodes.push(key);
    }
    
    addLink(link) {
        this.openLinks.push(link);
    }
    
    sameLevel(node1, node2) {
        var firstFound = false;
        var secondFound = false;
        for(let node of this.internalNodes) {
            if(node == node1) {
                firstFound = true;
                if(secondFound) {
                    break;
                }
            }
            if(node == node2) {
                secondFound = true;
                if(firstFound) {
                    break;
                }
            }
        }
        return (firstFound && secondFound);
    }
    
    completeDotTemplates(hide) {
        var str = this.dot;
        for(let groupIndex of this.children.keys()) {
            str = str.replace(this.templateMarker+groupIndex,this.children.get(groupIndex).display(hide));
        }
        return str;
    }
    
}