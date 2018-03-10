var sum_list = 'let sum = rec f list -> \n'+
               '  if (isnil list) \n'+
               '  then 0 \n'+
               '  else ( head list + (f (tail list)) ) \n'+  
               'in sum [5;9;12]';

var sum_list_2 = 'let sum = rec f list -> \n'+
                 '  if (isnil list) \n'+
                 '  then 0 \n'+
                 '  else \n'+
                 '    ( \n'+
                 '     let x = (head list) in \n'+
                 '     let xs = (tail list) in \n'+
                 '     ( x + (f xs) ) \n'+
                 '    ) \n'+
                 'in sum [5;9;12]';

var map_example = 'let map = rec mapp f -> fun xs -> \n'+
                  '  if (isnil xs) \n'+
                  '  then [] \n'+
                  '  else ( let h = (head xs) in \n'+
                  '         let t = (tail xs) in \n'+
                  '         ( (f h) :: (mapp f t) ) \n'+
                  '       ) \n'+
                  'in map (fun x -> x + 1) [4;2;9] \n';

var mod = 'let mod = rec f x -> fun n -> \n'+
          '  if (x <= n) \n'+
          '  then x \n'+
          '  else (f (x-n) n) \n'+
          'in mod 12 5';

var append = 'let app = rec ap xs -> fun ys -> \n'+
             '  if (isnil xs) \n'+
             '  then ys \n'+
             '  else (ap (tail xs) ((head xs) :: ys)) \n'+
             'in app [1;2;3] [4;5;6]';

var tris_naive = 'let tri = rec g y -> \n'+
                 '  if (y <= 1) \n'+
                 '  then 1 \n'+
                 '  else (y + (g (y - 1))) \n'+
                 'in \n\n'+ 
                 'let t = rec f x -> fun n -> \n'+ 
                 '  if (x <= n) \n'+
                 '  then ((tri x) :: (f (x+1) n)) \n'+
                 '  else [] \n'+
                 'in \n\n'+
                 'let tris = fun n -> t 1 n \n\n'+
                 'in tris 3';

var tris = 'let t = rec f x -> fun m -> fun n -> \n'+
           '  if (x <= n) \n'+
           '  then (let a = x + m in \n'+
           '        a :: (f (x + 1) a n)) \n'+
           '  else [] \n'+
           'in \n\n'+
           'let tris = fun n -> t 0 1 n \n\n'+ 
           'in tris 3';
    
var run_length_encoding = 'let aux = rec f n -> fun acc -> fun xs -> \n'+
                          '  if (isnil xs) \n'+
                          '  then [] \n'+
                          '  else ( \n'+
                          '         if (isnil tail xs) \n'+
                          '         then ( pair((n+1), (head xs)) :: acc ) \n'+
                          '         else ( \n'+
                          '                let a = head xs in \n'+
                          '                let t = tail xs in \n'+
                          '                let b = head t in \n'+
                          '                  if (a == b) \n'+
                          '                  then (f (n+1) acc t) \n'+
                          '                  else (f n (pair((n+1),a) :: acc) t) \n'+
                          '              ) \n'+
                          '       ) \n'+
                          'in \n\n'+
                          'let rev = rec g xs -> fun ac -> \n'+
                          '  if (isnil xs) \n'+
                          '  then ac \n'+
                          '  else (g (tail xs) ((head xs) :: ac)) \n'+
                          'in \n\n'+
                          'let rle = fun xs -> rev (aux 0 [] xs) [] \n'+
                          'in \n\n'+
                          'rle [4;4;2]';