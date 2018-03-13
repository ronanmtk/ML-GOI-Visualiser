var graph = null;
var dev = false;

class GoIMachine {
	
	constructor() {
		this.graph = new Graph();
		graph = this.graph; // cheating!
		this.token = new MachineToken();
        this.output = null;
		this.gc = new GC(this.graph);
		this.count = 0;
        this.errMsg = "Invalid input, unable to build graph";
	}

	compile(source, output) {
		const lexer = new Lexer(source + '\0', output);
		const parser = new Parser(lexer);
		const ast = parser.parse();
		// init
		this.graph.clear();
		this.token.reset();
		this.count = 0;
        this.output = output;
		// create graph
		var start = new Start().addToGroup(this.graph.child);
		var term = this.toGraph(ast, this.graph.child, DisplayFlag.NONE, RedrawFlag.NONE);
		new Link(start.key, term.prin.key, "n", "s").addToGroup(this.graph.child);
		this.deleteVarNode(this.graph.child);
	}
    
    fail(msg) {
        var errMsg = msg ? msg : this.errMsg;
        this.output.val(errMsg);
        throw new Error(errMsg);
    }

	// translation
	toGraph(ast, group, displayFlag, redrawFlag) {
		var graph = this.graph;
		if (ast instanceof Identifier) {
			var v = new Var(ast.name, redrawFlag).addToGroup(group)
			return new Term(v, [v]);
		} 

		else if (ast instanceof Abstraction) {
			var param = ast.param;
			var wrapper = BoxWrapper.create(redrawFlag).addToGroup(group);
			var abs = new Abs(redrawFlag).addToGroup(wrapper.box);
            abs.transitionFlag = ast.transitionFlag ? ast.transitionFlag : TransitionFlag.NONE;
			var term = this.toGraph(ast.body, wrapper.box, displayFlag, redrawFlag);
			new Link(wrapper.prin.key, abs.key, "n", "s").addToGroup(wrapper);
            
            if(term) {
                new Link(abs.key, term.prin.key, "e", "s").addToGroup(abs.group);
            } else {
                this.fail();
            }

			var auxs = Array.from(term.auxs);
			var paramUsed = false;
			var auxNode;
			for (let aux of term.auxs) {
				if (aux.name == param) {
					paramUsed = true;
					auxNode = aux;
					break;
				}
			}
			if (paramUsed) {
				auxs.splice(auxs.indexOf(auxNode), 1);
			} else {
				auxNode = new Weak(param, redrawFlag).addToGroup(abs.group);
			}
			new Link(auxNode.key, abs.key, "nw", "w", true).addToGroup(abs.group);

			wrapper.auxs = wrapper.createPaxsOnTopOf(auxs, redrawFlag);

			return new Term(wrapper.prin, wrapper.auxs);
		} 

		else if (ast instanceof Application) {
            var lGroup;
            var lDisplayFlag;
            var lRedrawFlag;
            if (displayFlag == DisplayFlag.PAIRFST || displayFlag == DisplayFlag.APPHEAD) {
                lDisplayFlag = DisplayFlag.NONE;
                if(displayFlag == DisplayFlag.PAIRFST) {
                    lGroup = dev ? new Group(true).addToGroup(group) : new PairBox().addToGroup(group);
                    lRedrawFlag = RedrawFlag.INPAIR;
                } else {
                    lGroup = dev ? new Group(true).addToGroup(group) : new ConsBox().addToGroup(group);
                    lRedrawFlag = RedrawFlag.INLIST;
                }
            }
            else if (displayFlag == DisplayFlag.PAIRSND || displayFlag == DisplayFlag.APPTAIL) {
                lGroup = group;
                lRedrawFlag = redrawFlag;
                lDisplayFlag = displayFlag - 1; //PAIRSND -> PAIRFST && APPTAIL -> APPHEAD
            } 
            else {
                lGroup = group;
                lDisplayFlag = DisplayFlag.NONE;
                lRedrawFlag = redrawFlag;
            }
			var app = new App(redrawFlag).addToGroup(group);
			//lhs
			var left = this.toGraph(ast.lhs, lGroup, lDisplayFlag, lRedrawFlag);
            if(left) {
                var der = new Der(left.prin.name, redrawFlag).addToGroup(group); 
            } else {
                this.fail();
            }
			new Link(der.key, left.prin.key, "n", "s").addToGroup(group);
			// rhs
			var right = this.toGraph(ast.rhs, group, DisplayFlag.NONE, redrawFlag);		
			
			new Link(app.key, der.key, "w", "s").addToGroup(group);
			if(right) {
                new Link(app.key, right.prin.key, "e", "s").addToGroup(group);
            } else {
                this.fail();
            }
			return new Term(app, Term.joinAuxs(left.auxs, right.auxs, group, redrawFlag));
		} 

		else if (ast instanceof Constant) {
			var wrapper = BoxWrapper.create(redrawFlag).addToGroup(group);
			var constant = new Const(ast.value, redrawFlag).addToGroup(wrapper.box);
			new Link(wrapper.prin.key, constant.key, "n", "s").addToGroup(wrapper);
			return new Term(wrapper.prin, wrapper.auxs);
		}

		else if (ast instanceof BinaryOp) {
			var binop = new BinOp(ast.name, redrawFlag).addToGroup(group);

			binop.subType = ast.type;
			var left = this.toGraph(ast.v1, group, displayFlag, redrawFlag);
			var right = this.toGraph(ast.v2, group, displayFlag, redrawFlag);

            if(left && right) {
                new Link(binop.key, left.prin.key, "w", "s").addToGroup(group);
			    new Link(binop.key, right.prin.key, "e", "s").addToGroup(group);
            } else {
                this.fail();
            }

			return new Term(binop, Term.joinAuxs(left.auxs, right.auxs, group, redrawFlag));
		}

		else if (ast instanceof UnaryOp) {
			var unop = new UnOp(ast.name, redrawFlag).addToGroup(group);
			unop.subType = ast.type;
			var box = this.toGraph(ast.v1, group, displayFlag, redrawFlag);

            if(box) {
                new Link(unop.key, box.prin.key, "n", "s").addToGroup(group);   
            } else {
                this.fail();
            }

			return new Term(unop, box.auxs);
		}

		else if (ast instanceof IfThenElse) {
			var ifnode = new If(redrawFlag).addToGroup(group);
			var cond = this.toGraph(ast.cond, group, displayFlag, redrawFlag);
			var t1 = this.toGraph(ast.t1, group, displayFlag, redrawFlag);
			var t2 = this.toGraph(ast.t2, group, displayFlag, redrawFlag);

            if(cond && t1 && t2) {
                new Link(ifnode.key, cond.prin.key, "w", "s").addToGroup(group);
                new Link(ifnode.key, t1.prin.key, "n", "s").addToGroup(group);
                new Link(ifnode.key, t2.prin.key, "e", "s").addToGroup(group);
            } else {
                this.fail();
            }

			return new Term(ifnode, Term.joinAuxs(Term.joinAuxs(t1.auxs, t2.auxs, group, redrawFlag), cond.auxs, group, redrawFlag));
		}
        
        else if (ast instanceof Pair) {
            //church encoding of pair
            var transitionFlag = ast.listEnter ? TransitionFlag.LISTENTER : TransitionFlag.NONE;
            var pairAst = new Application(new Identifier(0,"z"), new Identifier(2,"pair1"));
            pairAst = new Application(pairAst, new Identifier(1,"pair2"));
            pairAst = new Abstraction("z",pairAst,transitionFlag);
            pairAst = new Abstraction("pair2",pairAst);
            pairAst = new Abstraction("pair1",pairAst);
            pairAst = new Application(pairAst,ast.fst);
            pairAst = new Application(pairAst,ast.snd);
            
            var newGroup = (dev || (displayFlag != DisplayFlag.INELIST)) ? group : new EmptyListBox().addToGroup(group);
            var pair = this.toGraph(pairAst, newGroup, DisplayFlag.PAIRSND, redrawFlag);
            return new Term(pair.prin, pair.auxs);
        }
        
        else if (ast instanceof PairOp) {
            var wrapper = dev || displayFlag != DisplayFlag.ISNIL ? group : new ListOpBox("isnil").addToGroup(group);
            var opFlag = displayFlag == DisplayFlag.ISNIL ? RedrawFlag.INLISTISNIL : RedrawFlag.INOP;
            var exitTransitionFlag; 
            var enterTransitionFlag;
            if(displayFlag == DisplayFlag.ISNIL) {
                exitTransitionFlag = TransitionFlag.ISNILEXIT;
                enterTransitionFlag = TransitionFlag.NONE;
            } 
            else if (displayFlag == DisplayFlag.LISTOP) {
                exitTransitionFlag = TransitionFlag.LISTOPEXIT;
                enterTransitionFlag = TransitionFlag.LISTOPENTER;
            }
            else {
                exitTransitionFlag = TransitionFlag.OPEXIT;
                enterTransitionFlag = TransitionFlag.NONE;
            }
            
            var box = dev ? new Group(true).addToGroup(wrapper) : new PairOpBox(ast.isFst ? "fst" : "snd").addToGroup(wrapper);
            
            var der = new Der(null, redrawFlag).addToGroup(group);
            
            var pairOpAst = (ast.isFst ? new Identifier(1,"x") : new Identifier(0,"y"));
            pairOpAst = new Abstraction("y",pairOpAst,exitTransitionFlag);
            pairOpAst = new Abstraction("x",pairOpAst,enterTransitionFlag);
            pairOpAst = new Application(new Identifier(0,"p"),pairOpAst);
            pairOpAst = new Abstraction("p",pairOpAst);
            
            //change made here
            var pairOp = this.toGraph(pairOpAst, box, displayFlag, opFlag);
            new Link(der.key,pairOp.prin.key,"n","s").addToGroup(group);
            
            var pair = this.toGraph(ast.pair,group, DisplayFlag.NONE, redrawFlag);
            
            var app = new App(redrawFlag).addToGroup(group);
            new Link(app.key,der.key,"w","s").addToGroup(group);
            if(pair) {
                new Link(app.key,pair.prin.key,"e","s").addToGroup(group); 
            } else {
                this.fail();
            }
            
            return new Term(app, Term.joinAuxs(pairOp.auxs, pair.auxs, group, redrawFlag));
        }
        
        else if (ast instanceof ListOp) {
            if(ast.name == "isnil") {
                return this.toGraph(new PairOp(true, ast.list), group, DisplayFlag.ISNIL, redrawFlag);
            }
            
            else if (ast.name == "head" || ast.name == "tail") {
                var opGroup = dev ? group : new ListOpBox(ast.name).addToGroup(group);
                
                var der = new Der(null, redrawFlag).addToGroup(group);
                
                var listOpAst = new Identifier(0,"z");
                var listOpAst = new PairOp(false, listOpAst);
                var listOpAst = new PairOp(ast.name == "head", listOpAst);
                var listOpAst = new Abstraction("z", listOpAst);
                
                var listOp = this.toGraph(listOpAst, opGroup, DisplayFlag.LISTOP, RedrawFlag.INLISTOP);
                new Link(der.key,listOp.prin.key,"n","s").addToGroup(group);
                
                var list = this.toGraph(ast.list, group, displayFlag, redrawFlag);
                
                var app = new App(redrawFlag).addToGroup(group);
                new Link(app.key, der.key, "w", "s").addToGroup(group);
                if(list) {
                    new Link(app.key, list.prin.key, "e", "s").addToGroup(group);   
                } else {
                    this.fail();
                }
                
                return new Term(app, Term.joinAuxs(listOp.auxs, list.auxs, group, redrawFlag));
            }
        }
        
        else if (ast instanceof Cons) {
            var consAst = new Pair(new Identifier(1, "listHead"), new Identifier(0, "listTail"));
            consAst = new Pair(new Constant(false), consAst, true);
            consAst = new Abstraction("listTail",consAst);
            consAst = new Abstraction("listHead",consAst);
            consAst = new Application(consAst, ast.head);
            consAst = new Application(consAst, ast.tail);
            
            var cons = this.toGraph(consAst, group, DisplayFlag.APPTAIL, redrawFlag);
            
            return new Term(cons.prin, cons.auxs);
        }
        
        else if (ast instanceof EmptyList) {
            return this.toGraph(new Pair(new Constant(true), new Constant(true), true), group, DisplayFlag.INELIST, RedrawFlag.INLIST);
        }

		else if (ast instanceof Recursion) {
			var p1 = ast.p1
			var p2 = ast.p2;
			// recur term
			var wrapper = BoxWrapper.create(redrawFlag).addToGroup(group);
			wrapper.prin.delete();
			var recur = new Recur(redrawFlag).addToGroup(wrapper);
			wrapper.prin = recur;
			var box = this.toGraph(new Abstraction(p2, ast.body), wrapper.box, displayFlag, redrawFlag);
            wrapper.auxs = wrapper.createPaxsOnTopOf(box.auxs);

            if(box) {
                new Link(recur.key, box.prin.key, "e", "s").addToGroup(wrapper);
            } else {
                this.fail();
            }

			var p1Used = false;
			var auxNode1;
			for (var i=0; i<wrapper.auxs.length; i++) {
				var aux = wrapper.auxs[i];
				if (aux.name == p1) {
					p1Used = true;
                    auxNode1 = this.graph.findNodeByKey(aux.findLinksInto(null)[0].from);
                    aux.delete();
					break;
				}
			}
			if (!p1Used) {
				auxNode1 = new Weak(p1, redrawFlag).addToGroup(wrapper.box);
			}
			new Link(auxNode1.key, recur.key, "nw", "w", true).addToGroup(wrapper);

			return new Term(wrapper.prin, wrapper.auxs);
		}
	}

