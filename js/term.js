// specific group for a term in the calculus
class Term extends Group {

	constructor(prin, auxs) {
		super();
		this.set(prin, auxs)
	}

	set(prin, auxs){
		this.prin = prin;
		this.auxs = auxs;
		return this;
	}

	createPaxsOnTopOf(auxs, redrawFlag) {
		var newPaxs = [];
		for (let pax of auxs) {
			var newPax = new Pax(pax.name, redrawFlag).addToGroup(this);
			
			if (pax.findLinksOutOf(null).length == 0)
				new Link(pax.key, newPax.key, "n", "s").addToGroup(this);
			else {
				var outLink = pax.findLinksOutOf(null)[0];
				new Link(newPax.key, outLink.to, "n", outLink.toPort).addToGroup(this.group);
				outLink.changeTo(newPax.key, "s");
				outLink.changeToGroup(this);
			}
			newPaxs.push(newPax);
		}
		return newPaxs;
	}

	static joinAuxs(leftAuxs, rightAuxs, group, redrawFlag) {
		var newAuxs = leftAuxs.concat(rightAuxs);
		outter:
		for (let leftAux of leftAuxs) {
			for (let rightAux of rightAuxs) {
				if (leftAux.name == rightAux.name) {
					var con = new Contract(leftAux.name, redrawFlag).addToGroup(group);

					var outLink = leftAux.findLinksOutOf(null)[0];
					if (typeof outLink != 'undefined') {
						outLink.changeFrom(con.key, outLink.fromPort);
					}

					new Link(rightAux.key, con.key, "n", "s").addToGroup(group);
					new Link(leftAux.key, con.key, "n", "s").addToGroup(group);
					newAuxs.splice(newAuxs.indexOf(leftAux), 1);
					newAuxs.splice(newAuxs.indexOf(rightAux), 1);
					newAuxs.push(con);

					continue outter;
				}
			}
		}
		return newAuxs;
	}
}

// !-box 
class BoxWrapper extends Term {

	constructor(prin, box, auxs) {
		super(prin, auxs);
		this.box = box;
	}

	static create(redrawFlag) {
		var wrapper = new BoxWrapper();
		var box = new Box().addToGroup(wrapper);
		var promo = new Promo(redrawFlag).addToGroup(wrapper);
		wrapper.set(promo, box, []);
		return wrapper;
	}

	set(prin, box, auxs) {
		super.set(prin, auxs);
		this.box = box;
	}

	removeAux(aux) {
		this.auxs.splice(this.auxs.indexOf(aux), 1);
		aux.deleteAndPreserveOutLink();
	}

	moveOut() {
		for (let link of Array.from(this.box.links)) {
			link.changeToGroup(this.group);
		}
		for (let link of Array.from(this.links)) {
			link.changeToGroup(this.group);
		}
		for (let node of Array.from(this.box.nodes)) {
			node.changeToGroup(this.group);
		}
		for (let aux of Array.from(this.auxs)) {
			aux.changeToGroup(this.group);
		}
		this.prin.changeToGroup(this.group);
		for (let node of Array.from(this.nodes)) {
			node.changeToGroup(this.group);
		}
	}

	copyBox(map) {
		var newBoxWrapper = new BoxWrapper();
		var newPrin = this.prin.copy().addToGroup(newBoxWrapper);
		newBoxWrapper.prin = newPrin;
		map.set(this.prin.key, newPrin.key);

		var newBox = new Box().addToGroup(newBoxWrapper);
		newBoxWrapper.box = newBox;

		newBoxWrapper.auxs = [];
        var pairopboxs = [];
		for (let node of this.box.nodes) {
			var newNode;
            if (node instanceof PairWrapper) {
                newNode = node.copyPair(map).addToGroup(newBox);
            } else if (node instanceof BoxWrapper) {
				newNode = node.copyBox(map).addToGroup(newBox);
			} else if (node instanceof PairOpBox) {
                newNode = node.copyBox(map).addToGroup(newBox);
            } else {
				newNode = node.copy().addToGroup(newBox);
				map.set(node.key, newNode.key);
			}
		}
		for (let aux of this.auxs) {
			var newAux = aux.copy().addToGroup(newBoxWrapper);
			newBoxWrapper.auxs.push(newAux);
			map.set(aux.key, newAux.key);
		}

		for (let link of this.box.links) {
			var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newBox);
			newLink.reverse = link.reverse;
		}
		for (let link of this.links) {
			var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newBoxWrapper);
			newLink.reverse = link.reverse;
		}

		return newBoxWrapper;
	}

	copy() {
		var map = new Map();
		return this.copyBox(map);
	}

	delete() {
		this.box.delete();
		for (let aux of Array.from(this.auxs)) {
			aux.delete();
		}
		this.prin.delete();
		super.delete();
	}

	deleteAndPreserveLink() {
		this.box.delete();
		for (let aux of Array.from(this.auxs)) {
			this.removeAux(aux); // preserve outLink
		}
		this.prin.deleteAndPreserveInLink(); //preserve inLink
		super.delete();
	}

	draw(level, snapshot, subgraph) {
		var str = "";
		
		for (let node of this.nodes) {
			str += node.draw(level, snapshot, subgraph);
		}
		
		return str;
	}
}

class PairWrapper extends Group {
    constructor() {
        super();
    }
    
    addNode(node, isPair) {
        if(isPair) {
            this.pair = node;
        }
        this.nodes.push(node);
    }
    
    copyPair(map) {
        var newWrapper = new PairWrapper();
        var newPair = new PairBox().addToGroup(newPairWrapper);
        
        var newNode;
        for(let node of this.pair.nodes) {
            if(node instanceof BoxWrapper) {
                newNode = node.copyBox(map).addToGroup(newPair);
            } else {
                newNode = node.copy().addToGroup(newPair);
                map.set(node.key, newNode.key);
            }
        }
        for(let node of this.nodes) {
            if (node instanceof BoxWrapper) {
				newNode = node.copyBox(map).addToGroup(newWrapper);
			} else if (node instanceof PairOpBox) {
                newNode = node.copyBox(map).addToGroup(newWrapper);
            } else if (node instanceof PairWrapper) {
                newNode = node.copyPair(map).addToGroup(newWrapper);
            } else {
				newNode = node.copy().addToGroup(newWrapper);
				map.set(node.key, newNode.key);
			}
        }
        
        for (let link of this.pair.links) {
			var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newPair);
			newLink.reverse = link.reverse;
		}
		for (let link of this.links) {
			var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newWrapper);
			newLink.reverse = link.reverse;
		}
        
        return newWrapper;
    }
}