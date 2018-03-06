var fact_prog = 
  'let fact = rec f x -> \n'
+ '  if (x <= 1)\n'
+ '  then 1\n'
+ '  else (x * (f (x - 1)))\n'
+ 'in\n'
+ '\n'
+ 'fact 4';

var basic_prog = 'let f = fun x -> x + x in f 5';

var church_pair_prog = '(fun p -> (fun x -> fun y -> x)) ((fun x -> fun y -> fun z -> z x y) 3 4)';

var pair_eg_prog = 'fst snd pair( pair(2,3) , pair(4,5) )';

var fancy_pair_prog = 'fst pair ( ((fun x -> x + x)5) , pair( ((fun x -> x)3) , ((fun x -> fun y -> x * y) 9 2) ) )';

var fv_pair_prog = 'let f = fun l -> \n'+
                   '(if (fst l) \n'+
                   'then (snd l) \n'+
                   'else 0) \n'+
                   'in f pair(true, 7)';

var church_list_prog = '(fun z -> fst snd z) \n'+
                       '((fun h -> fun t -> pair( false, pair(h, t) )) \n'+
                       '5 ((fun h -> fun t -> pair( false, pair(h, t) )) 12 pair(true,true)) )';

var sum_list_prog = 'let sum = rec f list -> \n'+
                      '  if (isnil list) \n'+
                      '  then 0 \n'+
                      '  else \n'+
                      '    ( \n'+
                      '     let x = (head list) in \n'+
                      '     let xs = (tail list) in \n'+
                      '     ( x + (f xs) ) \n'+
                      '    ) \n'+
                      'in sum [5;12]';

var map_example_prog = 'let map = rec mapp f -> fun xs -> \n'+
                       '  if (isnil xs) \n'+
                       '  then [] \n'+
                       '  else ( let h = (head xs) in \n'+
                       '         let t = (tail xs) in \n'+
                       '         ( (f h) :: (mapp f t) ) \n'+
                       '       ) \n'+
                       'in map (fun x -> x + 1) [4;2;9] \n';