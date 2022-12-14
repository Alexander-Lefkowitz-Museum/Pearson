/*	DOM-BOMB :: GUI Javascript Library :: BETA 0.2
	Created and maintained by Alexander Lefkowitz :: Jan 02 2012

Usage: 
 gui([string of ID, an element, or array of elements]).chainableTool().chainableTool().unchangeableTool()
 ^    ^Primitive Selector		   ^possible future^      ^  returns method list  ^       ^returns value
						 ^Similar to $ for jquery
	docObjectConst.prototype.self = this.collection[0];
*/
var domToolsName = "domTools";
window["tracking_" + domToolsName] = {enterFrame:{},instances:0,framerate:30};;
window[domToolsName] = (
	function(){
		var docObjectConst = function(elems, fdDOM) {
			var elems = elems || document.body;
			if (elems.length) {
				if (typeof elems === "object") {
					this.collection = Array.prototype.slice.call(elems);
				} else {
					this.collection = [document.getElementById(elems)];
				}
			} else {
				this.collection = [elems];
			}
			this.forceDefaultDOM = fdDOM || false;
			this.self = this.collection[0];
			return this;
		};
		
		var docObject = function(elems, fdDOM){
			if (typeof elems === "string" && elems.charAt(0) === "#") {
				return document.getElementById(elems.slice(1)) || document.documentElement;
			}
            return new docObjectConst(elems, fdDOM);
		};

	docObjectConst.prototype.checkCssProps = function (props) {
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
	};
	
	//calculates 2 hex values by converting the RGB values to base10
	docObjectConst.prototype.insertText = function (text) {
		var elm = this.collection[0], txt = text.toString() || "";
        if (document.body.innerText) {
			elm.innerText += txt;
        } else {
            elm.innerHTML += txt.replace(/\&lt;br\&gt;/gi,"\n").replace(/(&lt;([^&gt;]+)&gt;)/gi, "");
        }
        return this;
	};
		docObjectConst.prototype.browser = function() {
		//tests from most features to least, otherwise testing for IE5 in IE9 will be true
		var ieLim=3,mozLim=1,n;
		for (n=9;n>ieLim;n--) { 
			if (this.testIe(n)) {
				return "IE" + ((n>8)? "9/10+" : n);
 			}
		}
		for (n=6;n>mozLim;n--) { 
			if (this.testMoz(n)) {
				return "Moz" + ((n>5)? "6/7+" : n);
 			}
		}
		if (this.testIe("5.5")) {
			return "IE" + "5.5";
		} else if (this.testMoz("3.6")) {
			return "Moz3.6";
		} else if (this.testMoz("3.5")) {
			return "Moz3.5";
		} else if (this.testWK()) {
			return "WebKit";
		} else if (this.testOp()) {
			return "Opera";
		}
		return false;
	};
	docObjectConst.prototype.testIe = function(ver) {
		if (!ver) {
			if (!!document.all && !window.opera) {
				return true;
			}
		} else if (!window.opera & !!document.all){
			switch (ver.toString()) {
				case "4":
					if (!window.attachEvent && !document.compatMode && !window.createPopup) {
						return true;
					}break;

				case "5":
					if (window.attachEvent && !document.compatMode && !window.createPopup) {
						return true;
					}
					break;
				case "5.5":
					if (window.createPopup && !document.compatMode) {
						return true;
					}
					break;
				case "6":
					if (!!document.compatMode && !typeof document.documentElement.style.maxHeight!="undefined"  && !document.documentMode) {
						return true;
					}
					break;
				case "7":
					if (typeof document.documentElement.style.maxHeight!="undefined" && !document.documentMode) {
						return true;
					}
					break;
				case "8":
					if (document.documentMode && !window.performance) {
						return true;
					}
					break;
				case "9":
					if (document.documentMode && !!window.performance) {
						return true;
					}
					break;
				default:
					break;
			}
		}
		return false;
	};
	docObjectConst.prototype.testMoz = function(ver) {
		var isMoz = !!(window.globalStorage && !window.opera);
		if (!ver) {
				if (isMoz) {
					return true;
				}
		} else if (isMoz){
			switch (ver.toString()) {
				case "2":
					if (!window.postMessage) {
						return true;
					}
					break;
				case "3":
					if (window.postMessage && !document.querySelector) {
						return true;
					}
					break;
				case "3.5":
					if (typeof Proxy === 'undefined' && !!document.querySelector && !document.body.classList) {
						return true;
					}
					break;
				case "3.6":
					if (typeof Proxy === 'undefined' && !!document.querySelector && document.body.classList) {
						return true;
					}
					break;
				case "4":
					if (typeof Proxy !== 'undefined' && document.body.isContentEditable !== undefined && typeof Proxy !== 'undefined' && !WeakMap) {
						return true;
					}
					break;
				case "5":
					if (typeof Proxy !== 'undefined' && typeof Function.prototype.isGenerator == 'function' && !WeakMap) {
						return true;
					}
					break;
				case "6":
					if (!!WeakMap) {
						return true;
					}
					break;
				default:
					break;
			}
		}
		return false;
	};
	docObjectConst.prototype.testWK = function() {
		if (!document.all && document.body.onmousewheel !== undefined) {
			return true;
		}
		return false;
	};
	docObjectConst.prototype.testOp = function() {
		if (window.opera) {
			return true;
		}
		return false;
	};
	docObjectConst.prototype.hex3to6 = function (h4) {
		if (h4.charAt(0) === "#" && h4.length === 4) {
			return "#" + h4.charAt(1) + h4.charAt(1) + h4.charAt(2) + h4.charAt(2) + h4.charAt(3) + h4.charAt(3);
		}
		return h4;
	};
	docObjectConst.prototype.averageHexColor = function (c1, c2) {
		if (c1.charAt(0) === "#" && c2.charAt(0) === "#") { //check if colors are hex values
			if (c1.length === 4) {
				c1 = this.hex3to6(c1);
			}
			if (c2.length === 4) {
				c2 = this.hex3to6(c2);
			}
			//This c1_ and c2_ are the passed hex
			var c1_1 = parseInt(c1.substr(1, 2), 16), //pull out a channel - #FF___ then #__FF__ etc, as base16 into base10
				c1_2 = parseInt(c1.substr(3, 2), 16),
				c1_3 = parseInt(c1.substr(5, 2), 16),
				c2_1 = parseInt(c2.substr(1, 2), 16),
				c2_2 = parseInt(c2.substr(3, 2), 16),
				c2_3 = parseInt(c2.substr(5, 2), 16),
			color = [(~~((c1_1 + c2_1) / 2)).toString(16), //average each channel, round to int, convert to base16
					 (~~((c1_2 + c2_2) / 2)).toString(16),
					 (~~((c1_3 + c2_3) / 2)).toString(16)];
			for (var n = 0; n <= 2; n++) {
				if (color[n].length === 1) {
					color[n] = "0" + color[n];
				}
			}
			return "#" + color.join("");
		} else {
			return "#000000";
		}
	};
	docObjectConst.prototype.rgbToHex = function (rgb) { //converts "rgb(255, 255, 255)" to "#FFFFFF"
		var color = (typeof rgb === "string" && rgb.length > 9) ? rgb : "rgb(0, 0, 0)";
		color = color.slice(4).split(", ");
		color[0] = parseInt(color[0]).toString(16);
		color[1] = parseInt(color[1]).toString(16);
		color[2] = parseInt(color[2]).toString(16);
		return "#" + color.join("");
	};
	docObjectConst.prototype.applyCustomStyles = function (CSSrules) {
		if (CSSrules.length && typeof CSSrules === "string") {
			var ssheet = document.getElementById("custom_gui") || document.createElement('style'),
				sheet = CSSrules || "";
				ssheet.setAttribute("type", "text/css");
				ssheet.id = "custom_gui";
				
			document.getElementsByTagName('head')[0].appendChild(ssheet);
			if (ssheet.styleSheet) { // IE
				ssheet.styleSheet.cssText = sheet;
			} else { // the world
				ssheet.appendChild(document.createTextNode(sheet));
			}
		}
		return this;
	};
	docObjectConst.prototype.dashToCamelCase = function(dashedString) {
		if (typeof dashedString === "string" && dashedString.length) {
			var dsArr = dashedString.split("-"), dsArrLength = dsArr.length,dsArrN,dsArr_0,newStringCased,n;
			for(n=1;n<dsArrLength;n++) {
				dsArrN = dsArr[n];
				dsArr_upperFirstChar = dsArrN.charAt(0).toUpperCase();
				dsArr[n] = dsArr_upperFirstChar + dsArrN.slice(1);
			}
			newStringCased = dsArr.join("");
		}
		return newStringCased || "";
	};
	docObjectConst.prototype.getBackgroundColor = function () {
		return this.computedStyle("background-color") || "#000000";
	};
	docObjectConst.prototype.computedStyle = function (styleKey) {
		var elm = this.collection[0],padMarComplete = false;
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
		return "";
	};
	docObjectConst.prototype.average = function () {
		var numbers = (typeof arguement[0] === "object" && arguement[0].length) ? arguement[0] : arguement;		
		var n=0,average=0,numbersLength = numbers.length;
		if (numbers.length) {
			for (n=0;n<numbersLength;n++) {
				numbersN = numbers[n];
				average+= (typeof numbersN === "number") ? numbersN : 0;
			}
			return average/n;
		}
		return 0;
	};
	docObjectConst.prototype.protectType = function (data, type) {
		var returnData;
		if (type === "undefined" || type ===  "object" ||
			type === "boolean"|| type === "number" ||
			type === "string" || type === "function") {
			
			if (typeof data === type) {
				returnData = data;
			} else {
				switch (type) {
					case "undefined":
						returnData = null;
						break;
					case "object":
						returnData = {};
						break;
					case "boolean":
						returnData = !!data;
						break;
					case "number":
						returnData = Number(!!data);
						break;
					case "string":
						returnData = (!!data) ? data.toString() : "";
						break;
					case "function":
						returnData = function (){};
						break;
					default: returnData = null;
						break;
				}
			}
		} else {
			returnData = null;
		}
		return returnData;
	};
	docObjectConst.prototype.enterFrame = function (func) {
		//enterframe is a function that simulates Flash/AS1's enterframe event.
		//this event does not run at a specified framerate, this may freeze or slow
		//down javascript, so in this function we constantly test how long a given
		//method takes to execute, add 5ms, use that as the framerate, this repeats.
		var tracking = window["tracking_" + domToolsName];
		tracking.func = func;
		tracking.efFunc = function() {
			var efTracking = window["tracking_" + domToolsName],
				start = (new Date()).getTime();
			efTracking.func();
			var framerate = (new Date()).getTime() - start;
			window.clearTimeout(efTracking.enterFrame);
			efTracking.enterFrame = window.setTimeout(efTracking.efFunc,framerate+5);
		};
		tracking.efFunc();
	};
	docObjectConst.prototype.bindEvent = function(type, eventHandle) {
		if (typeof type === "string" && typeof eventHandle === "function") {
			type = type.toLowerCase();
			var elm = (type === "resize" || type === "onresize") ? window : this.collection[0],onType;
			if (type.charAt(0) === "o" && type.charAt(1) === "n") {
				type = type.slice(2);
				//some browsers need 'on' in the beginning of the event type,
				//some don't. This will remove 'on' if added, 'on' will be added in the variable 'onType'.
			}
			onType = "on"+type;
			if (elm.addEventListener) {
				elm.addEventListener(type, eventHandle, false);
			} else if (elm.attachEvent) {
				elm.attachEvent(onType, eventHandle);
			} else {
				elm[onType]=eventHandle;
			}
		}
		return this;
	};
	docObjectConst.prototype.applyRadius = function (csArgu) { //size, can only take a number or array of number, no strings
		var supportRadius = this.checkCssProps(['MozBorderRadius', 'borderRadius', 'WebkitBorderRadius']),cornerSize = csArgu;
		var multiVals = (typeof cornerSize === "object" && cornerSize.length) ? true : false, elm = this.collection[0];
		
		var offSetPadding=0,ToffSetPadding=0,BoffSetPadding=0,elmPadding;
		
		elmPadding = [parseInt(this.computedStyle("padding-left")),parseInt(this.computedStyle("padding-right"))];
		
		var expGr = (multiVals) ?[(2 - cornerSize[0] / 25),
								  (2 - cornerSize[1] / 25),
								  (2 - cornerSize[2] / 25),
								  (2 - cornerSize[3] / 25)] : (2 - cornerSize / 25);	
		if (!supportRadius || this.forceDefaultDOM) {
			var bgColor = this.getBackgroundColor(), top = [], bottom = [], contWrap;
			var styleSheet = ".CSS2rounded {display:block;background:" + bgColor + " top left repeat fixed " + this.computedStyle("background-image") + ";height:1px;font-size:0;"
						   + "border-right:thin solid;border-left:thin solid;overflow:hidden}";
			this.applyCustomStyles(styleSheet);
			
			//border color is used for anti-aliasing, the border is an average between the internal element's background
			var borderColor = this.averageHexColor("#111", bgColor); //Averaging between between black and the backgroundColor because of the shadow effect
			
			if (multiVals) {
				var cornerSize0=cornerSize[0],
					cornerSize1=cornerSize[1],
					cornerSize2=cornerSize[2],
					cornerSize3=cornerSize[3];
					
				var border = "border:" + borderColor + ";border-right-width:1px;border-left-width:1px;";
				while (Math.max(cornerSize0,cornerSize1) > 0.5) {
					if (!tl && cornerSize0 < .8) {var tl = true; border = "border-left:none 0;border-right:none 0;";}
					if (!tr && cornerSize1 < .8) {var tr = true; border = "border-left:none 0;border-right:none 0;";}
					top.push("<div class=\"CSS2rounded\" style=\"" + border + ";margin:0 " + ~~cornerSize0 + "px 0 " + ~~cornerSize1 + "px \"></div>");
					cornerSize0 /= expGr[0];
					cornerSize1 /= expGr[1];
					
					ToffSetPadding++;
				}
				var border = "border:" + borderColor + ";border-right-width:1px;border-left-width:1px;";
				while (Math.max(cornerSize2,cornerSize3) > 0.5) {
					if (!bl && cornerSize2 < .8) {var bl = true; border = "border-left:none 0;border-right:none 0;";}
					if (!br && cornerSize3 < .8) {var br = true; border = "border-left:none 0;border-right:none 0;";}
					bottom.push("<div class=\"CSS2rounded\" style=\"" + border + ";margin:0 " + ~~cornerSize2 + "px 0 " + ~~cornerSize3 + "px \"></div>");
					cornerSize2 /= expGr[2];
					cornerSize3 /= expGr[3];
					
					BoffSetPadding++;
				}
					
				} else {
					while (cornerSize > 0.5) {
						top.push("<div class=\"CSS2rounded\" style=\"border-color:" + borderColor + ";margin:0 " + ~~cornerSize + "px \"></div>");
						cornerSize /= expGr;
						offSetPadding++;
					}
					bottom = top;
				}
			
			contWrap = this.sandwhich(top.join(""), bottom.reverse().join(""));
			document.getElementById(contWrap).style.padding = ToffSetPadding + "px "+elmPadding[1]+"px "+ BoffSetPadding+"px "+elmPadding[0]+"px";
			elm.style.padding = "0";
			} else if (multiVals) {
			elm.style[supportRadius] = cornerSize.join("px ")+"px";
		}
		return this;
	};
	docObjectConst.prototype.applyShadow = function (bsArgu) {
		var nativeShadow = this.checkCssProps(['MozBoxShadow', 'boxShadow', 'WebkitBoxShadow']),
		nativeFilter = this.checkCssProps('filter'),
		shadowStrength = bsArgu || 4,
		elm = this.collection[0];
		
		if (!nativeShadow && nativeFilter) {
			var shadDiv = document.createElement("DIV");
			shadDiv.id = "playerRollShadow";
			shadDiv.style[nativeFilter] = "progid:DXImageTransform.Microsoft.Blur(pixelRadius=" + shadowStrength + ")";
			elm.parentNode.insertBefore(shadDiv, elm);
		}
		return this;
	};
	docObjectConst.prototype.randomIdendifier = function (srt) {
		var startString = (typeof str === "string" && str.length) ? srt : "cnbc_";
		return startString + Math.floor(Math.random()*10000000000);
	};
	docObjectConst.prototype.sandwhich = function(pre, app, dynId) { 
		var elm = this.collection[0], wrapDiv = document.createElement("DIV");
		var id = dynId || this.randomIdendifier("sandwhich");
		
		wrapDiv.style.backgroundColor = this.getBackgroundColor();
		wrapDiv.innerHTML = elm.innerHTML;
		wrapDiv.id = id;
		wrapDiv.className = elm.className;
		
		elm.innerHTML = (pre || "");
		elm.style.backgroundColor = "transparent";
		elm.appendChild(wrapDiv);
		elm.innerHTML += (app || "")
		return (dynId) ? this : id;
	};
	docObjectConst.prototype.wrap = function(dynId, erase) {
		var elm = this.collection[0], wrapDiv = document.createElement("DIV");
		var id = dynId || this.randomIdendifier("wrap"),
		cNode, elmParent = elm.parentNode;
		if (!erase) {
			cNode = elm.cloneNode(true);
			wrapDiv.appendChild(cNode);
		}
		wrapDiv.id = id;
		elmParent.insertBefore(wrapDiv,elm);
		elmParent.removeChild(elm);
		this.collection[0] = wrapDiv;
		
		return (dynId) ? this : id;
	};
		docObject.func = docObjectConst.prototype;
		
		
    return docObject;
	}
)();