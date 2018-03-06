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

var pair_eg_prog = 'fst (snd pair( pair(2,3) , pair(4,5) ) )';

var fancy_pair_prog = 'fst pair ( ((λx.x+x)5) , pair( ((λx.x)3) , ((λx. λy. x * y) 9 2) ) )';

var fv_pair_prog = 'let f = λl. \n'+
                   '(if (fst l) \n'+
                   'then (snd l) \n'+
                   'else 0) \n'+
                   'in f pair(true, 7)';

var church_list_prog = '(λz. fst (snd z)) \n'+
                       '((λh. λt. pair( false, pair(h, t) )) \n'+
                       '5 ((λh. λt. pair( false, pair(h, t) )) 12 pair(true,true)) )';

var sum_list_prog = 'let sum = rec(f,list). \n'+
                    'if (fst list) \n'+
                    'then 0 \n'+
                    'else (((λz. fst (snd z)) list) + (f ((λz. snd (snd z)) list))) \n'+
                    'in \n'+
                    'sum \n'+
                    '((λh. λt. pair( false, pair(h, t) )) \n'+
                    '5 ((λh. λt. pair( false, pair(h, t) )) 12 pair(true,true)) )'; 

var sum_list_2_prog = 'let sum = rec(f,list). \n'+
                      '  if (isnil list) \n'+
                      '  then 0 \n'+
                      '  else \n'+
                      '    ( \n'+
                      '     let x = (head list) in \n'+
                      '     let xs = (tail list) in \n'+
                      '     ( x + (f xs) ) \n'+
                      '    ) \n'+
                      'in sum [5;12]';