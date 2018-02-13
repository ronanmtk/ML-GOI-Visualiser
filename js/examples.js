var fact_prog = 
  'let fact = rec(f,x).\n'
+ '  if (x <= 1)\n'
+ '  then 1\n'
+ '  else (x * (f (x - 1)))\n'
+ 'in\n'
+ '\n'
+ 'fact 4';

var basic_prog = 'let f = (λx. x + x) in f 5';

var church_pair_prog = '(λp. p (λx. λy. x)) ((λx. λy. λz. z x y) 3 4)';