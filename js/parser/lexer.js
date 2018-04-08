define(function(require) {
    
var Token = require('parser/token');
    
class Lexer {
  constructor(input, output) {
    this._input = input;
    this._output = output;
    output.val("");
    this._index = 0;
    this._lineItem = 1;
    this._line = 1;
    this._token = undefined;
    this._nextToken();
  }

  /**
   * Return the next char of the input or '\0' if we've reached the end
   */
  _nextChar() {
    if (this._index >= this._input.length) {
      return '\0';
    }
    
    return this._input[this._index++];
  }

  /**
   * Set this._token based on the remaining of the input
   *
   * This method is meant to be private, it doesn't return a token, just sets
   * up the state for the helper functions.
   */
  _nextToken() {
    let c;
    do {
      c = this._nextChar();
      if(c == '\n') {
        this._line++;
        this._lineItem = 1;
      }
    } while (/\s/.test(c));

    switch (c) {
      /*case 'λ':
      case '\\':
        this._token = new Token(Token.LAMBDA);
        break;

      case '.':
        this._token = new Token(Token.DOT);
        break;*/

      case ',':
        this._token = new Token(Token.COMMA);
        break;
            
      case ';':
        this._token = new Token(Token.SEMICOLON);
        break;

      case '(':
        this._token = new Token(Token.LPAREN);
        break;

      case ')':
        this._token = new Token(Token.RPAREN);
        break;
            
      case '[':
        this._token = new Token(Token.LSPAREN);
        break;
        
      case ']':
        this._token = new Token(Token.RSPAREN);
        break;

      case '\0':
        this._token = new Token(Token.EOF);
        break;

      case '!':
        this._token = new Token(Token.NOT);
        break;

      case '&':
        if (this._nextChar() == '&')
          this._token = new Token(Token.AND, null, 5);
        else {
          this._index--;
          this.fail();
        }
        break;

      case '|':
        var c2 = this._nextChar();
        if (c2 == '|')
          this._token = new Token(Token.OR, null, 4);
        else {
          this._index--;
          this.fail();
        }
        break;

      case ':':
        if (this._nextChar() == ':')
          this._token = new Token(Token.CONS);
        else {
          this._index--;
          this.fail;
        }
        break;
            
      case '+':
        this._token = new Token(Token.PLUS, null, 12);
        break;

      case '-':
        if(this._nextChar() == '>') {
            this._token = new Token(Token.DOT);
        } else {
            this._index--;
            this._token = new Token(Token.SUB, null, 12);
        }
        break;

      case '*':
        this._token = new Token(Token.MULT, null, 13);
        break;

      case '/':
        this._token = new Token(Token.DIV, null, 13);
        break;

      case '<':
        if (this._nextChar() == '=') {
          this._token = new Token(Token.LTE, null, 10);
        } else {
          this._index--;
          this._token = new Token(Token.LT, null, 10);
        }
        break;
            
      case '>':
        if (this._nextChar() == '=') {
          this._token = new Token(Token.GTE, null, 10);
        } else {
          this._index--;
          this._token = new Token(Token.GT, null, 10);
        }
        break;

      case '=':
        if (this._nextChar() == '=') {
          this._token = new Token(Token.EQ, null, 10);
        } else {
          this._index--;
          this._token = new Token(Token.DEFINE);
        }
        break;

      default:
        // text for string
        if (/[a-z]|'/.test(c)) {
          let str = '';
          do {
            str += c;
            c = this._nextChar();

          } while (/[a-zA-Z0-9]|'|_/.test(c));

          // put back the last char which is not part of the identifier
          this._index--;

          if (str == "let")
            this._token = new Token(Token.LET);
          else if (str == "fun")
            this._token = new Token(Token.LAMBDA);
          else if (str == "in")
            this._token = new Token(Token.IN);
          else if (str == "rec")
            this._token = new Token(Token.REC);
          else if (str == "pair")
            this._token = new Token(Token.PAIR);
          else if (str == "fst")
            this._token = new Token(Token.FST);
          else if (str == "snd")
            this._token = new Token(Token.SND);
          else if (str == "true")
            this._token = new Token(Token.TRUE);
          else if (str == "false")
            this._token = new Token(Token.FALSE);
          else if (str == "if")
            this._token = new Token(Token.IF);
          else if (str == "then")
            this._token = new Token(Token.THEN);
          else if (str == "else")
            this._token = new Token(Token.ELSE);
          else if (str == "lst")
            this._token = new Token(Token.LIST);
          else if (str == "isnil")
            this._token = new Token(Token.ISNIL);
          else if (str == "head")
            this._token = new Token(Token.HEAD);
          else if (str == "tail")
            this._token = new Token(Token.TAIL);
          else
            this._token = new Token(Token.LCID, str);
        } 
        // text for numbers
        else if (/[0-9]/.test(c)) {
          let str = '';
          do {
            str += c;
            c = this._nextChar();
          } while (/[0-9]/.test(c));

          if (c == '.') {
            do {
              str += c;
              c = this._nextChar();
            } while (/[0-9]/.test(c));
          }

          // put back the last char which is not part of the identifier
          this._index--;

          this._token = new Token(Token.INT, parseFloat(str));
        } 
        else {
          this.fail();
        }
    }
  }

  /**
   * Assert that the next token has the given type, return it, and skip to the
   * next token.
   */
  token(type) {
    if (!type) {
      return this._token.value;
    }

    const token = this._token;
    this.match(type);
    return token.value;
  }

  lookahead() {
    return this._token;
  }

  /**
   * Throw an unexpected token error - ideally this would print the source
   * location
   */
  fail() {
    var errMsg = `Unexpected token at line ${this._line}, item ${this._lineItem}`;
    this._output.val(errMsg);
    throw new Error(errMsg);
  }

  /**
   * Returns a boolean indicating whether the next token has the given type.
   */
  next(type) {
    return this._token.type == type;
  }

  /**
   * Assert that the next token has the given type and skip it.
   */
  match(type) {
    if (this.next(type)) {
      this._lineItem++;
      this._nextToken();
      return;
    }
    this._output.val(`Invalid token at line ${this._line}, item ${this._lineItem}: Expected '${type}' found '${this._token.type}'`);
    throw new Error('Parse Error');
  }

  /**
   * Same as `next`, but skips the token if it matches the expected type.
   */
  skip(type) {
    if (this.next(type)) {
      this._lineItem++;
      this._nextToken();
      return true;
    }
    return false;
  }
}
    
return Lexer;
    
});
