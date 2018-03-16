//Can we input all new language features and have them recognized correctly
QUnit.test( "Pair parsed correctly", function ( assert ) {
    //As above, use constants as terms built independently
    var lexer = new Lexer("pair(2,3)", $("mockoutput"));
    var parser = new Parser(lexer);
    var ast = parser.parse();
    
    assert.ok(ast instanceof Pair, "Pair built correctly");
    assert.equal(ast.fst.value, 2, "First element of pair built correctly");
    assert.equal(ast.snd.value, 3, "Second element of pair built correctly");
});

QUnit.test( "Pair operations parsed correctly", function ( assert ) {
    var lexer = new Lexer("fst snd pair(5,pair(3,4))", $("mockoutupt"));
    var parser = new Parser(lexer);
    var ast = parser.parse();
    
    assert.ok(ast instanceof PairOp, "root built as PairOp");
    assert.ok(ast.isFst, "fst recognized");
    ast = ast.pair;
    assert.ok(ast instanceof PairOp, "2nd level built as PairOp");
    assert.ok(!ast.isFst, "snd recognized");
    ast = ast.pair;
    assert.ok(ast instanceof Pair, "argument built as Pair");
    assert.ok(ast.snd instanceof Pair, "Pair nesting built correctly");
});

QUnit.test( "List parsed correctly", function ( assert ) {
    var lexer = new Lexer("[]",$("mockoutput"));
    var parser = new Parser(lexer);
    var ast = parser.parse();
    assert.ok(ast instanceof EmptyList, "EmptyList recognized");
    
    //here we can just use simple constants as the elements are 
    //built independently with a call to atom in parser
    lexer = new Lexer("[2;3;4]",$("mockoutput"));
    parser = new Parser(lexer);
    ast = parser.parse();
    assert.ok(ast instanceof Cons, "1st Cons built correctly");
    assert.equal(ast.head.value, 2, "First element built correctly");
    ast = ast.tail;
    assert.ok(ast instanceof Cons, "2nd Cons built correctly");
    assert.equal(ast.head.value, 3, "Second element built correctly");
    ast = ast.tail;
    assert.ok(ast instanceof Cons, "3rd Cons built correctly");
    assert.equal(ast.head.value, 4, "Third element built correctly");
    assert.ok(ast.tail instanceof EmptyList, "List built fully with EmptyList at end");
});

QUnit.test( "List operations parsed correctly", function ( assert ) {
    var lexer = new Lexer("isnil head tail [[];[1;2;3]]", $("mockoutput"));
    var parser = new Parser(lexer);
    var ast = parser.parse();
    
    assert.ok(ast instanceof ListOp, "root built as ListOp");
    assert.equal(ast.name, "isnil", "isnil recognized");
    ast = ast.list;
    assert.ok(ast instanceof ListOp, "2nd level built as ListOp");
    assert.equal(ast.name, "head", "head recognized");
    ast = ast.list;
    assert.ok(ast instanceof ListOp, "3rd level built as ListOp");
    assert.equal(ast.name, "tail", "tail recognized");
    ast = ast.list;
    assert.ok(ast instanceof Cons, "argument built as List");
    assert.ok(ast.head instanceof EmptyList, "List nesting built correctly (Empty)");
    assert.ok(ast.tail.head instanceof Cons, "List nesting built correctly (Cons)");
});

//Do we transform and build the internal graph correctly
//Example chosen as it has almost everything: recursion, abstraction, application, unaryop, binaryop,
//                                     define, cons, empty list, pair, pairop
//                      -> most important there is ClosableGroup and AbstractedGroup
var prog = "let t = rec f x -> fun m -> fun n -> \n"+
           "  if !(x > n) \n"+
           "  then (let a = x + m in \n"+
           "        a :: (f (x + 1) a n)) \n"+
           "  else [] \n"+
           "in \n\n"+
           "let tris = fun n -> t 1 0 n \n\n"+ 
           "in tris (fst pair(3,2))";

