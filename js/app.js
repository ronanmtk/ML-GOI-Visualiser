var dpi = 96;

Array.prototype.last = function() {
    return this[this.length-1];
}

var play = false;
var playing = false;
const playSpeedBound = 1500;
const maxPlaySpeed = 10;
var playSpeed = 5;
const playSpeedMult = 100;
var finished = false;
var current = -1;
var latest = -1;

var hide = true;

require(["jquery", "renderer", "goi-machine"],
	function ($, renderer, Machine) {
    
        var machine = new Machine();

		function clearGraph(callback) {
			renderer.render('digraph G {\n\t\n}');
			$("#ta-graph").val("");
			pause();
			setTimeout(callback, 100);
		}

		function draw(change, forward) {
            var width = $("#graph").width();
            var height = $("#graph").height();
            // update stage with new dot source
            var result;
            if(!change) {
                result = machine.graph.drawMid(current, hide);
            } else {
                if(forward) {
                    if(current < latest) {
                        current++;
                        result = machine.graph.drawMid(current, hide);
                    } else {
                        if(!finished) {
                            current++;
                            latest++;
                            result = machine.graph.drawNext(width/dpi, height/dpi, hide);
                        }
                    }
                } else {
                    if(current > 0) {
                        current--;
                        result = machine.graph.drawMid(current, hide);
                    }
                }
            }
            if(result) {
                $("#ta-graph").val(result);
                renderer.render(result);
            }
		}

		// register onClick event
		$("#btn-make-graph").click(function(event) {
			clearGraph(function() {
				$("#dataStack").val("");
				$("#flag").val("");
				$("#boxStack").val("");
				var source = $("#ta-program").val();
                var output = $("#ta-console-output");
                output.val("");
				machine.compile(source, output);
                current = -1;
                latest = -1;
                finished = false;
				draw(true, true);
			});
		});

		$("#btn-save").click(function (event) {
		      var img = renderer.stage.getImage(false);
		      img.onload = function () {
		        $("#download").attr("href", img.src);
		        $("#download")[0].click();
		      };
		      event.preventDefault();
		});

		$("#btn-info").click(function (event) {
		      alert("'λ' = \\lambda\n'⊞' = \\sq+\n'⊠' = \\sq*\n'⊡' = \\sq.");
		});

		$('#cb-show-key').change(function() {
	        showKey = this.checked;
	        $("#btn-refresh").click();       
   		 });
    
        $('input:radio[name="graph-display"]').change(function() {
           hide = (this.value == "hide-detail");
           clearGraph(function() {
                pause();
				draw(false);
			});
        });


		$("#btn-play").click(function(event) {
			play = true;
			if (!playing)
				autoPlay();
		});

		function autoPlay() {
			playing = true;
			next();
			if (play)
				setTimeout(autoPlay, playSpeedBound - (playSpeed*playSpeedMult));
			else
				playing = false;
		}

		function pause() {
			play = false;
			playing = false;
		}
    
        function back() {
            draw(true, false);
        }

		function next() {
            if (!finished && (current == latest)) {
                while(!machine.pass($("#flag"), $("#dataStack"), $("#boxStack")));
            }
            draw(true, true);
		}
    
        $("#btn-speed-down").click(function() {
            if(playSpeed > 1) {
                playSpeed--;
                document.getElementById("speed-value").innerHTML = playSpeed;
            }
        });
    
        $("#btn-speed-up").click(function() {
            if(playSpeed < maxPlaySpeed) {
                playSpeed++;
                document.getElementById("speed-value").innerHTML = playSpeed;
            }
        });

		$("#btn-pause").click(function(event) {
			pause();
		});
    
        $("#btn-back").click(function(event) {
			pause();
			back();
		});
    
        $("#btn-refresh").click(function(event) {
			clearGraph(function() {
                pause();
				draw(false);
			});
		});

		$("#btn-next").click(function(event) {
			pause();
			next();
		});

		$("#ta-program").on('input', function() {
		    specialChar(this);
		}).trigger('input');

		var $stacks = $('#flag, #dataStack, #boxStack');
		var sync = function(e){
		    var $other = $stacks.not(this);
		    $other.get(0).scrollTop = this.scrollTop;
		    $other.get(1).scrollTop = this.scrollTop;
		}
		$stacks.on('scroll', sync);

		renderer.init("#graph");
		$("#ta-program").val(sum_list);
  		$("#btn-make-graph").click();
	}
);

function specialChar(textarea) {
	text = textarea.value;
	if (text.includes("\\lambda")) {
		var selection = textarea.selectionStart;
		textarea.value = text.replace("\\lambda", "λ");
		textarea.setSelectionRange(selection-6, selection-6);
	}
}
