//swipeIt - Alexander Lefkowitz :: 5/09/12
"strict mode";
var swipeIt = function () {
	this.init = function (elem, minLength) {
		var self = this;
		self.minLength = minLength || 40;
		self.setDefaults();
		if (elem && typeof elem.id === "string") {
			self.triggerElement = elem;
		} else {
			self.triggerElement = document.documentElement;
		}
		if (document.ontouchstart === null) {
			self.triggerElement.addEventListener("touchstart", function (e) {
					self.touchStart(e);
				}, false);
			self.triggerElement.addEventListener("touchend", function (e) {
					self.touchEnd(e);
				}, false);
			self.triggerElement.addEventListener("touchmove", function (e) {
					self.touchMove(e);
				}, false);
			self.triggerElement.addEventListener("touchcancel", function () {
					self.setDefaults();
				}, false);
		} else {
			self.triggerElement.addEventListener("mousedown", function (e) {
					self.touchStart(e);
				}, false)
			self.triggerElement.addEventListener("mouseup", function (e) {
					self.touchEnd(e);
				}, false)
			self.triggerElement.addEventListener("mousemove", function (e) {
					self.touchMove(e);
				}, false)
		}
	}
	this.touchStart = function (event) {
		var self = this;
		//event.preventDefault();

		if ( event.touches && event.touches.length === 1 ) {

			self.startX = event.touches[0].pageX;
			self.startY = event.touches[0].pageY;
		} else {
			self.startX = event.pageX;
			self.startY = event.pageY;
		}
		self.canSwipe = 1;
		window.setTimeout(function() {self.canSwipe = 0}, 200);
	}
	this.touchMove = function (event) {
		event.preventDefault();
		var self = this;
		if ( event.touches ) {
			self.curX = event.touches[0].pageX;
			self.curY = event.touches[0].pageY;
		} else {
			self.curX = event.pageX;
			self.curY = event.pageY;
		}
	}
	this.touchEnd = function (event) {
		var self = this;
		// check to see if more than one finger was used and that there is an ending coordinate
		if (self.curX !== 0  && self.canSwipe) {
			// use the Distance Formula to determine the length of the swipe
			self.swipeLength = ~~(Math.sqrt(Math.pow(self.curX - self.startX,2)
									+ Math.pow(self.curY - self.startY,2))+0.5);
			// if the user swiped more than the minimum length, perform the appropriate action
			if ( self.swipeLength >= self.minLength ) {
				self.caluculateAngle();
				self.determineSwipeDirection();
				self.swipeAction();
			} else {
				self.setDefaults();
			}	
		} else {
			self.setDefaults();
		}
	}
	this.setDefaults = function () {
		var self = this;
		self.fingerCount = 0;
		self.startX = 0;
		self.startY = 0;
		self.curX = 0;
		self.curY = 0;
		self.deltaX = 0;
		self.deltaY = 0;
		self.horzDiff = 0;
		self.vertDiff = 0;
		self.swipeLength = 0;
		self.swipeAngle = null;
		self.swipeDirection = null;
		
	}
	this.caluculateAngle = function () {
		var self = this;
		var X = self.startX-self.curX,
			Y = self.curY-self.startY,
			Z = ~~(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2))+0.5),
			// ~~(variable to be rounded + 0.5) is faster then Math.round(variable)
			r = Math.atan2(Y,X);

		self.swipeAngle = ~~((r*180/Math.PI)+0.5);
		if ( self.swipeAngle < 0 ) { self.swipeAngle = 360 - Math.abs(self.swipeAngle) }
	}
	this.determineSwipeDirection = function () {
		var self = this;
		if ( (self.swipeAngle <= 45) && (self.swipeAngle >= 0) ) {
			self.swipeDirection = 'left';
		} else if ( (self.swipeAngle <= 360) && (self.swipeAngle >= 315) ) {
			self.swipeDirection = 'left';
		} else if ( (self.swipeAngle >= 135) && (self.swipeAngle <= 225) ) {
			self.swipeDirection = 'right';
		} else if ( (self.swipeAngle > 45) && (self.swipeAngle < 135) ) {
			self.swipeDirection = 'down';
		} else {
			self.swipeDirection = 'up';
		}
	}
	this.swipeAction = function () {
		var self = this;
		
		if ( self.swipeDirection == 'left' ) {
			if(self.leftAction) { 
				self.leftAction();
			}
		} else if ( self.swipeDirection == 'right' ) {
			if(self.rightAction) { 
				self.rightAction();
			}
		} else if ( self.swipeDirection == 'up' ) {
			if(self.upAction) { 
				self.upAction();
			}
		} else if ( self.swipeDirection == 'down' ) {
			if(self.downAction) { 
				self.downAction();
			}
		}
		self.setDefaults(); // reset the variables
	}
}