var machine = new GoIMachine();
machine.compile(prog,$("#mockoutput"));
var dg = machine.graph.createDisplayGraph();
machine.graph.drawNext(1,1,true); //to create a subgraph display tree and add it to graph-stack
var displayTree = machine.graph.graphStack[0];

QUnit.test( "Display only wanted nodes" , function( assert ) {
    var noOfNodes = 0;
    var allNodes = dg.allNodes.keys();
    var unwanted = [];
    for(let key of allNodes) {
        noOfNodes++;
        var node = dg.allNodes.get(key);
        if(node instanceof Promo 
           || (node instanceof Der && node.text == "D")) {
            unwanted.push(key);
        }
    }
    assert.notEqual(noOfNodes, 0, "Assert that allNodes gets populated in display graph");
    assert.equal(unwanted.length, 0, "Assert that the number of Promo/unnamed Der nodes in transformed graph is 0");
});

QUnit.test( "Every actual graph node is in 'displayNodes' Map", function( assert ) {
    var allNodes = dg.allNodes.keys();
    var displayNodesMap = displayTree.displayNodes;
    for(let key of allNodes) {
        var node = dg.allNodes.get(key)
        if(!(node instanceof Group) && node.linkedToStart()) {
            assert.notEqual(displayNodesMap.get(key), undefined, ("hide=true: Assert result defined for "+key));
            assert.notEqual(displayNodesMap.get(key), null, ("hide=true: Assert result not null for "+key));
        }
    }
    
    displayTree.display(false);
    displayNodesMap = displayTree.displayNodes;
    for(let key of allNodes) {
        var node = dg.allNodes.get(key)
        if(!(node instanceof Group) && node.linkedToStart()) {
            assert.notEqual(displayNodesMap.get(key), undefined, ("hide=false: Assert result defined for "+key));
            assert.notEqual(displayNodesMap.get(key), null, ("hide=false: Assert result not null for "+key));
        }
    }
});

QUnit.test( "Links only displayed if nodes at both end displayed", function( assert ) {
    var gs = new GraphShot(machine.graph);
    var dn = new Map();
    dn.set("nd1","nd1"); //external
    dn.set("nd2","nd2"); //group
    dn.set("nd3","nd2"); //node within group
    dn.set("nd4","nd2"); //group within group
    dn.set("nd5","nd4"); //node within group within group
    gs.displayNodes = dn;
    
    assert.equal(gs.getDisplayedGroup("nd1"),"nd1","getDisplayedGroup() - External node returns self");
    assert.equal(gs.getDisplayedGroup("nd2"),"nd2","getDisplayedGroup() - Top level group returns self");
    assert.equal(gs.getDisplayedGroup("nd3"),"nd2","getDisplayedGroup() - Hidden node returns containing group");
    assert.equal(gs.getDisplayedGroup("nd5"),"nd2","getDisplayedGroup() - Nested node returns top level containing group");
    
    gs.displayLinks = [];
    assert.equal(gs.displayLinks.length, 0, "displayLinks initially empty");
    
    gs.addDisplayLink(new Link("nd1","nd5"));
    assert.equal(gs.displayLinks.length, 1, "displayLink added if both ends exist");
    assert.equal(gs.displayLinks[0].from, "nd1", "displayLink doesn't change from node if displayed");
    assert.equal(gs.displayLinks[0].to, "nd2", "displayLink changes to node to containing group");
    
    gs.addDisplayLink(new Link("nd1","nd1"));
    assert.equal(gs.displayLinks.length, 2, "displayLink added for node link onto self");
    assert.equal(gs.displayLinks[1].from, "nd1", "displayLink doesn't change from node if displayed");
    assert.equal(gs.displayLinks[1].to, "nd1", "displayLink doesn't change from node if displayed");
    
    gs.addDisplayLink(new Link("nd3","nd3"));
    assert.equal(gs.displayLinks.length, 2, "displayLink not added for group onto self");
    
    gs.addDisplayLink(new Link("nd5","nd3"));
    assert.equal(gs.displayLinks.length, 2, "displayLink not added for group onto self even when nodes different");
});
//Integration test for verifying containing group will always be added, and thus all links will have an existent node

