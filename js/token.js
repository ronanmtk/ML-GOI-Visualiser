class MachineToken {

	constructor() {
		this.reset();
	}

	setLink(link) {
		if (this.link != null)
			this.link.clearFocus();
		this.link = link;
		if (this.link != null) {
			this.link.focus("red");
		}
	}
    
    setNode(node) {
        if (this.node != null)
			this.node.changeFocus(false);
		this.node = node;
		if (this.node != null) {
			this.node.changeFocus(true);
		}
    }

	reset() {
		this.forward = true;
		this.rewrite = false;
		this.transited = false;
		
		this.link = null;
        this.node = null;
		
		this.rewriteFlag = RewriteFlag.EMPTY;
		this.dataStack = [CompData.PROMPT];
		this.boxStack = [];
        this.redrawStack = [RedrawFlag.NONE];
        this.redrawStackIndex = 0;
        
        this.redraw = false;
	}
    
    pushRedrawStack(flag) {
        this.redrawStack.push(flag);
        this.redrawStackIndex++;
    }
    
    popRedrawStack() {
        this.redrawStackIndex--;
        return this.redrawStack.pop();
    }
    
    peekRedrawStack() {
        return this.redrawStack[this.redrawStackIndex];
    }
    
    determineRedraw() {
        this.redraw = (this.peekRedrawStack() == RedrawFlag.NONE);
    }
    
    //only call when bottomFlag < topFlag
    upChangeTransition(topFlag) {
        this.redraw = false;
        if(topFlag > this.peekRedrawStack()) {
            this.pushRedrawStack(topFlag);
            return true;
        }
        return false;
    }
    
    /* Function to move down out of a hidden box (e.g. Cons, Pair)
     * param topFlag the flag of the box we are moving down from, which will only be removed from stack if matched
     * param force whether to force the downwards transition even if it doesn't match the top of the stack
     * param flagToMatch what the top of the flag should be if we are forcing the transition
     */
    downChangeTransition(topFlag, force, flagToMatch) {
        var topOfStack = force ? flagToMatch : topFlag;
        if(topOfStack == this.peekRedrawStack()) {
            this.popRedrawStack();
        }
        this.determineRedraw();
    }
}

var CompData = {
	PROMPT: '*',
	LAMBDA: 'λ',
	R: '@',
}

var RewriteFlag = {
	EMPTY: '□',
	F_LAMBDA: '<λ>',
	F_OP: '<$>',
	F_IF: '<if>',
	F_C: '<C>',
	F_PROMO: '<!>',
	F_RECUR: '<μ>',
}

var BoxData = {
}

