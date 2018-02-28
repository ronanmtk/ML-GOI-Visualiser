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
        
        this.weakMade = false;
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
    
    downChangeTransition(topFlag) {
        if(topFlag == this.peekRedrawStack()) {
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

