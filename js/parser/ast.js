define('ast/abstraction', function(require) {
class Abstraction {
  /**
   * param here is the name of the variable of the abstraction. Body is the
   * subtree  representing the body of the abstraction.
   */
  constructor(param, body, transitionFlag) {
    this.param = param;
    this.body = body;
    this.transitionFlag = transitionFlag;
  }
}
return Abstraction;
});

define('ast/application', function(require) {
class Application {
  /**
   * (lhs rhs) - left-hand side and right-hand side of an application.
   */
  constructor(lhs, rhs) {
    this.lhs = lhs;
    this.rhs = rhs;
  }
}
return Application;
});

define('ast/identifier', function(require) {
class Identifier {
  /**
   * name is the string matched for this identifier.
   */
  constructor(value, name) {
    this.value = value;
    this.name = name;
  }
}
return Identifier;
});

define('ast/constant', function(require) {
class Constant {
  constructor(value) {
    this.value = value;
  }
}
return Constant;
});

define('ast/operation', function(require) {
class Operation {
  constructor(type, name) {
    this.type = type;
    this.name = name;
  }
}
return Operation;
});

define('ast/unary-op', function(require) {
var Operation = require('ast/operation');
class UnaryOp extends Operation {
  constructor(type, name, v1) {
    super(type, name);
    this.v1 = v1;
  }
}
return UnaryOp;
});

define('ast/binary-op', function(require) {
var UnaryOp = require('ast/unary-op');
class BinaryOp extends UnaryOp {
  constructor(type, name, v1, v2) {
    super(type, name, v1);
    this.v2 = v2;
  }
}
return BinaryOp;
});

define('ast/if-then-else', function(require) {
class IfThenElse {
  constructor(cond, t1, t2) {
    this.cond = cond;
    this.t1 = t1;
    this.t2 = t2;
  }
}
return IfThenElse;
});

define('ast/pair', function(require) {
class Pair {
  constructor(fst, snd, listEnter) {
    this.fst = fst;
    this.snd = snd;
    this.listEnter = listEnter;
  }
}
return Pair;
});

define('ast/pair-op', function(require) {
class PairOp {
  constructor(isFst, pair) {
    this.isFst = isFst;
    this.pair = pair;
  }
}
return PairOp;
});

define('ast/recursion', function(require) {
class Recursion {
  constructor(p1, p2, body) {
    this.p1 = p1;
    this.p2 = p2;
    this.body = body;
  }
}
return Recursion;
});

define('ast/list', function(require) {
class List {
  constructor(vals) {
    this.vals = vals;
  }
}
return List;
});

define('ast/empty-list', function(require) {
class EmptyList {
  constructor() {}
}
return EmptyList;
});

define('ast/cons', function(require) {
class Cons {
  constructor(head, tail) {
    this.head = head;
    this.tail = tail;
  }
}
return Cons;
});

define('ast/list-op', function(require) {
class ListOp {
  constructor(name, list) {
    this.name = name;
    this.list = list;
  }
}
return ListOp;
});