	deleteVarNode(group) {
		for (let node of Array.from(group.nodes)) {
			if (node instanceof Group)
				this.deleteVarNode(node);
			else if (node instanceof Var) 
				node.deleteAndPreserveOutLink();
		}
	}

	// machine step
	pass(flag, dataStack, boxStack) {	
		if (!finished) {
			/*this.count++;
			if (this.count == 200) {
				this.count = 0;
				this.gc.collect();
			}*/

			var node;
			if (!this.token.transited) {

				if (this.token.link != null) {
					var target = this.token.forward ? this.token.link.to : this.token.link.from;
					node = this.graph.findNodeByKey(target);
				}
				else
					node = this.graph.findNodeByKey("nd1");

                this.token.setNode(node);
				this.token.rewrite = false;
				var nextLink = node.transition(this.token, this.token.link);
				if (nextLink != null) {
					this.token.setLink(nextLink);
					this.printHistory(flag, dataStack, boxStack); 
					this.token.transited = true;
				}
				else {
					this.gc.collect();
					this.token.setLink(null);
                    this.token.redraw = true;
					play = false;
					playing = false;
					finished = true;
				}
			}
			else {
				var target = this.token.forward ? this.token.link.from : this.token.link.to;
				node = this.graph.findNodeByKey(target);
                this.token.setNode(node);
				var nextLink = node.rewrite(this.token, this.token.link);
				if (!this.token.rewrite) {
					this.token.transited = false;
					this.pass(flag, dataStack, boxStack);
				}
				else {
					this.token.setLink(nextLink);
                    target = this.token.forward ? this.token.link.from : this.token.link.to;
				    this.token.setNode(this.graph.findNodeByKey(target));
					this.printHistory(flag, dataStack, boxStack);
				}
			}
		}
        return this.token.redraw;
	}

