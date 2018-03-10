class SubGraph {
    constructor() {
        this.templateMarker = "%%%";
        this.dot = "";
        this.key = "";
        this.internalNodes = [];
        this.openLinks = [];
        this.children = new Map();
    }
    
    addInternalNode(key) {
        this.internalNodes.push(key);
    }
    
    addLink(link) {
        this.openLinks.push(link.duplicate());
    }
    
    containsNode(key, nodeCollection) {
        if(!nodeCollection)
            nodeCollection = this.internalNodes;
        for(let node of nodeCollection) {
            if(node == key)
                return true;
        }
        return false;
    }
    
    getAllInternalNodes(allNodes) {
        if(!allNodes) allNodes = [];
        for(let node of this.internalNodes) {
            allNodes.push(node);
        }
        for(let key of this.children.keys()) {
            this.children.get(key).getAllInternalNodes(allNodes);
        }
        return allNodes;
    }
    
    atHigherLevelThan(node) {
        for(let key of this.children.keys()) {
            var group = this.children.get(key);
            return group.containsNode(node) || group.atHigherLevelThan(node);
        }
        return false;
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
            str = str.replace(this.templateMarker+groupIndex,this.children.get(groupIndex).displayNodes(hide));
        }
        return str;
    }
    
}