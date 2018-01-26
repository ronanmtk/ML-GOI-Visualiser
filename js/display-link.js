class DisplayLink {
    constructor(link, open, newNode, out) {
        this.oldFrom = link.from;
        this.oldTo = link.to;
        this.fromPort = link.fromPort;
        this.toPort = link.toPort;
        this.reverse = link.reverse;
        this.open = open;
        this.newNode = newNode;
        this.out = out;
        this.matched = false;
    }
    
    match() {
        this.matched = true;
    }
    
    createNewOpenLink() {
        return new DisplayLink(new Link(this.oldFrom, this.oldTo, this.fromPort, this.toPort, this.reverse, true), true);
    }
    
    draw(level) {
        var str = level;
        if(this.matched) {
            if(this.open) {
                if(!this.reverse) {
                    str += this.oldFrom + '->' + this.oldTo + '[';
                } else {
                    str += this.oldTo + '->' + this.oldFrom + '[dir=back';
                }
            } else {
                if(!this.reverse) {
                    if(this.out) {
                        str += this.newNode + '->' + this.oldTo + '[';   
                    } else {
                        str += this.oldFrom + '->' + this.newNode + '[';
                    }
                } else {
                    if(this.out) {
                        str += this.oldTo + '->' + this.newNode + '[dir=back';
                    } else {
                        str += this.newNode + '->' + this.oldFrom + '[dir=back';
                    }
                }
            }
            if(!this.reverse) {
                if (this.fromPort != null)
                    str += 'tailport=' + this.fromPort;
                if (this.toPort != null)
                    str += ',headport=' + this.toPort;
            } else {
                if (this.fromPort != null)
                    str += ',headport=' + this.fromPort;
                if (this.toPort != null)
                    str += ',tailport=' + this.toPort;
            }
            str += '];';
            return str;
        } else {
            return "";
        }
    }
}