	printHistory(flag, dataStack, boxStack) {
		flag.val(this.token.rewriteFlag + '\n' + flag.val());
		var dataStr = this.token.dataStack.length == 0 ? '□' : Array.from(this.token.dataStack).reverse().toString() + ',□';
		dataStack.val(dataStr + '\n' + dataStack.val());
		var boxStr = this.token.boxStack.length == 0 ? '□' : Array.from(this.token.boxStack).reverse().toString() + ',□';
		boxStack.val(boxStr + '\n' + boxStack.val());
	}

}

var DisplayFlag = {
    NONE: 0,
	PAIRFST: 1,
    PAIRSND: 2,
    APPHEAD: 11,
    APPTAIL: 12,
    INELIST: 13,
    ISNIL: 21,
    LISTOP: 22
}

var RedrawFlag = {
    NONE: 0,
    INPAIR: 1,
    INOP: 2,
    INLIST: 3,
    INLISTOP: 4,
    INLISTISNIL: 5
}

var TransitionFlag = {
    NONE: 0,
    OPEXIT: 1,
    LISTENTER: 2,
    LISTEXIT: 3,
    ISNILEXIT: 4,
    LISTOPENTER: 5,
    LISTOPEXIT: 6
}

define('goi-machine', ['gc', 'graph', 'node', 'group', 'link', 'term', 'token', 'op'
                    , 'subgraph', 'graph-shot', 'closable-group', 'abstracted-group' 
                    , 'parser/ast', 'parser/token', 'parser/lexer', 'parser/parser'
					, 'nodes/expo', 'nodes/abs', 'nodes/app', 'nodes/binop', 'nodes/const', 'nodes/contract'
					, 'nodes/der', 'nodes/if', 'nodes/pax', 'nodes/promo'
					, 'nodes/recur', 'nodes/start', 'nodes/unop', 'nodes/weak'],
	function() {
		return new GoIMachine();	
	}
);