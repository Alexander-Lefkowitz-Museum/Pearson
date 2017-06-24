"use strict";

var compTia = {
	features:{}, //features object in comptia.features.1.js
	modules:{},  //modules object in comptia.modules.1.js
	search:{},  //search object in comptia.search.1.js
	init:function () {

		var self = this; //this is to cache the scope, useful for innertwined jquery calls
		if (catchBatch.HTML5Supported) {
			self.defaults();
			self.toggleLoader(1);
			self.currentPage.innerHTML = "<h2 style='color:gray;text-align:center'>Initializing</h2>";

			//small delay allows IE and Chrome to show the Initializing text
			setTimeout(function () {
				self.urlVars();
				self.events();
				self.features.notesComponent();
				self.features.startHighlight();
				self.currentPage.innerHTML += "<h2 style='color:gray;text-align:center'>Seeking data</h2>";
				self.getData(function () { //this is a callback, these functions run when ajax is done
					self.structureData();
					self.currentPage.innerHTML += "<h2 style='color:gray;text-align:center'>Rendering DOM</h2>";
					self.postInit();
					self.search.searchEvents();
					self.toggleLoader(0);
				});
			},5)
			return 1;
		} else {
			document.getElementById("unsupported").style.display = "block";
		}
	},
	moveTo: function (chapter, page, popup) {
		var self = this;
		self.toggleLoader(1);
		if (self.currentChapter !== chapter) {
			self.generatePages(chapter);
		}

		self.currentPageNumber = -1; //this is set to 0 so switchPage doesn't ignore "page"
		self.switchPage(1,page);
		$("video").each(function(){this.pause()})
		window.setTimeout(function () {
			if (typeof popup === "number") {
				self.togglePopup(page,popup);
			}
			self.toggleLoader(0);
		}, 400);
	},
	urlVars: function () {
		//This function parses out the key/value pairs and stores them in the object compTia.urlValues
		var varString = location.search.slice(1),
			splitVars = varString.split("&"),keyValuePair,key,val,n=0;

		while (keyValuePair = splitVars[n]) {
			this.urlValues[keyValuePair.split("=")[0]] = keyValuePair.split("=")[1] || "";
			n++;
		}
	},
	isChapterB: function () {
		var self = this;
		return (self.currentPageNumber >= self.startChapterB && self.startChapterB !== 0);
	},
	gotoGlossary: function () {
		var self = this;
		//switches to the glossary page of the current chapter, disables the glossary popup
		if (self.isChapterB()) {
			this.switchPage(0,this.chapterBGlossaryPage);
		} else {
			this.switchPage(0,this.chapterGlossaryPage);
		}
		this.features.glossary();
	},
	gotoTOC: function () {
		var self = this;
		if(self.isChapterB() && self.currentPageNumber !== (self.startChapterB+1)) {
			self.switchPage(0,self.startChapterB+1);
		} else {
			self.switchPage(0,1)
		}
	},
	getGlossaryTerms: function () {
		//this function stores all the glossary definitions in compTia.glossaryData
		var self = this;
		$.ajax({
			cache:false,
			dataType:"xml",
			url:"assets/xml/glossary.xml"})
		 .done(function (glossaryData) {
				self.glossaryData = $.xml2json(glossaryData).glossary.definition;
		});
	},
	getData: function (callBack) {
		var self = this,chapterHold,n=0,nn=0,nnn=0,o=0,oo=0,dataError=0,popupChapter;
		self.ajaxAttempts++;

		self.pages = [];
		$.ajax({
			cache:false,
			dataType:"xml",
			async:false,              
			error:function(){dataError = 1}, //if error, try again
			url:"assets/xml/content.xml"})
		 .done(function(data){
		 		dataError = 0;
		  		self.rawData = $.xml2json(data);
		  		self.rawData.chapter = [];
		  		self.chaptersLength = parseInt(self.rawData.chapters);

		  		$.ajax({cache:false,
						dataType:"xml",
						error:function(){dataError = 1},
						url:"assets/xml/modules.xml"})
					.done(function (modulesData) {
						self.pageModules = $.xml2json(modulesData).module;
				});
				//at this point we would need to know how many chapters there are

				self.getGlossaryTerms();

				while (n <= self.chaptersLength) {
					self.rawData.chapter[n] = {};
					$.ajax({
						dataType:"xml",
						error:function(){dataError = 1},
						url:"assets/xml/chapter"+(n)+".xml"})
					 .done(function (chapterData) {
						chapterHold = $.xml2json(chapterData).chapter;
						nn = ~~chapterHold.index;
							self.rawData.chapter[nn].glossary = chapterHold.glossary;
							self.rawData.chapter[nn].index = chapterHold.index;
							self.rawData.chapter[nn].page = chapterHold.page;
							self.rawData.chapter[nn].title = chapterHold.title;
							if(chapterHold.secondGlossary) {
								self.rawData.chapter[nn].secondGlossary = chapterHold.secondGlossary;
							}
						});
					$.ajax({cache:false,
								dataType:"xml",
								error:function(){dataError = 1},
								url:"assets/xml/chapter"+n+"_popups.xml"})
						.done(function (popupData) {
							popupChapter = $.xml2json(popupData).chapter;
							nnn = ~~popupChapter.index;
							self.rawData.chapter[nnn].popup = popupChapter.popup;
						})
					n++;
				}
				$(document).ajaxStop(function (e) {
					callBack();
					$(document).off("ajaxStop");
				})

		});
		if (dataError) {
			if (self.ajaxAttempts < 10) {
				self.getData();
			} else {
				self.structureData = function () {};
				self.postInit = function () {};
				self.search.searchEvents = function () {};
				self.currentPage.innerHTML = "Looks like there is a data error<br>Refreshing page in 3 seconds"
				window.setTimeout("location.reload()",3000)
			}
		}
	},
	defaults: function () {
		var self = this, cacheDoc = document,
			styleList = cacheDoc.documentElement.style;
		//caching and dom traversing
		self.features.root =	self; //features object in comptia.features.1.js
		self.modules.root =		self;
		self.search.root =		self;
		self.atmTools =			ATM_Tools;
		self.$document =		$(cacheDoc);
		self.$topUls = 			$("div.linkBar .innerUl")
		self.contain =			cacheDoc.getElementsByClassName("contain")[0]; //entire page
		self.loaderElm =		cacheDoc.getElementById("loading");
		self.loaderElmSpans = 	self.loaderElm.getElementsByTagName("span");
		self.flipPage =			cacheDoc.getElementById("flipPage"); //animation copy of currentPage
		self.prePage =			cacheDoc.getElementById("prePage"); //blank page visible on the left
		self.currentPage =		cacheDoc.getElementById("currentPage");//page the user sees
		self.postPage =			cacheDoc.getElementById("postPage"); //blank page visible on the right
		self.glossary =			cacheDoc.getElementById("glossary"); //glossary container
		self.glossaryPopout =	cacheDoc.getElementById("glossaryPopout"); //actual popout with glossary content
		self.notes =			cacheDoc.getElementById("notesFeature");
		self.notesOL =			self.notes.getElementsByTagName("ol")[0];
		self.popupFeature =		cacheDoc.getElementById("popupFeature");
		self.readMoreFeature =	cacheDoc.getElementById("readMoreFeature");
		self.ethicsFeature =	cacheDoc.getElementById("ethicsFeature");
		self.trendsFeature =	cacheDoc.getElementById("trendsFeature");
		self.digDeeperFeature =	cacheDoc.getElementById("digDeeperFeature");
		self.bbFeature =		cacheDoc.getElementById("bbFeature");
		self.hvFeature =		cacheDoc.getElementById("hvFeature");
		self.ahFeature =		cacheDoc.getElementById("ahFeature");
		self.popupImage =		cacheDoc.getElementById("popupImage");
		self.featuresElm =		cacheDoc.getElementById("features");
		self.sliderElm = 		cacheDoc.getElementById("pageSlider");
		self.highlightGUI =		cacheDoc.getElementById("layout").getElementsByClassName("highlightGUI")[0];
		self.popupEmail = 		cacheDoc.getElementById("emailPopup");
		self.inputEmail =		cacheDoc.getElementById("inputEmail");

		self.supportTouch =		catchBatch.touchSupported;
		self.normalizedClick = 	self.supportTouch ? "touchstart" : "click";
		//uiTracking
		self.uiSwitches = {
			dontSwipe:false,
			showNotes:false,
			enableHighlight:true,
			highlighting:false,
			eraser:false,
			loading:false,
			loaderInterval:0
		}
		self.urlValues = {};
		//variables
		self.sessionEmail = "";
		self.allPagesDOM = [];
		self.domIsGenerated = 0;
		self.ajaxAttempts = 0;
		self.swipeTimeSpread = [0,0];
		self.currentSearches = 0;
		self.currentSearchCount = 0;
		self.currentSearchPages = [];
		self.searchResultsSection = 0; //result section index for search results
		self.current = 0;
		self.bookPageNumber = [];
		self.bookPageNumberReference = [];
		self.currentChapter = 0; //this is 0 indexed!
		self.currentPageNumber = 0; //this is 0 indexed!
		self.currentBookPageNumber = 0; //this is 0 indexed!
		//self.chapterGlossaryPage = 38; //this is 0 indexed!
		self.chapterInfoHold = [];
		self.chapterGlossaryPage = 22; //this is 0 indexed!
		self.chapterBGlossaryPage = 44;
		self.HL_clicked	= 0;
		self.chapters = [];
		self.popups = [];
		self.rotate = 1;
		self.pageRotation = 0;
		self.swipeAngle = 180;
		self.swipeSpeed = 10;
		self.rotationSensitivity = 3; //higher slows down rotation
		self.translateX = -1400;
		self.translateY = 0;
		self.frames = 10; //frames per swipe animation
		self.msFrameRate = 33; //frameRate in milliseconds
		self.pageRotation = self.rotate/self.frames;
		self.clipVals = ["rect(",156,"px, 1024px, 156px, 0px)"];
		self.slideup = 0;
		self.noteLog = 0;
		self.pageX = self.translateX/self.frames;
		self.pageY = self.translateY/self.frames;
		//script version of transform for all browsers

		if (typeof styleList.transform === "string") {
			self.transformRule = "transform";
		} else if (typeof styleList.webkitTransform === "string") {
			self.transformRule = "webkitTransform";
		} else if (typeof styleList.msTransform === "string") {
			self.transformRule = "msTransform";
		} else if (typeof styleList.MozTransform === "string") {
			self.transformRule = "MozTransform";
		}
	},
	toggleLoader: function (tog) {
		var self = this,n=0,spanTrack=0,
			spansLength = self.loaderElmSpans.length,
			clearSpans = function () {
				while (n<spansLength) {
					self.loaderElmSpans[n++].className = "";
				}
				n=0;
			},
			loaderAnimation = function () {
				if (self.uiSwitches.loaderInterval) {
					clearSpans();
					if (spanTrack < spansLength) {
						self.loaderElmSpans[spanTrack++].className = "inline";
					} else {
						self.loaderElmSpans[0].className = "inline";
						spanTrack=1;
					}
					window.setTimeout(loaderAnimation,300);
				} else {
					$(self.loaderElm).fadeOut();
				}
			};

		if (tog) {
			self.loaderElm.style.display = "block";
			self.uiSwitches.loaderInterval = 1;
			loaderAnimation();
		} else {
			self.uiSwitches.loaderInterval = 0;
		}

	},

	structureData: function () {
		var self = this,
			unstructuredJSON = self.rawData, 
			unStuctChapterN = [],
			unStuctPopupNN = {},
			unStuctpageO, n,nn, o,oo,chapterLength,
			pageParse, pagedPopups,structuredJSON, firstPageChap=-1, pageCount = -1,
			sortedGlossaryData = {}, glossaryDataN, glossaryDataNword,
			glossaryDataNwordLowerCase;

			structuredJSON = {
				preChapterPages:[{}],
				chapters:[{}],
				postChapterPages:[{}]
			};
		for (n = 0; unStuctChapterN = unstructuredJSON.chapter[n]; n++) {
			structuredJSON.chapters[n] = {
				glossaryPage:unStuctChapterN.glossary,
				secondGlossaryPage:unStuctChapterN.secondGlossary||"0",
				title:unStuctChapterN.title,
				pages:[],
				popup:[[]]
			};
			for (nn = 0; nn < unStuctChapterN.popup.length; nn++) {
				unStuctPopupNN = unStuctChapterN.popup[nn]
				pageParse = parseInt(unStuctPopupNN.page);
					if (typeof structuredJSON.chapters[n].popup[pageParse] === "undefined") {
						structuredJSON.chapters[n].popup[pageParse] = [];
					}
					structuredJSON.chapters[n].popup[pageParse].push({
						distinction : (unStuctPopupNN || {}).distinction,
			 			sectionContent : (unStuctPopupNN || {}).section,
			 			customscript : (unStuctPopupNN || {}).customscript,
			 			closescript : (unStuctPopupNN || {}).closescript
			 		});
			}
			if (typeof unStuctChapterN.page.length === "undefined") {
				//if a chapter only has 1 page, it won't be wrapped in an array
				//so we do it here so we don't have to change the work.
				unStuctChapterN.page = [unStuctChapterN.page];
			}
			for (o = 0; unStuctpageO = unStuctChapterN.page[o]; o++) {
				structuredJSON.chapters[n].pages[o] = {
					type : unStuctpageO.type,
					distinction : unStuctpageO.distinction,
					sectionContent : unStuctpageO.section,
					pageNumber : unStuctpageO.index,
			 		customscript : unStuctpageO.customscript,
			 		closescript : unStuctpageO.closescript,
				}
			}
		}
		//structuring the glossary data
		

		for (n = 0; glossaryDataN = self.glossaryData[n];n++) {

			glossaryDataNword = glossaryDataN.word;
			glossaryDataNwordLowerCase = glossaryDataNword.toLowerCase();
			//object keys are the glossary terms in lowercase to remove casing issues
			sortedGlossaryData[glossaryDataNwordLowerCase] = {};
			sortedGlossaryData[glossaryDataNwordLowerCase].definition = glossaryDataN.text; //definition
			sortedGlossaryData[glossaryDataNwordLowerCase].originalWord = glossaryDataNword; //original word casing
		}
		self.glossaryData = sortedGlossaryData;
		self.chapters = structuredJSON.chapters.slice(); //slice() is used to copy the array, not reference

		self.chapterByPage = [];
		//count all pages and create proper references for page numbers and search flags
		for (chapterLength = self.chapters.length,n = 0; n < chapterLength; n++) {
			self.bookPageNumber[n] = [];
			firstPageChap = pageCount+1;
			pageCount += self.chapters[n].pages.length;
			self.bookPageNumberReference.push({first:firstPageChap, last:pageCount})
			for(nn = firstPageChap; nn<=pageCount; nn++) {
				self.chapterByPage.push(n);
				self.bookPageNumber[n].push(nn);
			}
		}
		self.bookPageNumberReference[0].first = 0; //set the very first page to 0.

	},
	switchPage: function (direction, page) {
		var self = this,
			holdPageHTML = "", pollChoice, pollLis,
			closeScriptString, customScriptString,
			holdPageClassName = "",n=0,clickAttr,
			flipPage = self.flipPage,
			prePage = self.prePage,
			currentPage = self.currentPage,
			postPage = self.postPage,
			customDirection = 0;
		if (self.currentPageNumber === page){
			return false; //if you're already on the page, don't do anything
		}

		
		self.$topUls.addClass("hideToggle");

		if (typeof page == "undefined") {

			if (direction === 1) {
				if (self.pagesDOM[self.currentPageNumber+1] === undefined) {
					if (self.currentChapter === (self.chaptersLength)) {
						self.switchChapter(0);
					} else {
						self.switchChapter(self.currentChapter+1);
					}
					return 0;
				}
			} else if (direction === 0 && self.currentPageNumber === 0) {
				if ((self.currentChapter-1) != -1) {
					self.switchChapter(self.currentChapter-1);
					self.switchPage(1, self.pagesDOM.length-1);
				}
				return 0;
			}
		}
		self.currentRotation = 0;
		self.currentX = 0;
		self.currentY = 0;
		self.countFrames = self.frames;
		self.swipeAngle += 90;
		if (typeof page === "number" ) {
			if (page == 0) {
				direction = 0;
				customDirection = 1;
			} else {
				customDirection = 2;
			}
		}
		if(closeScriptString = currentPage.getElementsByTagName("article")[0].getAttribute("closescript")) {
			window.eval(closeScriptString);
			//Eval is evil, but it's nessesary here
		}

		if (customDirection == 2 || (direction && self.pagesDOM[self.currentPageNumber+1])) {
			flipPage.style.display = "block";

			if (typeof page === "number") {
				self.currentPageNumber = page;
			} else {
				self.currentPageNumber++;
			}

			if(self.pagesDOM[self.currentPageNumber-1]) {
				prePage.style.display = "block";
				prePage.className = self.pagesDOM[self.currentPageNumber-1].className;
			} else {
				prePage.style.display = (self.currentBookPageNumber === 0) ? "none":"block";
				prePage.className = "page chapterReview";
			}

			flipPage.innerHTML = currentPage.innerHTML;
			flipPage.className = currentPage.className;
			flipPage.removeChild(document.getElementById("pageModule"));

			currentPage.innerHTML = self.pagesDOM[self.currentPageNumber].innerHTML;
			currentPage.className = self.pagesDOM[self.currentPageNumber].className;

			if (self.pagesDOM[self.currentPageNumber+1]) {
				postPage.style.display = "block";
				postPage.className = self.pagesDOM[self.currentPageNumber+1].className;
			} else {
				postPage.className = "page chapterStart";
			}

			if (self.swipeAngle > 360) {self.swipeAngle -= 360}
			self.swipeAngle -= 90;
			self.swipeAngle = (self.swipeAngle)*-1;
			self.pageRotation = self.swipeAngle/3/self.countFrames;

			if(self.domIsGenerated) {
				self.updateSwipeTimeDifference(0);
				self.fowardAction();
			} else {
				self.domIsGenerated = 1;
				self.flipPage.style[self.transformRule] = "none";
				self.flipPage.style.display = "none";
				self.togglePopup(0);
				compTia.uiSwitches.dontSwipe = 0;
			}
		} else if (customDirection == 1 || (self.pagesDOM[self.currentPageNumber-1] && !direction)){
			flipPage.style.display = "block";
			prePage.style.display = "block";
			if (typeof page === "number") {
				self.currentPageNumber = page;
			} else {
				self.currentPageNumber--;
			}

			if(self.pagesDOM[self.currentPageNumber-1]) {
				prePage.style.display = "block";
				prePage.className = self.pagesDOM[self.currentPageNumber-1].className;
			} else {
				prePage.className = "page chapterReview";
			}
			flipPage.innerHTML = currentPage.innerHTML;
			flipPage.className = currentPage.className;
			flipPage.removeChild(document.getElementById("pageModule"));

			currentPage.innerHTML = self.pagesDOM[self.currentPageNumber].innerHTML;
			currentPage.className = self.pagesDOM[self.currentPageNumber].className;

			postPage.style.display = "block";
			postPage.className = self.pagesDOM[self.currentPageNumber+1].className;

			self.swipeAngle = (self.swipeAngle-270);

			self.pageRotation = self.swipeAngle/self.rotationSensitivity/self.countFrames;

			if(self.domIsGenerated) {
				self.updateSwipeTimeDifference(0);
				self.backAction();
			} else {
				self.domIsGenerated = 1;
				self.flipPage.style[self.transformRule] = "none";
				self.flipPage.style.display = "none";
				self.togglePopup(0);
				compTia.uiSwitches.dontSwipe = 0;
			}
		}
			if(customScriptString = currentPage.getElementsByTagName("article")[0].getAttribute("customscript")) {
				window.eval(customScriptString);
				//Eval is evil, but it's nessesary here
			}
		self.currentBookPageNumber = self.getBookPageNumber();

		prePage.style.display = (self.currentBookPageNumber === 0) ? "none":"block";

		if(self.currentPage.className.indexOf(" poll") !== -1) {
			var pollChoice, whichPoll = (self.isChapterB()?self.currentChapter+"b":self.currentChapter.toString()),
				pollLiElms = self.currentPage.getElementsByClassName("pollQuestions")[0].getElementsByTagName("li");

			if (self.currentPage.className.indexOf("twoPolls") !== -1) {
					whichPoll += ".1";
			}

			pollChoice = self.features.pollTracking[whichPoll];
			if(pollChoice) {
				pollLis = pollLiElms[pollChoice-1];
				pollLis.innerHTML = "<span class='pollChoice'>"+pollLis.innerHTML+"</span>";
				pollLis.className = "selectedItem";
				if (typeof self.features.pollData["chapter"][whichPoll] === "number") {
					self.features.generatePoll(whichPoll);
				} else {
					$("#currentPage .blueSubmit").addClass("block").one(self.normalizedClick, function () {
						self.features.pollData["chapter"][whichPoll] = pollChoice;
						self.features.generatePoll(whichPoll);
					})
				}
			}

		}
		if(self.isChapterB()) {
			//B commands here
			self.chapterB_actions();
		} else {
			self.chapterA_actions();
		}
		$("figcaption, p, li, h1, h2, .smallHeadingOrangeBackDiagDashes,"+
			".soundByteContainContent, .bitsAndBytesBlue,"+
			".prePseudoLi" , "#currentPage").each(function(){
			clickAttr = typeof this.getAttribute("glossary") === "string" || this.getAttribute("onclick");
      		 this.tabIndex = ++n;
		})
		$("a,span","#currentPage").each(function(){
			clickAttr = typeof this.getAttribute("glossary") === "string" || this.getAttribute("onclick");
      		 if (clickAttr) {
       			this.tabIndex = ++n;
		       }
		})
	},
	getBookPageNumber: function () {
		 var self = this,
		 	 bookPageNumber = (self.bookPageNumber[self.currentChapter] || [])[self.currentPageNumber];

		 return (typeof bookPageNumber === "number" ? bookPageNumber : -1);
	},
	chapterB_actions: function () {
		var self = this,pageSlider = document.getElementById("pageSlider"),slideContain=pageSlider.getElementsByClassName("slides")[0];
		$(".slideB").addClass("block");
		$(".slideA").addClass("hideToggle");
		self.features.horzMenuValues.currentWidth = self.features.horzMenuValues.bWidth;
		slideContain.style.width = self.features.horzMenuValues.currentWidth+12+"px";
		self.features.horzMenuValues.slidesWidth = parseInt($(slideContain).css("width"))-parseInt($(self.contain).css("width"));
	},
	chapterA_actions: function () {
		var self = this,pageSlider = document.getElementById("pageSlider"),slideContain=pageSlider.getElementsByClassName("slides")[0];
		$(".slideB").removeClass("block");
		$(".slideA").removeClass("hideToggle");
		self.features.horzMenuValues.currentWidth = self.features.horzMenuValues.aWidth;
		slideContain.style.width = self.features.horzMenuValues.currentWidth+12+"px";
		self.features.horzMenuValues.slidesWidth = parseInt($(slideContain).css("width"))-parseInt($(self.contain).css("width"));
	},
	fowardAction: function () {
		var self = compTia,
			transformRule = self.transformRule;
		self.currentRotation += self.pageRotation;
		self.currentX += self.pageX+self.swipeSpeed;
		self.currentY += self.pageY;

		self.flipPage.style[transformRule] = 
				"rotate(" + self.currentRotation + "deg) translate("+self.currentX+"px, "+self.currentY+"px)";
		self.countFrames--;
		if (self.countFrames>0) {
			window.setTimeout(self.fowardAction, self.msFrameRate);
		} else {
			self.flipPage.style[transformRule] = "none";
			self.flipPage.style.display = "none";
			self.togglePopup(0);
			self.updateSwipeTimeDifference(1);
			self.uiSwitches.dontSwipe = 0;
			self.updateFrameRate();
		}
	},
	updateFrameRate: function () {
		this.adjustForTime(0.25, 30);

	},
	adjustForTime: function (length, fps, difference) { //full milliseconds
		var self = this,ratio,
			ms = length*1000,
			fps = (typeof fps === "number" && fps >= 2 && fps <= 60)? fps : 30,
			difference = difference || (self.swipeTimeSpread[1] - self.swipeTimeSpread[0] || 1),
			frames = fps*length, //30 frames per second divided by the fraction of a second
			frameRate = 33.3; //33.3 milliseconds per frame is about 30 FPS

		if (typeof ms === "number" && ms > 10) {
			if (ms > 333) {
				ms = 333;
			}
		} else {
			ms = 10;
		}

		ratio = (ms/difference).toFixed(3);

		self.msFrameRate = ~~(((frameRate/ratio)+self.msFrameRate)/2);

		self.frames = ~~(((frames*ratio)+self.frames)/2);

		if (self.msFrameRate > 100) {
			self.msFrameRate = 100;
		}
		self.pageX = self.translateX/self.frames;

		console.log("  Ratio of "+fps+" FPS: "+ ratio + "\n"+
					"Calculated Frames: "+ self.frames + "\n"+
					"  Milli per Frame: "+ self.msFrameRate + "\n"+
					"Frames Per Second: "+ (1000/ms)*self.frames) + "/"+fps;
	},
	updateSwipeTimeDifference: function (startEnd) {
		startEnd = (typeof startEnd === "number") ? startEnd : 0;
		this.swipeTimeSpread[startEnd] = (new Date()).getTime();
	},
	backAction: function () {
		var self = compTia,
		transformRule = self.transformRule;

		self.currentRotation -= self.pageRotation;
		self.currentX -= self.pageX+self.swipeSpeed;
		self.currentY += self.pageY;

		self.flipPage.style[transformRule] =
				"rotate(" + self.currentRotation + "deg) translate("+self.currentX+"px,"+self.currentY+"px)";
		self.countFrames--;
		if (self.countFrames>0) {
			window.setTimeout(compTia.backAction,self.msFrameRate);
		} else {
			self.flipPage.style[transformRule] = "";
			self.flipPage.style.display = "none";
			self.togglePopup(0);
			self.updateSwipeTimeDifference(1);
			self.uiSwitches.dontSwipe = 0;
			self.updateFrameRate();
		}
	},
	toggleHelpVideo: function (tog) {
		var self = this,helpVideo = document.getElementById("helpVideo");
		if (typeof tog !== "undefined") {
			self.toggleHelp = !!tog;
		} else {
			tog = (typeof self.toggleHelp !== "undefined")? !self.toggleHelp : 1;
			self.toggleHelp = tog;
		}
		if (tog) {

			self.search.toggleSearchBox(0);
			self.togglePopup(0)
			self.uiSwitches.dontSwipe = 1;
			self.popupEnabled = 1;
			$(self.hvFeature).fadeIn(170);
			helpVideo.load();
			helpVideo.play();
		} else {
			if(self.uiSwitches.highlighting) {
				self.features.removeHighlight()
			}
			self.uiSwitches.dontSwipe = 0;
			self.popupEnabled = 0;
			$(self.hvFeature).fadeOut(170);
			helpVideo.pause();
		}
	},
	togglePopup: function (page, index) {
		var self = this,elm,popup,popupElm,popupElmCS;



		if(!self.uiSwitches.highlighting) {
			$(".scroll, .arrowUp, .arrowDown","#features").css("display","none");

			$(".popup, #popupFeature, #popupImage","#features").fadeOut(170);
			if (page !== 0 && page !== undefined) {
				self.popupEnabled = 1;
				if (self.chapters[self.currentChapter].popup[page]) {
					popup = self.chapters[self.currentChapter].popup[page][index]; 
				} else {
					return 0;
				}
				popupElm = self[popup.distinction];

				popupElm.getElementsByClassName("contentHold")[0]
							.innerHTML = popup.sectionContent;
				popupElm.setAttribute("customscript",popup.customscript);
				popupElm.setAttribute("closescript",popup.closescript);
				
				self.search.toggleSearchBox(0);
				$(popupElm).fadeIn(170);
				self.uiSwitches.popup = popup.distinction;
				self.uiSwitches.dontSwipe = 1;

				if(popupElmCS = popupElm.getAttribute("customscript")) {
					window.eval(popupElmCS);
					//Eval is evil, but it's necessary here
				}
			} else {
				self.popupEnabled = 0;
				popupElm = self[self.uiSwitches.popup];
				
				if(popupElm && (popupElmCS = popupElm.getAttribute("closescript"))) {
					window.eval(popupElmCS);

				}
				self.uiSwitches.dontSwipe = 0;
			}
		}
	},
	additionalPopupContent: function (toggle) {
		var $popup = $("#"+this.uiSwitches.popup),$ad;
		if (toggle) {
			this.additionalPopup = 1;
		} else {
			this.additionalPopup = 0;
		}
		$(".additional",$popup)
			.css("display",(toggle?"block":"none"))
			.parent().find(".content").css("display",(toggle?"none":"block"));
		$ad = $popup.find(".ad");
		if ($ad.length && toggle) {
			$ad.css("display","none")[toggle-1].style.display = "block";
		}
	},
	switchChapter: function (chapterIndex) {
		var self = this;
		if (self.currentChapter != chapterIndex) {
			if (!self.uiSwitches.loaderInterval) {
				self.toggleLoader(1);
			}
			self.togglePopup(0);
			self.currentPageNumber = 0;
			self.search.toggleSearchBox(0);
			self.generatePages(chapterIndex);
			self.toggleLoader(0);
		}
	},
	generatePages: function (chapterIndex) {
		//this function generates all the pages from the xml data
		chapterIndex = chapterIndex || 0;
		var self = this,
			pages = [], o, n, m, pagesN, pagesNElements,
			popUp, popUpN, chapterPagesN, pagesLength,
			page0, page1, page2, isB, polls,
			countStartPage = 0,
			chapter,chapterLength,
			cell = "<div class=\"cell\"></div>",
			row = "<div class=\"row\"></div>",
			column = "<div class=\"column\"></div>",
			popCount = 0, popIter;

		if (!self.domIsGenerated) {
			chapterLength = self.chaptersLength;
			for (o=0;o<=chapterLength;o++) {
				chapter = self.chapters[o];
				self.chapterInfoHold[o] = {glossaryPage:0,glossaryPageB:0,chapterStartB:0};
				self.chapterInfoHold[o].glossaryPage = parseInt(chapter.glossaryPage);
				self.chapterInfoHold[o].glossaryPageB = parseInt(chapter.secondGlossaryPage);
				isB = 0;
				polls = 0;
				for(n = 0; chapterPagesN = chapter.pages[n]; n++) {
					//create each page

					pagesN = document.createElement("article");
					pagesN.setAttribute("distinction", chapterPagesN.distinction);
					pagesN.setAttribute("pageType", chapterPagesN.type);
					pagesN.setAttribute("pageNumber", chapterPagesN.pageNumber);
					pagesN.setAttribute("bookPageNumber", self.bookPageNumber[o][n]);
					pagesN.setAttribute("customscript", chapterPagesN.customscript || "(function(){})()");
					pagesN.setAttribute("closescript", chapterPagesN.closescript || "(function(){})()");
					if (chapterPagesN.distinction == "poll") {
						polls++;
						if (isB) {
							polls = 0;
							pagesN.setAttribute("distinction", chapterPagesN.distinction+" B");
						} else if (polls == 2) {
							pagesN.setAttribute("distinction", chapterPagesN.distinction+" twoPolls")
						}

					}

					if (chapterPagesN.distinction === "chapterStartB") {
						self.chapterInfoHold[o].chapterStartB = parseInt(chapterPagesN.pageNumber);
						isB=1;
					}

					switch(chapterPagesN.type) {
						case "RowRow":
							pagesN.innerHTML += row + row;
							pagesN.getElementsByClassName("row")[0].innerHTML = chapterPagesN.sectionContent[0].replace(/src=/g,"tempsrc=");
							pagesN.getElementsByClassName("row")[1].innerHTML = chapterPagesN.sectionContent[1].replace(/src=/g,"tempsrc=");
							break;
						case "CellCellRow":
							pagesN.innerHTML += cell + cell + row;
							(pagesNElements = pagesN.getElementsByClassName("cell"))[0]
											 .innerHTML = "<div class=\"innerCellTL\">"+chapterPagesN.sectionContent[0].replace(/src=/g,"tempsrc=")+"</div>";
							pagesNElements[1].innerHTML = "<div class=\"innerCellTR\">"+chapterPagesN.sectionContent[1].replace(/src=/g,"tempsrc=")+"</div>";
							pagesN.getElementsByClassName("row")[0].innerHTML = chapterPagesN.sectionContent[2].replace(/src=/g,"tempsrc=");
							
							break;
						case "RowCellCell":
							pagesN.innerHTML += row + cell + cell;
							pagesN.getElementsByClassName("row")[0].innerHTML = chapterPagesN.sectionContent[0].replace(/src=/g,"tempsrc=");
							(pagesNElements = pagesN.getElementsByClassName("cell"))[0]
											 .innerHTML = "<div class=\"innerCellBL\">"+chapterPagesN.sectionContent[1].replace(/src=/g,"tempsrc=")+"</div>";
							pagesNElements[1].innerHTML = "<div class=\"innerCellBR\">"+chapterPagesN.sectionContent[2].replace(/src=/g,"tempsrc=")+"</div>";
							
							break;
						case "ColumnColumn":
							pagesN.innerHTML += column + column;
							(pagesNElements = pagesN.getElementsByClassName("column"))[0]
											 .innerHTML = "<div class=\"innerColLeft\">"+chapterPagesN.sectionContent[0].replace(/src=/g,"tempsrc=")+"</div>";
							pagesNElements[1].innerHTML = "<div class=\"innerColRight\">"+chapterPagesN.sectionContent[1].replace(/src=/g,"tempsrc=")+"</div>";
							
							break;
						case "ColumnCellCell":
							pagesN.innerHTML += column + cell + cell;
							pagesN.getElementsByClassName("column")[0].innerHTML =
											 "<div class=\"innerColLeft\">"+chapter.pages[n].sectionContent[0].replace(/src=/g,"tempsrc=")+"</div>";
							(pagesNElements = pagesN.getElementsByClassName("cell"))[0]
											 .innerHTML = "<div class=\"innerCellTR\">"+chapterPagesN.sectionContent[1].replace(/src=/g,"tempsrc=")+"</div>";
							pagesNElements[1].innerHTML = "<div class=\"innerCellBR\">"+chapterPagesN.sectionContent[2].replace(/src=/g,"tempsrc=")+"</div>";
							
							break;
						case "CellCellColumn":
							column = "<div class=\"column\" style=\"float:right\"></div>";
							//even though column is the third cell, it's appended first for proper floating
							pagesN.innerHTML += column + cell + cell;
							(pagesNElements = pagesN.getElementsByClassName("cell"))[0]
											 .innerHTML = "<div class=\"innerCellTL\">"+chapterPagesN.sectionContent[0].replace(/src=/g,"tempsrc=")+"</div>";
							pagesNElements[1].innerHTML = "<div class=\"innerCellBL\">"+chapterPagesN.sectionContent[1].replace(/src=/g,"tempsrc=")+"</div>";
							pagesN.getElementsByClassName("column")[0].innerHTML =
							 				"<div class=\"innerColLeft\">"+chapterPagesN.sectionContent[2].replace(/src=/g,"tempsrc=")+"</div>";
							
							break;
						case "CellCellCellCell":
							pagesN.innerHTML += cell + cell + cell + cell;
							(pagesNElements = pagesN.getElementsByClassName("cell"))[0]
											 .innerHTML = "<div class=\"innerCellTL\">"+chapterPagesN.sectionContent[0].replace(/src=/g,"tempsrc=")+"</div>";
							pagesNElements[1].innerHTML = "<div class=\"innerCellTR\">"+chapterPagesN.sectionContent[1].replace(/src=/g,"tempsrc=")+"</div>";
							pagesNElements[2].innerHTML = "<div class=\"innerCellBL\">"+chapterPagesN.sectionContent[2].replace(/src=/g,"tempsrc=")+"</div>";
							pagesNElements[3].innerHTML = "<div class=\"innerCellBR\">"+chapterPagesN.sectionContent[3].replace(/src=/g,"tempsrc=")+"</div>";
							break;
						default:
							pagesN.innerHTML = "<div class=\"full\">"+chapterPagesN.sectionContent.replace(/src=/g,"tempsrc=")+"</div>";
					}
					pages.push(pagesN);
				}
				pagesLength = pages.length;
				self.pagesDOM = [];

				for (m = 0; m < pagesLength; m++) {
					self.pagesDOM[m] = document.createElement("div");
					self.pagesDOM[m].className = "page " + pages[m].getAttribute("distinction");
					self.pagesDOM[m].appendChild(pages[m]);
					if (location.search.indexOf("devpage=1") !== -1) {
						self.pagesDOM[m].innerHTML += "<footer>" + pages[m].getAttribute("pageNumber") + "</footer>";
					} else {
						self.pagesDOM[m].innerHTML += "<footer>" + self.bookPageNumber[o][m]+ "</footer>";
					}
					self.pagesDOM[m].innerHTML = "<div id='pageModule'></div>"+self.pagesDOM[m].innerHTML;
				}
				pages = [];
				self.allPagesDOM[o] = self.pagesDOM.slice();
			}
		}
		m=10;
		self.currentChapter = chapterIndex;
		self.pagesDOM = self.allPagesDOM[chapterIndex];

		$(self.pagesDOM).each(function(){
	        this.innerHTML = this.innerHTML.replace(/tempsrc=/g,"src=");
	        if (this.tagName === "A" || this.getAttribute("onclick")) {
	        	this.setAttribute("tabindex", m);
	        }
		})

		self.chapterGlossaryPage = self.chapterInfoHold[chapterIndex].glossaryPage;
		self.chapterBGlossaryPage = self.chapterInfoHold[chapterIndex].glossaryPageB || 0;
		self.startChapterB = self.chapterInfoHold[chapterIndex].chapterStartB;

		if (self.currentPageNumber === 0) {
			self.prePage.className = "page chapterReview";
			self.prePage.style.display = (self.currentBookPageNumber === 0) ? "none" : "block";

			self.currentPage.innerHTML = self.pagesDOM[0].innerHTML.replace(/tempsrc=/g,"src=");
			self.currentPage.className = self.pagesDOM[0].className;

			self.postPage.className = self.pagesDOM[1].className;
		}		
		self.search.refreshSearchContent();
		self.features.horzNavigation();
	},
	postInit: function () {
		var self = this,chapter,page,popup,
			bookpage = self.urlValues.bookpage && self.urlValues.bookpage.length ? parseInt(self.urlValues.bookpage):"",
			popup = typeof self.urlValues.popup == "string" ? parseInt(self.urlValues.popup):"";

		self.sessionEmail = self.urlValues.email || self.sessionEmail;
		if (self.urlValues.chapter) {
			var chapter = self.urlValues.chapter.length ? parseInt(self.urlValues.chapter):"",
				page = self.urlValues.page && self.urlValues.page.length ? parseInt(self.urlValues.page): 0;

		} else if (typeof bookpage === "number") {
			self.generatePages(self.chapterByPage[bookpage]);
			self.switchPage(1,bookpage-self.bookPageNumberReference[self.chapterByPage[bookpage]].first)
			if (typeof popup === "number") {
				window.setTimeout(
				//delay so that the pages have time to load before a popup shows
				 	function () {
				 		self.togglePopup(bookpage-self.bookPageNumberReference[self.chapterByPage[bookpage]].first,popup)
				 	}, 400);
			}
		}

		
		if (typeof chapter === "number") {
			self.generatePages(chapter);
			if (self.pagesDOM.length > 1) {
				self.switchPage(1,page);
			}
			if (typeof popup === "number") {
				window.setTimeout( function () {self.togglePopup(page,popup) }, 700);
			}
		} else if (typeof bookpage !== "number") {
			self.generatePages(self.currentChapter);
			self.domIsGenerated = 1;
		}

		self.search.refreshSearchContent();
		if (typeof self.urlValues.help === "string") {
			self.toggleHelpVideo();
		}
		//self.loadChapter();
	},
	loadChapter: function () {
		var self = this,loaderElm = self.currentPage.getElementsByClassName("loader")[0];

			/*$(self.pagesDOM).find("figure, img").each(function () {
				if (loaderElm) {
					loaderElm.innerHTML += this.outerHTML;
				}
			});*/
	},
	toggleWidescreenMode: function (tog) {
		if (tog == 1) {
			this.contain.style.width = "100%";
			this.contain.style.maxWidth = "1140px";
			document.body.style.padding = "0 10px";
		} else if (tog == 2) {
			this.contain.style.width = "100%";
			this.contain.style.maxWidth = "2048px";
			document.body.style.padding = "0 10px";
		} else {
			this.contain.style.maxWidth = "1140px"
			this.contain.style.width = "1024px";
			document.body.style.padding = "0";
		}
		
	},
	clearSelection: function () {
		var sel = window.getSelection ? window.getSelection() : document.selection;
		if (sel) {
		    if (sel.removeAllRanges) {
		        sel.removeAllRanges();
		    } else if (sel.empty) {
		        sel.empty();
		    }
		}
	},
	switchBookPage: function (page) {
		var self = this, chapter, devPage;
		if (typeof page === "number") {
			chapter = self.chapterByPage[page];
			devPage = page-self.bookPageNumberReference[self.chapterByPage[page]].first;
			self.moveTo(chapter,devPage);
		}
	},
	shiftPageSlider: function () {
		var self = this,
			sliderElm = self.sliderElm,$liNodes,
			closedHeight = 156, speed = closedHeight/10,
			shiftStep = function () {
				if (!self.slideup) {
					if (self.clipVals[1]<closedHeight) {
						self.clipVals[1] += speed;
						sliderElm.style.clip = self.clipVals.join("");
						window.setTimeout(shiftStep,self.msFrameRate)
					} else {
						self.clipVals[1] = closedHeight;
						sliderElm.style.display = "none";
					}
				} else if (self.clipVals[1] > speed) {
					self.clipVals[1] -= speed;
					sliderElm.style.clip = self.clipVals.join("");
					window.setTimeout(shiftStep,self.msFrameRate)
				} else {
					self.clipVals[1] = 0;
					sliderElm.style.clip = "auto";
				}
			}
		shiftStep();
	},
	initGlossary: function (elmThis) {
		//make every glossary word click to a glossary box
		var wordToUse = (elmThis.getAttribute("glossary") || elmThis.textContent || elmThis.innerHTML).toLowerCase(),termExist;
		if (!self.uiSwitches.highlighting) {
			termExist = self.features.glossary(wordToUse);
		}
		if (termExist === 0) {
			//if glossary doesn't exist, strike it
			elmThis.style.textDecoration = "line-through";
		}
	},
	events: function () {
		var self = this, thisCache,
			swipe = new swipeIt(),
			slides = document.getElementById("pageSlider"), slideAni = 0,
			$slides = $(slides),$liNodes,span, $resultSections,$searchActive,
			$topUls = self.$topUls, sectionHold, sectionLength, lastSection,
			rollSelector = "#currentPage .overlayButtons div[roll],"
						 + "#popupFeature .overlayButtons div[roll]",
			liIndex = 0;

		swipe.leftAction =	function () {
			if (!self.uiSwitches.dontSwipe) {
				self.swipeAngle = this.swipeAngle;
				self.swipeSpeed = Math.abs(this.startX-this.curX)/10;
				self.switchPage(1);
			}
		}
		swipe.rightAction =	function () {
			if (!self.uiSwitches.dontSwipe) {
				self.swipeAngle = this.swipeAngle;
				self.swipeSpeed = Math.abs(this.startX-this.curX)/10;
				self.switchPage(0);
			}
		}


		$("#layout .arrowLeft").on(self.normalizedClick,
		 function(e) {
		 	e.preventDefault();
			if (!self.uiSwitches.dontSwipe) {
				self.swipeAngle = 180;
				self.swipeSpeed = 10;
				self.switchPage(0);
			}
		})
		$("#layout .arrowRight").on(self.normalizedClick,
		 function(e) {
		 	e.preventDefault();
			if (!self.uiSwitches.dontSwipe) {
				self.swipeAngle = 0;
				self.swipeSpeed = 10;
				self.switchPage(1);
			}
		})
		$("#keyboardFigure .overlays div").on("mouseleave",
			function(e) {
				self.features.keyboardFigure(0);
			}
		);
		
		$("#layout .bottomLeftNav").on(self.normalizedClick, function () {
			self.sliderElm.style.display = "block";
			if(!self.slideup) {
				self.slideup = 1;
			} else {
				self.slideup = 0;
			}
			self.shiftPageSlider();
		});
		swipe.init(document.getElementById("pages"),20);
		
		self.$document
			.on("keydown", function (e) {
				if (!self.uiSwitches.dontSwipe && (document.activeElement == null || document.activeElement.id != "ebookSearch")) {
					if (!self.popupEnabled) {
						if (e.which === 39) {
							/*self.features.removeHighlight();*/
							self.swipeAngle = 0;
							self.swipeSpeed = 10;
							self.switchPage(1);
						} else if (e.which === 37) {
							/*self.features.removeHighlight();*/
							self.swipeAngle = 180;
							self.swipeSpeed = 10;
							self.switchPage(0);
						}
					}
				}
				if (e.which === 36) {
					self.codeEnabled = 1;
				}
				if (e.which === 27) {
					self.features.glossary();
					self.togglePopup(0);
				}
			})
			.on("keyup", function (e) {
				if (e.which === 36) {
					self.codeEnabled = 0;
				} else if (e.which === 87) {
					if (self.codeEnabled) {
						self.toggleWidescreenMode(1)
					}
				} else if (self.codeEnabled && (e.which === 96 || e.which === 48)) {
					self.generatePages(0);
				} else if (e.which === 13 && !self.popupEnabled) {
					thisCache = document.activeElement;
					if (thisCache.getAttribute("onclick")) {
						eval(thisCache.getAttribute("onclick"));
					} else if (typeof thisCache.getAttribute("glossary") === "string") {
						self.initGlossary(thisCache)
					}
				}
			})
			.on(self.supportTouch?"touchstart":"mouseover", "div.linkBar a.hovMenu", function () {
				var popUpUl = this.parentNode.getElementsByClassName("innerUl")[0];
				if (popUpUl.className.indexOf("hideToggle") !== -1) {
					$topUls.not(this).addClass("hideToggle");

					$(popUpUl).removeClass("hideToggle").one("mouseleave", function () {
						this.className += " hideToggle";
					})
					
				} else {
					$topUls.addClass("hideToggle")
				}
			})
			.on(self.normalizedClick, "span[glossary]", function () {
					self.initGlossary(this);
				})
			.on(self.normalizedClick, ".lbDownArrowBL,.sLbDownArrowBL,.slideNextWhite,.slideNext, .lDownArrow", function () {
					//this event handles fadeIn tables
					//when <span col="1" class="slideNext">NEXT</span> is clicked
					//a <div> with the same [col] attribute will appear

					var $tableCols = $("table div[col='"+this.getAttribute("col")+"']"),
						buttonDisplayStyle = $(this).css("display");

					$tableCols.fadeIn();
					$(this).fadeOut(200, function (){
						this.style.visibility = "hidden";
						this.style.display = buttonDisplayStyle;
					});
				})
			.on(self.normalizedClick, "#pageModule .moduleClose", function () {
					//handle closing the module
					self.modules.toggleModule(0)
				})
			.on(self.normalizedClick, "#popupFeature .reloadVideo", function () {
					var videoElm = document.getElementById("popupFeature")
					   .getElementsByTagName("video")[0];

					videoElm.load();
				})
			.on(self.normalizedClick, "#features .close", function () {
				//handle closing the popups, if there is additional content shown, close the content first

					if (self.additionalPopup) {
						self.additionalPopupContent(0);
					} else {
						self.togglePopup(0);
						self.toggleHelp = 0; //prevent unrepsonsive help button 
						$("video").each(function(){this.pause()})
						return false;
					}
				})
			.on("dragstart","img", function(e) {
				//prevent the user from dragging <img> elements, the default action in browsers
				e.preventDefault()})

			.on(self.normalizedClick, "#sectionArrows .icon", function () {
				if (slideAni) {
					return false;
				}
				slideAni = 1;
				$resultSections = $("#searchBox .resultsSection");
				sectionLength = $resultSections.length;
				$searchActive = $("#searchBox .active");

				if (this.className.indexOf("backSearchPage") === -1) {
					self.searchResultsSection++;
					$resultSections.css("float","right");
					$searchActive.css("float","left");
					if(self.searchResultsSection === sectionLength) {
						self.searchResultsSection = 0;
					}
				} else {
					self.searchResultsSection--;
					$resultSections.css("float","left");
					$searchActive.css("float","right");
					if(self.searchResultsSection < 0) {
						self.searchResultsSection = sectionLength-1;
					}
				}
				$("#searchBox [sect='"+self.searchResultsSection+"']")
					.removeClass("hideToggle").addClass("active").animate({
						width:"165px"
						},600);
				$searchActive.removeClass("active").animate({
					width:"0px"
				},600,function(){this.className +=" hideToggle", slideAni = 0;});

				$searchActive = $("#searchBox .active");

			})
			.on(self.normalizedClick, rollSelector , function () {
				$("#currentPage .overlayImages, #popupFeature .overlayImages")
					//this event handles rollovers
					//when <span col="1" class="slideNext">NEXT</span> is clicked
					//a <div> with the same [col] attribute will appear

					.find("div[roll='"+this.getAttribute("roll")+"']")
						.fadeIn(100);
				})
			.on("mouseup touchend", function() {
				
				$(document).off("mousemove touchmove",".contain");
			})
			.on(self.normalizedClick, "#notesFeature .doneEdit", function () {
				$("#notesFeature li textarea").each(function() {
					$(this).replaceWith("<p>"+this.value+"</p>")
				})
			})
			.on(self.normalizedClick, "#currentPage ol.pollQuestions li", function () {
				var pollChapter = self.currentChapter + (self.isChapterB()?"b":""),spans;
				if (self.currentPage.className.indexOf("twoPolls") !== -1) {
					pollChapter += ".1";
				}
				$liNodes = $("#currentPage ol.pollQuestions li");

				if (typeof self.features.pollData.chapter[pollChapter] !== "number") {
					$liNodes.removeClass("selectedItem");
					this.className = "selectedItem";
					$liNodes.each(function () {
						thisCache = this;
						span = thisCache.getElementsByClassName("pollChoice")[0];
						if (span){
							span.parentNode.innerHTML = span.innerHTML;
						}
					})
					liIndex = $liNodes.index(this);
					this.innerHTML = "<span class='pollChoice'>"+this.innerHTML+"</span>";
					self.features.pollTracking[pollChapter] = liIndex+1;

					$("#currentPage .blueSubmit").addClass("block").one(self.normalizedClick, function () {
					self.features.pollData["chapter"][pollChapter] = liIndex;
						self.features.postPoll(pollChapter, liIndex);
						self.features.generatePoll(pollChapter);
						this.className = this.className.replace(" block","");

					})
				}
				
			});

			$("#notesFeature .smallWhiteX")
				.on(self.normalizedClick, function () {
					self.features.toggleNotes(0,1);
			});
			$("#notesFeature .plus")
				.on(self.normalizedClick, function () {
					self.features.toggleLog();
			});

		window.onorientationchange = function(){
			var orientation = window.orientation,
				portraitMode = document.getElementById("portraitMode");

			if (Math.abs(orientation) === 90){
				portraitMode.style.display="none";
				self.contain.style.visibility = "visible";
		    } else {
		    	portraitMode.style.display="block";
		    	self.contain.style.visibility = "hidden";
		    }

		}
	}
}
var self = compTia;
