"use strict";
// This file indetifies important preliminary information for the rest of the
// application such as touch support and HTML5 support
// This file should be the only javascript file running included inside the HEAD
// tag.
var catchBatch = {
		ready: function (deferredFunction) {
			var self = this;
			document.onreadystatechange = function() {
			   if (this.readyState === "complete") {
					deferredFunction();
					document.onreadystatechange = null;
			   }
			}
		},
		run: function () {
			var self = this;
			if (typeof window.console !== "object") {
				window.console = {log:function(){}};
			}
			self.HTML5Supported =
				(typeof document.createElement("video").play === "function");
			self.touchSupported = 
				(document.ontouchstart === null)

			if (self.HTML5Supported || (location.search.indexOf("HTML5")+1)) {
				document.body.className += " HTML5";
			}
			if (self.touchSupported || (location.search.indexOf("touch")+1)) {
				document.body.className += " touch";
				self.touchSupported = true;
			}
			self.ready(function () {
				if (typeof jQuery === "function") {
					window.libraries = {};
					var pageScript = 0, $script = $("script");
					$script.not("[src]").each(function () {
						if (this.getAttribute("library") !== "string") {
							this.setAttribute("library", "embed"+(pageScript++));
						}
					});
					$script.filter("[src]").each(function(){
						if (this.getAttribute("library") !== "string") {
							this.setAttribute("library",this.src.slice(this.src.lastIndexOf("/")+1));
						}
					})
					$script.each(function () {
						window.libraries[this.getAttribute("library")] = this;
					})
				}
			})
		},

	}