//Verifying that all nodes redraw and transition how we want can be done by hand
//But making sure the token operations are correct can be done automatically
//determineRedraw() is trivial
QUnit.test( "The token state must only update at the correct times", function ( assert ) {
    var goimachine = new GoIMachine();
    var token = goimachine.token;
    
    assert.equal(token.redrawStack.length, 1, "Redraw stack initialised with single value");
    assert.equal(token.redrawStackIndex, 0, "Redraw stack index points at correct place");
    assert.equal(token.redrawStack[0], RedrawFlag.NONE, "Starting value in redraw stack is 'NONE'");
    assert.equal(token.peekRedrawStack(), RedrawFlag.NONE, "Peek function returns value at top of stack");
    
    token.upChangeTransition(RedrawFlag.INOP);
    assert.equal(token.redrawStack.length, 2, "Up transition to higher flag updates stack");
    assert.equal(token.peekRedrawStack(), RedrawFlag.INOP, "Peek function returns new value at top of stack");
    
    token.upChangeTransition(RedrawFlag.INPAIR);
    assert.equal(token.redrawStack.length, 2, "Up change transition to lower flag doesn't update stack");
    assert.equal(token.peekRedrawStack(), RedrawFlag.INOP, "Peek function returns same, non-updated value");
    
    //Theoretically not possible, but doesn't change how the stack should work
    token.upChangeTransition(RedrawFlag.INLISTISNIL)
    assert.equal(token.redrawStack.length, 3, "Up change transition from !NONE to higher updates stack");
    assert.equal(token.peekRedrawStack(), RedrawFlag.INLISTISNIL, "Peek function returns new updated value");
    
    //test pop and push without contraints
    token.popRedrawStack();
    assert.equal(token.redrawStack.length, 2, "Pop removes a value from the stack");
    assert.equal(token.peekRedrawStack(), RedrawFlag.INOP, "Previous value at top of stack still there");
    
    token.pushRedrawStack(RedrawFlag.INLISTISNIL);
    assert.equal(token.redrawStack.length, 3, "Push places value at top of stack");
    assert.equal(token.peekRedrawStack(), RedrawFlag.INLISTISNIL, "New value pushed to top");
    
    token.downChangeTransition(RedrawFlag.INLISTISNIL);
    assert.equal(token.redrawStack.length, 2, "Down change transition removes top value when flag is matched");
    assert.equal(token.peekRedrawStack(), RedrawFlag.INOP, "Previous top value now top");
    
    token.downChangeTransition(RedrawFlag.INLISTISNIL, true, RedrawFlag.INLIST);
    assert.equal(token.redrawStack.length, 2, "Down change transition does nothing if alternative forced flag doesn't match");
    assert.equal(token.peekRedrawStack(), RedrawFlag.INOP, "Top of stack doesn't change");
    
    token.downChangeTransition(RedrawFlag.INLISTISNIL, false, RedrawFlag.INOP);
    assert.equal(token.redrawStack.length, 2, "Down change transition does nothing if alternative forced flag matches but we do not want to force");
    assert.equal(token.peekRedrawStack(), RedrawFlag.INOP, "Top of stack doesn't change again");
    
    token.downChangeTransition(RedrawFlag.INLISTOP, true, RedrawFlag.INOP);
    assert.equal(token.redrawStack.length, 1, "Down change transition removes top value when forcing and alternative forced flag matches");
    assert.equal(token.peekRedrawStack(), RedrawFlag.NONE, "Top of stack removed");
});
