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
        
        this.weakMade = false;
        this.redraw = false;
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

