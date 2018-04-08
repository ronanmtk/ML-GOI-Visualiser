define(function(require) {
    
var Node = require('node');
var CompData = require('token').CompData();
var RewriteFlag = require('token').RewriteFlag();
var TransitionFlag = require('token').TransitionFlag();
var RedrawFlag = require('token').RedrawFlag();
var App = require('nodes/app');
var Expo = require('nodes/expo');
var Promo = require('nodes/promo');
var Const = require('nodes/const');

class Abs extends Node {

	constructor(redrawFlag) {
		super(redrawFlag, "ellipse", "fun");
	}
	
	transition(token, link) {
		if (link.to == this.key && link.toPort == "s") {
            var otherEnd = this.graph.findNodeByKey(link.from);
            if(otherEnd.redrawFlag < this.redrawFlag && otherEnd instanceof App) {
                token.upChangeTransition(this.redrawFlag);
            } else {
                token.determineRedraw();
            }
			var data = token.dataStack.last();
			if (data == CompData.PROMPT) {
				token.dataStack.pop();
				token.dataStack.push(CompData.LAMBDA);
				token.forward = false;
				return link;
			}
			else if (data == CompData.R) {
				token.dataStack.pop();
				token.rewriteFlag = RewriteFlag.F_LAMBDA;
				return this.findLinksOutOf(null)[0];
			}
		}
	}

	rewrite(token, nextLink) {
		if (token.rewriteFlag == RewriteFlag.F_LAMBDA && nextLink.from == this.key) {
			token.rewriteFlag = RewriteFlag.EMPTY;
            token.redraw = false;
			var app = this.graph.findNodeByKey(this.findLinksInto("s")[0].from);
            var openDisplayGroup = false;
			if (app instanceof App) {
                if (this.redrawFlag == token.peekRedrawStack()) {
                    if((this.transitionFlag == TransitionFlag.OPEXIT && this.redrawFlag == RedrawFlag.INOP)
                       || (this.transitionFlag == TransitionFlag.ISNILEXIT && this.redrawFlag == RedrawFlag.INLISTISNIL)) {
                        openDisplayGroup = (this.transitionFlag == TransitionFlag.ISNILEXIT);
                        token.downChangeTransition(this.redrawFlag);
                        token.determineRedraw();   
                    }
                } else {
                    if (this.transitionFlag == TransitionFlag.LISTOPEXIT && token.peekRedrawStack() == RedrawFlag.INLISTOP) {
                        token.downChangeTransition(this.redrawFlag, true, RedrawFlag.INLISTOP);
                        token.determineRedraw();
                    }
                }
				// M rule
				var appLink = app.findLinksInto(null)[0];
				var appOtherLink = app.findLinksOutOf("e")[0];
				var otherNextLink = this.findLinksInto("w")[0];

				nextLink.changeFrom(appLink.from, appLink.fromPort);
				nextLink.changeToGroup(appLink.group);
				
				otherNextLink.changeTo(appOtherLink.to, appOtherLink.toPort);
				otherNextLink.reverse = false;

				var otherNode = this.graph.findNodeByKey(otherNextLink.from);
				if (otherNode instanceof Expo) 
					otherNextLink.fromPort = "n";
				otherNextLink.changeToGroup(appOtherLink.group);
                
                if(openDisplayGroup) {
                    var promo = this.graph.findNodeByKey(nextLink.to);
                    if(promo instanceof Promo) {
                        var constant = this.graph.findNodeByKey(promo.findLinksOutOf()[0].to);
                    }
                    if(constant instanceof Const) {
                        constant.forceDraw = true;
                    }
                }
				
				this.delete();
				app.delete();
                
                
			}

			token.rewrite = true;
			return nextLink;
		}
		
		else if (token.rewriteFlag == RewriteFlag.EMPTY) {
			token.rewrite = false;
            token.redraw = false;
			return nextLink;
		}
	}

	copy() {
		var newAbs = new Abs(this.redrawFlag);
        newAbs.transitionFlag = this.transitionFlag;
        return newAbs;
	}
    
    isAbs() {
        return true;
    }
}
    
return Abs;
    
});