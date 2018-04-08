var sum_list = "let sum = rec f xs -> \n"+
               "  if (isnil xs) \n"+
               "  then 0 \n"+
               "  else ( head xs + (f (tail xs)) ) \n"+  
               "in sum [5;9;12]";

var sum_list_2 = "let sum = rec f xs -> \n"+
                 "  if (isnil xs) \n"+
                 "  then 0 \n"+
                 "  else \n"+
                 "    ( \n"+
                 "     let x = (head xs) in \n"+
                 "     let xs' = (tail xs) in \n"+
                 "     ( x + (f xs') ) \n"+
                 "    ) \n"+
                 "in sum [5;9;12]";

var fun_f = "let f = fun x -> \n"+
            "let dbl = fun y -> y + y in \n"+
            "let sqr = fun z -> z * z in \n"+
            "( (sqr (dbl x)) + (dbl (sqr x)) ) in \n"+
            "f 3";

var mod = "let mod = rec f x -> fun n -> \n"+
          "  if (x < n) \n"+
          "  then x \n"+
          "  else (f (x-n) n) \n"+
          "in mod 12 5";

var append = "let app = rec app' xs -> fun ys -> \n"+
             "  if (isnil xs) \n"+
             "  then ys \n"+
             "  else (head xs :: (app' (tail xs) ys)) \n"+
             "in app [1;2;3] [4;5;6]";

var tris_naive = "let tri = rec f y -> \n"+
                 "  if (y <= 1) \n"+
                 "  then 1 \n"+
                 "  else (y + (f (y - 1))) \n"+
                 "in \n\n"+ 
                 "let t = rec g x -> fun n -> \n"+ 
                 "  if (x <= n) \n"+
                 "  then ((tri x) :: (g (x+1) n)) \n"+
                 "  else [] \n"+
                 "in \n\n"+
                 "let tris = fun n -> t 1 n \n\n"+
                 "in tris 3";

var tris = "let t = rec f x -> fun m -> fun n -> \n"+
           "  if (x <= n) \n"+
           "  then (let a = x + m in \n"+
           "        a :: (f (x + 1) a n)) \n"+
           "  else [] \n"+
           "in \n\n"+
           "let tris = fun n -> t 1 0 n \n\n"+ 
           "in tris 3";
    
var run_length_encoding = "let rle' = rec f n -> fun acc -> fun ys -> \n"+
                          "  if (isnil ys) \n"+
                          "  then [] \n"+
                          "  else ( \n"+
                          "         if (isnil tail ys) \n"+
                          "         then ( pair((n+1), (head ys)) :: acc ) \n"+
                          "         else ( \n"+
                          "                let y = head ys in \n"+
                          "                let ys' = tail ys in \n"+
                          "                let z = head ys' in \n"+
                          "                  if (y == z) \n"+
                          "                  then (f (n+1) acc ys') \n"+
                          "                  else (f 0 (pair((n+1),y) :: acc) ys') \n"+
                          "              ) \n"+
                          "       ) \n"+
                          "in \n\n"+
                          "let rev = rec g xs -> fun acc' -> \n"+
                          "  if (isnil xs) \n"+
                          "  then acc' \n"+
                          "  else (g (tail xs) ((head xs) :: acc')) \n"+
                          "in \n\n"+
                          "let rle = fun xs -> rev (rle' 0 [] xs) [] \n"+
                          "in \n\n"+
                          "rle [4;4;2]";

var map_example = "let map = rec map' f -> fun xs -> \n"+
                  "  if (isnil xs) \n"+
                  "  then [] \n"+
                  "  else ( let x = (head xs) in \n"+
                  "         let xs' = (tail xs) in \n"+
                  "         ( (f x) :: (map' f xs') ) \n"+
                  "        ) \n"+
                  "in map (fun x -> x + 1) [4;2;9] \n";