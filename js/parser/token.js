define(function(require) {

class Token {
  /**
   * type should be one of the valid token types list below, and value is an
   * optional value that can carry any extra information necessary for a given
   * token type. (e.g. the matched string for an identifier)
   */
  constructor(type, value, pred) {
    this.type = type;
    this.value = value;
    this.pred = pred;
  }
};

Token['EOF'] = 'EOF';
Token['LAMBDA'] = 'fun';
Token['LPAREN'] = '(';
Token['RPAREN'] = ')';
Token['LSPAREN'] = '[';
Token['RSPAREN'] = ']';
Token['LCID'] = '<identifier>';
Token['DOT'] = '->'; 
Token['COMMA'] = ',';
Token['SEMICOLON'] = ';';
  
Token['APP'] = '<application>';

Token['LET'] = 'let';
Token['DEFINE'] = '=';
Token['IN'] = 'in';

Token['REC'] = 'rec';

Token['INT'] = '<int>';
Token['PAIR'] = 'pair';

Token['TRUE'] = 'true';
Token['FALSE'] = 'false';

Token['NOT'] = '!';
Token['FST'] = 'fst';
Token['SND'] = 'snd';
Token['HEAD'] = 'head';
Token['TAIL'] = 'tail';
Token['ISNIL'] = 'isnil';

Token['AND'] = '&&';
Token['OR'] = '||';
Token['PLUS'] = '+';
Token['SUB'] = '-';
Token['MULT'] = '*';
Token['DIV'] = '/';
Token['LTE'] = '<=';
Token['LT'] = '<';
Token['GTE'] = '>=';
Token['GT'] = '>';
Token['EQ'] = '==';
Token['CONS'] = '::';
  
Token['IF'] = 'if';
Token['THEN'] = 'then';
Token['ELSE'] = 'else';
    
return Token;
});