"use strict";
window.ATM_Tools = {
	callbacksToRun:[],
	callbackErrors:[],
	callbackRunTimes:[],
	queuePosition:0,
	currentPosition:0,
	trigger:0,
	runQueue:  function (waitPosition,args) {
		var self = this, runCallback, cbRan = 0, startTime,
			queueDelay = 9 + (self.callbackRunTimes.length-2 || 1); //minimum of 10
		if(typeof args.callBack === "function") {
			runCallback = function () {
				window.setTimeout(function(){
					if(self.currentPosition === waitPosition) {
						window.setTimeout(function () {
							cbRan = 1;
							startTime = new Date().getTime();
							args.callBack();
							self.currentPosition++;
							self.callbackRunTimes.push(new Date().getTime()-startTime)
						}, args.delay);
					} else if (!cbRan) {
						runCallback()
					}
				}, 25);
			}
			if (args.allowFail) {
				try {
					runCallback();
				} catch (e) {
					self.currentPosition++;
					this.callbackErrors.push({"time":new Date().getTime(),"error":e})
				}
			} else {
				runCallback();
			}
		}
	},
	runInOrder: function () {
		var self = this, n=0, argument, callbacks, callback, delay=0;
		callbacks = Array.prototype.slice.call(arguments);
		if(typeof callbacks[callbacks.length-1] === "number") {
			delay = callbacks.pop();
		}
		if (delay) {
			while(callback = callbacks[n++]) {
				self.asyncRun(callback,delay);
			}
		} else {
			while(callback = callbacks[n++]) {
				self.asyncRun(callback);
			}
		}
		return self;
	},
	runOnTrigger: function (trigger,callBack) {
		var self = this, checkTrigger;

		checkTrigger = function () {
			if (self.trigger === trigger) {
				self.asyncRun(callBack);
			} else {
				window.setTimeout(function() {
					checkTrigger();
				}, 75);
			}
		}
		checkTrigger();
		return self;
	},
	asyncRun: function (callBack) {
		var self = this, delay=2, fail=0;
		if(typeof callBack !== "function") {
			return;
		}
		if (typeof arguments[1] === "number" && arguments[1] > 2) {
			delay = arguments[1];
			if (typeof arguments[2] === "boolean") {
				fail = arguments[2];
			}
		} else if (typeof arguments[1] === "boolean") {
			fail = arguments[1];
			if (typeof arguments[2] === "number") {
				delay = arguments[2];
			}
		}
		self.runQueue(self.queuePosition++,
					  {"callBack":	callBack,	
					   "delay":		delay,
					   "allowFail":	fail});

		return self;
	},
	whenDone: function (callBack) {
		if(typeof callBack !== "function") { return }
		var self = this,
		checkQueue = function () {
			if (self.currentPosition === self.queuePosition) {
				self.asyncRun(callBack);
			} else {
				window.setTimeout(function() {
					checkQueue();
				}, 75);
			}
		}
		checkQueue();
		return self;
	}
}