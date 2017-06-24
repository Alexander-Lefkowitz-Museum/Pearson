"use strict";

var mobileConsole = {
	supportTouch:!!(document.ontouchstart === null),
	errorInstance:[],
	styles:
		"#mobileConsoleTools {"
		+"	color:black!important;"
		+"	z-index:9003;"
		+"	position:fixed!important;"
		+"	font-size:0!important;"
		+"	font-weight:bold;"
		+"	border-width: 1px;"
		+"	font-family:monospace;"
		+"	width:100%;"
		+"	margin:0 !important;"
		+"	padding:0;"
		+"	bottom:0;"
		+"	left:0;"
		+"	right:0;}"
		+"#mobileConsole {"
		+"	overflow-x:hidden;"
		+"	overflow-y:scroll;"
		+"	height:250px;"
		+"	border:0 none;"
		+"	border-top:#aaa outset 1px;"
		+"	background-color:white;"
		+"	background: -webkit-gradient(linear, left bottom, right top, color-stop(30%,rgba(255,255,255,1.0)), color-stop(51%,rgba(255,255,255,0.8)), color-stop(100%,rgba(255,255,255,0.6)));"
		+"	color:#000 !important;"
		+"	font-size:11px;"
		+"	width:100%;"
		+"	font-weight:bold;"
		+"	font-family:monospace;"
		+"	margin:0 !important;"
		+"	padding:0 0 0 4px;}"
		+"#mobileConsoleTools #inTools {"
		+"	border-top: 1px solid #aaa;"
		+"	font-size:14px !important;"
		+"	padding:2px;"
		+"	background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxIDEiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPgo8bGluZWFyR3JhZGllbnQgaWQ9ImczNDQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRkZGRkYiIG9mZnNldD0iMCIvPjxzdG9wIHN0b3AtY29sb3I9IiNDNEM0QzQiIG9mZnNldD0iMSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJ1cmwoI2czNDQpIiAvPgo8L3N2Zz4=)}",


	setStyles:function (styles) {
		if (typeof styles === "string" && styles.length) {
			var ssheet = document.createElement('style');
				ssheet.setAttribute("type", "text/css");
				ssheet.id = "mcStyles";
				
			document.getElementsByTagName('head')[0].appendChild(ssheet);
			if (ssheet.styleSheet) { // IE
				ssheet.styleSheet.cssText = styles;
			} else { // the world
				ssheet.appendChild(document.createTextNode(styles));
			}
		}
	},
	init: function () {

		var self = this,
			mcElm = document.createElement("div"),
			mcToolsElm = document.createElement("div"),
			highlighted = 0,
			normalizedClick = this.supportTouch?"touchstart":"click",
			mobileConsoleElm,
			_setConsole;

		self.setStyles(self.styles);

		window.nativeConsole = window.console.log;
		
		mcElm.id = "mobileConsole";
		mcElm.innerHTML = "<br>Mobile Console<br>";
		mcToolsElm.id = "mobileConsoleTools";
		mcToolsElm.setAttribute("style","");
		mcToolsElm.appendChild(mcElm);
		mcToolsElm.innerHTML += 
			"<div id='mcResize' style='position:absolute;width:100%;top:0px;left:0px;padding:0;margin:0;background-color:black;height:15px;cursor: row-resize'></div>"+
			"<div id='inTools'>"+
			"<input id='mcEvalInput' type='text' style='width:270px;color:black !important;' autocorrect='off' autocapitalize='off'/>"+
			"<input id='mcEval' type='button' style='color:black !important;' value='Eval' />"+
			"<input id='mcTop' type='button' style='color:black !important;' value='Scroll to top' />"+
			"<input id='mcBottom' type='button' style='color:black !important;' value='Scroll to Bottom' />"+
			"<input id='mcHighlight' type='button' style='color:black !important' value='Highlight Elements' />"+
			"<input id='mcClear' type='button' style='color:black !important;' value='Clear console' />"+
			"<input id='mcClose' type='button' style='color:black !important' value='X' /></div>";

		_setConsole = function () {
			window.console = {
			log:function () {
				var argumentsI,argsI=[],args = [],i;
				for (i = 0; i < arguments.length; i++) {
					argumentsI = arguments[i];
					if (typeof argumentsI !== "undefined") {
						if (typeof argumentsI.innerHTML === "string") {
							argsI = argumentsI.outerHTML.replace(argumentsI.innerHTML,"");
							argsI = argsI.replace(">","&gt;").replace("<","&lt;");
						} else if (typeof argumentsI.length === "number" && typeof argumentsI === "object") {
							argsI = "arr["+argumentsI.join(",")+"]";
						} else if (typeof argumentsI === "object") {
							argsI = "obj{";
							for (var o in argumentsI) {
								argsI += "\n"+o+":";
								argsI += argumentsI[o].toString();
							}
							argsI += "}";
						} else {
							argsI = argumentsI;
						}
						args[i] = argsI;
					}
				}
				mobileConsoleElm.innerHTML += (args.join("")+"<br>");
				mobileConsoleElm.scrollTop = mobileConsoleElm.scrollHeight;
			},
			input:function(input,out) {window.console.log("<span style='border-bottom: solid #aaa 1px;color:blue;display:block'>&gt;&gt;&gt; "+ input +"</span>",out)},
			warn: function(){window.console.log("A warning occured.")},
			error: function(e){window.console.log("<span style='background-color:#F44;border-bottom: solid #aaa 1px;display:block'>&gt;&gt;&gt; "+e.url+"\nLINE "+e.line+": "+e.msg+"</span>")}
			}
		}
		document.body.innerHTML += mcToolsElm.outerHTML
								+ "<div id='mcSpacer' style='width:100%;display:block;visibility:hidden;'"
		mobileConsoleElm = document.getElementById("mobileConsole");
		
		_setConsole();


		$(document).ready(function () {
			self.$mostelms = $("body *:not(#mobileConsoleTools *)");

		});


		$(document).on(normalizedClick, "#mcTop", function () {
				mobileConsoleElm.scrollTop = 0;
			})
			.on(normalizedClick, "#mcClose", function () {
				document.getElementById("mobileConsoleTools").innerHTML="";
			})
			.on(normalizedClick, "#mcClear", function () {
				mobileConsoleElm.innerHTML = "";
			})
			.on(normalizedClick, "#mcBottom", function () {
				mobileConsoleElm.scrollTop = mobileConsoleElm.scrollHeight;
			})
			.on("mousedown touchstart","#mcResize",
				function(){
					self.resizable = true
			})
		 	.on("mouseup touchend","#mcResize",
				function(){
					self.resizable = false;
			})
			.on(normalizedClick,"#mcEval", function () {
				self.evalAndReturn();
			})
			.on("keypress","#mcEvalInput", function(key){
				if (key.which == 13){
					self.evalAndReturn();
				}
			})
			.on(normalizedClick,"#mcHighlight", function () {
					if (!highlighted) {
						highlighted = 1;
						self.$mostelms.css("outline","hsla(0,100%,50%,0.25) solid 4px");
					} else {
						highlighted = 0;
						self.$mostelms.css("outline","");
					}
			});
			if (this.supportTouch) {
				document.body.addEventListener("touchmove",
					function(e){
						self.Ypos = e.touches[0].clientY;
						if (self.resizable) {
							e.preventDefault();
							$("#mobileConsole").height(window.innerHeight - self.Ypos-$("#inTools").height());
						}
				},true);
			} else {
				document.body.addEventListener("mousemove",
					function(e){
						self.Ypos = e.clientY;
						if (self.resizable) {
							$("#mobileConsole").height(window.innerHeight - self.Ypos-$("#inTools").height());
						}
				},false);
			}

		$("#mobileConsoleTools").on(normalizedClick,
			function () {
				$(this).focus();
		});


	},
	evalAndReturn:function () {
		try{window.console.log(
			window.eval(document.getElementById("mcEvalInput").value));
		}catch(e){
			console.error(e)
		}
		//document.getElementById("mcEvalInput").value = "";
	},
	tools: {
		computedStyle:function (query, styleKey) {
			var elm, padMarComplete = false;
			if (typeof query === "string" && query.length>2) {
				elm = document.querySelector(query);
			} else {
				return "";
			}
			if (typeof elm === "object") {
				if (document.defaultView && document.defaultView.getComputedStyle) { //W3C
					var elmStyles = document.defaultView.getComputedStyle(elm, '');
					if (styleKey === "padding") {
						if (!elmStyles.getPropertyValue("padding").length) {
							padMarComplete = elmStyles.getPropertyValue("padding-top") + " " + elmStyles.getPropertyValue("padding-right") + " "
										   + elmStyles.getPropertyValue("padding-bottom") + " " + elmStyles.getPropertyValue("padding-left");
						}
					}
					return padMarComplete || elmStyles.getPropertyValue(styleKey);
				} else if (document.uniqueID && elm.currentStyle) { //IE
					return elm.currentStyle[this.dashToCamelCase(styleKey)];
				}
			}
			return elm;
		},
		isProperlySupported: function (props) {
			var elm = document.documentElement;
			//document.documentElement is actually <html> but purely read only and contains a blank string value for all supported styles
			if (typeof props == "string" && !!props.length) { //check if it's a single property and isn't a black string.
				if (typeof elm.style[props] == "string") {
					return props; //return supported style
				}
			} else if (typeof props == "object") { //check if it's many properties, should only be an array
				var propsLength = props.length,i;
				for (i = 0; i < propsLength; i++) {
					if (typeof elm.style[props[i]] == "string") {
						return props[i]; //return that string
					}
				}
			}
			return false;
		}
	}
}

var mcEnabled = location.search.indexOf("mconsole");
if (mcEnabled != -1) {
	mobileConsole.init(8);
window.onerror = function(msg, url, line){
	url = (url == location.href) ? "Global :: " : url;
	mobileConsole.errorInstance.push({msg:msg,url:url,line:line});
	window.console.error(mobileConsole.errorInstance[mobileConsole.errorInstance.length-1]);
};
} else if (mcEnabled < 1) {
	//nothing
}



