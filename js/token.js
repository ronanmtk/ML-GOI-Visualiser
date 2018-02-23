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
        this.redrawFlag = RedrawFlag.NONE;
        
        this.weakMade = false;
        this.redraw = false;
        this.lastRedrawCounter = 0;
	}
    
    determineRedraw(newFlag) {
        if(newFlag == RedrawFlag.INOP) {
            if(this.redrawFlag != RedrawFlag.INOP) {
                //gone into a pair operation
                this.redrawFlag = RedrawFlag.INOP;
                this.lastRedrawCounter++;
                this.redraw = true;
                return;
            }
        }
        
        if(this.redrawFlag == RedrawFlag.INOP) {
            if(++this.lastRedrawCounter == 9) {
                this.redrawFlag = RedrawFlag.NONE;
                this.lastRedrawCounter = 0;
                this.redraw = true;
                return;
            }
            this.redraw = false;
            return;
        }
        
        this.redrawFlag = newFlag;
        this.redraw = true;
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

