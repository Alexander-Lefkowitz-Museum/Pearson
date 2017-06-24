"use strict";
compTia.features = {
	notesData:{
		chapter:[],
		logs:[]
	},
	pollData: {
		"chapter": {
			"1.0": null,"1.1": null,"2.0": null,"2.1": null,"3.0": null,"3.1": null,"3b": null,"4.0": null,"4.1": null,
			"5.0": null,"5.1": null,"5b": null,"6.0": null,"6.1": null,"7": null,"7.1": null, "7b": null,
			"8.0": null,"8.1": null,"9.0": null,"9.1": null,"9b": null,"10.0": null,"10.1": null,"11.0": null,
			"11.1": null,"12.0": null,"12.1": null,"13.0": null,"13.1": null
		}
	},
	pollTracking:{"1":0,"1.1":0,"2":0,"2.1":0,
				  "3":0,"3b":0,"4":0,"5":0,
				  "3.1":0,"4.1":0,"5.1":0,
				  "5b":0,"6":0,"7":0,"7.1":0,"6.1":0,
				  "7b":0,"8":0,"9":0,"9b":0,"8.1":0,"9.1":0,
				  "10":0,"10.1":0,"11":0,"12":0,"13":0,
				  "11.1":0,"12.1":0,"13.1":0},
	pollStats: {},
	horzMenuValues:{},
	postPoll: function (pollChapter, choice) {
		var self = this;
		if (pollChapter.indexOf("b") === -1 && pollChapter.indexOf(".") === -1) {
			pollChapter += ".0";
		}
		$.ajax({
			cache:false,
			type:"POST",
			async:false,
			dataType:"text",
			url:"_dist/API/pollUpdate.php",
			data: 'pollData={"pollData":{"chapter":{"'+pollChapter+'":'+choice+'}}}'
		}).done(function () {
			self.getPoll(pollChapter);
		})
	},
	getPoll: function (pollChapter) {
		var results = [], self = this;
		pollChapter = pollChapter.toLowerCase();
		$.ajax({
			cache:false,
			type:"GET",
			async:false,
			dataType:"text",
			url:"_dist/API/polls/"+pollChapter.toUpperCase()+".json"
		}).done(function (e) {
			pollChapter = pollChapter.replace(".0","");
			self.pollStats[pollChapter] = eval(e);
		})
	},
	generatePoll: function (whichPoll) { 
		var self = this, root = self.root,
			chartElm, bars = 4, n=0,
			seriesData = [];
			window.ee = whichPoll;
			$("#currentPage ol.pollQuestions li").each(function() {
				seriesData.push(
					{
	               		name: $(this).contents().text(),
	               		data: [self.pollStats[whichPoll.toString()][n]]
	            	})
				n++;
			});
			n=0;
		$("#currentPage img[src$='pollFPO.png']").replaceWith("<div id='graph'></div>");
	     $('#graph').highcharts({
	            chart: {
	                type: 'column'
	            },
	            title: {
	                text: ''
	            },
	            xAxis: {
	                categories: ['Poll Results']
	            },
	            yAxis: {
	                min: 0,
	                title: {
	                    text: 'Users'
	                },
	                allowDecimals:false
	            },
	            tooltip: {
	                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
	                pointFormat: '<tr><td style="color:{series.color};padding:0">●: </td>' +
	                    '<td style="padding:0"><b>{point.y} users</b></td></tr>',
	                footerFormat: '</table>',
	                shared: true,
	                useHTML: true
	            },
	            legend: {
           		    borderWidth: 1,
           		    useHTML:true,
           		    labelFormatter:function(){
           		       return ++n;
           		    }
           		},
	            plotOptions: {
	                column: {
	                    pointPadding: 0.2,
	                    pointWidth: 40,
	                    borderWidth: 0
	                }
	            },
	            series: seriesData
	        });


	},
	getNotes: function () {
		var self = this, root = self.root;
		$.ajax({
			cache:false,
			async:false,
			dataType:"text",
			url:"comptia/_dist/API/note.json"
		}).done(function(e){
			window.jsonNotesString = "{"+e+"}";
		})

		self.notesData = JSON.parse(jsonNotesString).notesData;
	},
	generateNotes: function() {
		var self = this, root = self.root, n, nn, nnn,
			chapter, page, noteIndices, noteInfo, noteText,
			editEntryElm = 
				"<div class='editComment'>" +
					"<span class='icon notesPen'> </span> " +
					"<span class='icon notesMag'> </span> " +
					"<span class='icon notesCheck hideToggle'> </span> " +
					"<span class='icon notesCancel hideToggle'> </span> " +
					"<span class='icon notesTrash'> </span> " +
				"</div>";

		root.notesOL.innerHTML="";
		self.getNotes();
		for (n = self.notesData.chapter.length-1; (n+1); n--) {
			if (!self.notesData.chapter[n]) {
				continue;
			}
			for(nn = self.notesData.chapter[n].page.length-1; (nn+1); nn--) {
				if (!self.notesData.chapter[n].page[nn]) {
					continue;
				}
				nnn = self.notesData.chapter[n].page[nn].index.length;
				while(nnn--) {
					root.notesOL.innerHTML =
						"<li><div><p>" + self.notesData.chapter[n].page[nn].index[nnn].note +
						"</p>"+editEntryElm +
						"<span chapter='" +n+"' page='"+nn+"' "+
						"class='time'>"+self.notesData.chapter[n].page[nn].index[nnn].noteInfo.replace(/---/g,"•")+
						"</span><div class='deleteWarning'>Are you sure you want to delete this note?"+
						"<br><a class='yes'>YES</a> <a class='no'>NO</a></div></div></li>"+root.notesOL.innerHTML;
				} 
			} 
		}
	},
	postNotes: function (tog) {
		var self = this, root = self.root,
			noteNodes, nodePage, nodeChapter, noteIndices,
			logNodes, nodePageNumber, nodeChaperNumber, messageIcon = $(".icon.message")[0],
			$emailSections = $("section",root.popupEmail), $sendEmailEvent = $("a",root.popupEmail),
			sendEmailMessage = function (msg) {
				$emailSections
					.slideUp("fast")
					.eq(2-msg).slideDown("fast",
						function () {
							root.toggleLoader(0);
							setTimeout(function(){
								$emailSections.slideUp("fast");
								$emailSections.eq(0).slideDown("fast");
								if(msg) {
									self.postNotes(1);
								}
							},3000);
				})
			},
			ajaxPostNotes = function () {
				$.ajax({
					cache:false,
					type:"POST",
					async:false,
					dataType:"text",
					url:"http://staging.allthingsmedia.com/pearson/comptia/_dist/API/send_note.php",
					data:'notesData='+('{"email":"'+ root.sessionEmail +
									   '","notesData":'+JSON.stringify(self.notesData))+"}",
					error: function () {
						sendEmailMessage(0);
					}
				}).done(function (e) {
					root.toggleLoader(0);
					sendEmailMessage(1);
				})
			},
			checkEmail = function () {
				root.toggleLoader(1);
				if (root.inputEmail.value.length > 8 && root.inputEmail.value.split("@").length === 2) {
					root.sessionEmail = root.inputEmail.value.trim();
					ajaxPostNotes();
				} else {
					sendEmailMessage(0);
				}
			};

		if(tog === 0 || !self.emailToggle) {
			self.emailToggle = true;
			messageIcon.style.opacity = "0.4";
			$(root.popupEmail).slideDown("fast");
		} else {
			self.emailToggle = false;
			messageIcon.style.opacity = "1";
			$(root.popupEmail).slideUp("fast");
			$sendEmailEvent.off(root.normalizedClick);
			$(root.inputEmail).off("keypress");
			return 0;
		}

		$(root.inputEmail).off("keypress").on("keypress", function (e) {
			if(e.keyCode === 13) {
				checkEmail();
			}
		})
		$sendEmailEvent.off(root.normalizedClick).on(root.normalizedClick, function(){
			checkEmail();
		});
		
		self.notesData = {chapter:[],logs:[]};		
		$("#notesContent>li>div").each(
			function() {
				noteNodes = this.childNodes;
				if (noteNodes[0].tagName === "P"
					&& (nodePageNumber = ~~noteNodes[2].getAttribute("page"))
					&& (nodeChaperNumber = ~~noteNodes[2].getAttribute("chapter"))) {

					if (typeof (nodeChapter = self.notesData.chapter[nodeChaperNumber]) !== "object"){
						nodeChapter = {page:[]}
						nodeChapter.page[nodePageNumber] = {index:[
									{note:noteNodes[0].innerHTML,
									 noteInfo:noteNodes[2].innerHTML.replace(/•/g,"-")}
								]}
					} else {
						if (typeof (nodeChapter.page[nodePageNumber] || {}).index !== "object") {
							nodeChapter.page[nodePageNumber] = {index:[
																{note:noteNodes[0].innerHTML,
																 noteInfo:noteNodes[2].innerHTML.replace(/•/g,"-")}]};

						} else  {
							nodeChapter.page[nodePageNumber].index.push({note:noteNodes[0].innerHTML,
																		 noteInfo:noteNodes[2].innerHTML.replace(/•/g,"-")});
						}
					}

					self.notesData.chapter[nodeChaperNumber] = nodeChapter;
				}
		});
		
		

	},
	notesButtonEvents: function (enable) {
		var self = this, root = self.root, $this,$buttonsContain,
			$document = root.$document, o = 0, 
			notesContent = document.getElementById("notesContent"),
			noteText,$noteText,timeElm,attChapter,attPage,
			$selectWrap = $("#filter .selectWrap select"),
			selectWrap = $selectWrap[0];

		if (enable) {
			//starts all events related to notes including all the buttons for every note item
			$document
				.on(root.normalizedClick,"#notesContent .notesPen", function () {
					$this = $(this);
					$buttonsContain = $this.parent();
					$noteText = $this.parent().parent().find("p");
					noteText = $noteText[0];

					$buttonsContain.find(".icon").toggleClass("hideToggle");
					$buttonsContain.find(".icon.notesTrash").removeClass("hideToggle");
					$noteText.replaceWith("<textarea savedNote='"+noteText.innerHTML+"'>"+
							noteText.innerHTML+"</textarea>");
					
				})
				.on(root.normalizedClick,"#notesContent .notesCheck", function () {
					$this = $(this);
					$noteText = $this.parent().parent().find("textarea");
					noteText = $noteText[0];
					
					$noteText.replaceWith("<p>"+noteText.value+"</p>");
					$this.parent().find(".icon").toggleClass("hideToggle");
					$this.parent().find(".notesTrash").removeClass("hideToggle")
				})
				.on(root.normalizedClick,"#notesContent .notesCancel", function () {
					$this = $(this);
					$noteText = $this.parent().parent().find("textarea"),
					noteText = $noteText[0];
					
					$noteText.replaceWith("<p>"+noteText.getAttribute("savedNote")+"</p>");
					$this.parent().find(".icon").toggleClass("hideToggle");
					$this.parent().find(".notesTrash").removeClass("hideToggle");
				})
				.on(root.normalizedClick,"#notesContent .notesMag", function () {
					//goto the page once the magnifying glas is clicked
					root.toggleLoader(1);
					$this = $(this);
					window.setTimeout(function () {
						timeElm = $this.parent().parent().parent().find(".time")[0];
						attPage = timeElm.getAttribute("page");
						root.switchBookPage(~~attPage);
						root.toggleLoader(0);
					},200);
				})
				.on(root.normalizedClick,"#notesFeature .notesTrash", function () {
					this.parentNode.parentNode
						.getElementsByClassName("deleteWarning")[0].style.display = "block";
					
				})
				.on(root.normalizedClick,"#notesFeature .yes", function () {
					if ( ($this = $(this).parent().parent().parent())
						 	.parent()[0].getElementsByTagName("li").length > 1) {
						$this.remove();
					} else {
						//if no notes, add a message
						if (root.noteLog) {
							$this.replaceWith("<li id='noLogs'><div>You have no logs</div></li>");
						} else {
							$this.replaceWith("<li id='noNotes'><div>You have no notes</div></li>");
						}
					}
				})
				.on(root.normalizedClick,"#notesFeature .no", function () {
					//if you click no in the delete menu, remove the display:block style to rehide the message
					this.parentNode.setAttribute("style","");
				});

		} else {
			//remove all button events
			$document.off(root.normalizedClick,"#notesContent .notesPen");
			$document.off(root.normalizedClick,"#notesFeature .notesTrash");
			$document.off(root.normalizedClick,"#notesContent .notesMag");
			$document.off(root.normalizedClick,"#notesContent .notesCheck");
			$document.off(root.normalizedClick,"#notesContent .notesCancel");
			$document.off(root.normalizedClick,"#notesFeature .yes");
			$document.off(root.normalizedClick,"#notesFeature .no");
		}
		self.notesFilter(enable);
	},
	notesFilter: function (enable) {
		var self = this, root = self.root, $this,n,nn,o = 0,
			$document = root.$document, chapterString,
			notesContent = document.getElementById("notesContent"),
			$selectWrap = $("#filter .selectWrap select"), selectWrap,
			$notesLi = $("#notesContent li"),$selectHold,
			$pageInput = $("#filter input[name=pageInput]"),searchNotes,
			pageNumber=99,pageNumbers=[],chapterNumber=99, //99 is used as sort of a disable flag
			numberHold=[],numberHold0,numberHold1,
			chaptersLength = root.chaptersLength,contentHeight,pageNumberLength;

		if (enable) {
			selectWrap = $selectWrap[0];

			notesContent.style.maxHeight = "480px";
			$("#filter").slideDown(150);
			self.filterHeight = 37;
			//o=1 because we want to skip chapter 0
			for(o=1;o<chaptersLength;o++) {
				selectWrap.innerHTML += "<option>"+o+"</option>";
				
			}
			selectWrap.selectedIndex = self.dropDownValue || 0;

			//private function so scope can be shared
			searchNotes = function (pageParam, chapterParam) {
				$notesLi = $("#notesContent li");
				pageNumbers=[];
				contentHeight = $(notesContent).height();
				//since sorting notes hides and shows many elements the note component height will change
				//in response, contentHeight is a pre-change height

				chapterNumber = chapterParam || chapterNumber;

				if (chapterNumber !== 0 && chapterNumber !== 99) {
					chapterString = "[chapter="+chapterNumber+"]"
				} else {
					chapterString = "[chapter]";
				}

				if(pageParam) {
					pageNumber = pageParam.replace(/ /g,"").split(",");
					//cleans up user input an splits search requests
					for(n=0, pageNumberLength = pageNumber.length;
							n<pageNumberLength; n++) {

						if(pageNumber[n].indexOf("-")+1) {
							numberHold = pageNumber[n].split("-").slice(0,2);
							numberHold0 = ~~numberHold[0];//starting page
							numberHold1 = ~~numberHold[1];//ending page
							if (numberHold0<numberHold1) {
								for (nn=numberHold0; nn<=numberHold1; nn++) {
									pageNumbers.push(nn)//add all pages from start to ending page
								}
							}
						} else {
							pageNumbers.push(~~pageNumber[n])
							//if no page range, just add the number that's inputted, since it's
							//been split it's an array
						}
					}
					pageNumbers = " "+ pageNumbers.filter(function(elem, pos) {//remove duplicates
					    return pageNumbers.indexOf(elem) == pos;
					}).join(" ") + " ";

					$notesLi
						.addClass("liHide")
						.find("div>span.time"+chapterString)
						.filter(function () {
							return (pageNumbers.indexOf(" "+this.getAttribute("page")+" ")+1);
						}).parent().parent().removeClass("liHide");
				} else {
					pageNumber = 99;
					$notesLi
						.addClass("liHide")
						.find("div>span.time"+chapterString)
						.parent().parent().removeClass("liHide");
				}
				notesContent.style.height = contentHeight+"px";
				//reset the height to the height before the changes
			}
			
			$selectWrap.on("change", function (e) {
				//handles chapter drop down selection
				contentHeight = $(notesContent).height();
				self.dropDownValue = this.selectedIndex;
				searchNotes($pageInput[0].value, this.selectedIndex|| 99);
				notesContent.style.height = contentHeight+"px";
				//reset the height to the height before the changes				
			});
			
			$pageInput.on("keypress", function (e) {
				if(e.keyCode == 13) {
					if (typeof e === "undefined" || !!this.value) {
						searchNotes(this.value);

					} else if (!this.value) {
						searchNotes();
					}
				}
			});

		} else {
			self.filterHeight = 0;		
			$("#filter").slideUp(150,function(){
				notesContent.style.maxHeight = "517px";
			});
			$selectWrap.off("change");
			$pageInput.off("keypress");
			$("#filterButton").off("click");
		}
	},
	toggleNotes: function(noteSwitch,hide) {
		//toggles notes, minimizes by default, if hide is true it will hide
		var self = this, root = self.root, $this,
			notesContent = document.getElementById("notesContent"),
			$resizeElm = $("#notesFeature .notesResize"),
			$document = root.$document,
			containWidth = $(root.contain).width(),
			containHeight = $(root.contain).height(),
			notesOffsetX = root.notes.offsetLeft,
			moveEventSet = false, touchMoveFunc,
			containOffset = root.contain.offsetLeft;

		self.filterHeight = self.filterHeight || 0;
		if (typeof noteSwitch !== "number") {
			root.uiSwitches.showNotes = !root.uiSwitches.showNotes;
		} else {
			root.uiSwitches.showNotes = noteSwitch;
		}

		document.getElementById("notesFeature").style.display = "block";
		if (!root.uiSwitches.showNotes) {
			$document
				.off(root.supportTouch?"touchstart":"mousedown", $resizeElm)
				.off("mousemove touchmove",".contain");

			if (root.supportTouch) {
				root.contain.removeEventListener("touchmove");
			}
			self.notesButtonEvents(0);
			$("#notesFeature .noteContain").slideUp(120,
				function(){if (hide){root.notes.style.display = "none"}});

		} else {
			self.notesButtonEvents(1);
			$("#notesFeature .noteContain").slideDown(120);

			$resizeElm.on(root.supportTouch?"touchstart":"mousedown", function (ev) {
				notesContent = document.getElementById(root.noteLog?"actionLog":"notesContent");
				//notes resize functions and events
				ev.stopPropagation();
				ev.preventDefault();
				//prevents touch and mouse events from triggering anything other then resizing while resizing
				if (!moveEventSet) {
					containOffset = root.contain.offsetLeft;
					$this = $(this);
					moveEventSet = true;

					if(!root.supportTouch){
						$document.on("mousemove",".contain", function (e){
							notesContent.style.width = (containWidth-(e.pageX-containOffset))-24-60+"px";
							notesContent.style.height = containHeight-e.pageY-24-40-self.filterHeight+"px";
						})
						$document.on("mouseup",".contain", function () {
							moveEventSet = false;

						$document
								.off("mousemove",".contain")
								.off("mouseup",".contain");
						});

					} else {
						touchMoveFunc = function (e) {
							e.preventDefault();
							notesContent.style.width = (containWidth-(e.touches[0].pageX-containOffset))-24-60+"px";
							notesContent.style.height = containHeight-e.touches[0].pageY-24-40-self.filterHeight+"px";
						}
						root.contain.addEventListener("touchmove", touchMoveFunc ,false);

						$document.on("touchend",".contain", function (ee) {
							root.contain.removeEventListener("touchmove", touchMoveFunc ,false);
							ee.stopPropagation();
							ee.preventDefault();
							moveEventSet = false;
							$document.off("touchend",".contain");

						});
					}
				}
			})
		}
	},
	horzNavigation: function () {
		var self = this,
			root = self.root, horzThumbIncrement = 0,newWidth = 0,newWidthB = 0,
			vertThumbIncrement = 0, vertIncr = 130,vertTick=0,isB=0,aIncr=0,bIncr=0,
			pagesCount = root.pagesDOM.length,n=0,horzLoc=0,horzIncr = 206,
			pageSlider = document.getElementById("pageSlider"),
			slidesContain = pageSlider.getElementsByClassName("slides")[0],
			eBookContainWidth = parseInt($(root.contain).css("width")),
			slidesWidth = 0,pageReference = root.bookPageNumberReference[root.currentChapter].first;

		slidesContain.innerHTML = "";
		while(n<pagesCount) {
			if (root.startChapterB && n == root.startChapterB) {
				isB = 1;
				vertTick = 0;
				vertThumbIncrement = 0;
				horzThumbIncrement = 0;
			}
			slidesContain.innerHTML +=
                "<div class='slide"+((isB == 1)?" slideB":" slideA")+"' page='"+ (pageReference+n) +"'style='background: url(assets/images/bottomNavStrips/navChap"+root.currentChapter+(isB?"b":"")+".jpg) "+
                "-"+horzThumbIncrement+"px -"+vertThumbIncrement+"px'>"+
                    "<div class='bar'><span>Page "+ (pageReference+n) +"</span></div>"+
                "</div>";

                vertTick++;
                n++;
                if(!isB) {
                	aIncr++;
                	newWidth += horzIncr;
            	} else {
            		bIncr++;
            		newWidthB += horzIncr;
            	}
                if (vertTick === 5) {
                	vertTick = 0;
                	vertThumbIncrement += vertIncr;
                	horzThumbIncrement = 0;
                } else {
                	horzThumbIncrement += horzIncr;
 				}
		}
		isB = 0;
		newWidth = newWidth+(aIncr*12);
		newWidthB = newWidthB+(bIncr*12);
		
		slidesContain.style.width = newWidth+12+"px";
		self.horzMenuValues = {currentWidth:newWidth,
							   slidesWidth:parseInt($(slidesContain).css("width"))-eBookContainWidth,
							   aWidth:newWidth,
							   bWidth:newWidthB};

		$(".slide",slidesContain).on("click", function () {
			root.switchBookPage(parseInt(this.getAttribute("page")));
		});
		if(!root.supportTouch) {
			$(pageSlider).on("mousemove", function (e) {
				e.preventDefault();
				slidesContain.style.left = ((e.pageX-root.contain.offsetLeft)*(self.horzMenuValues.slidesWidth/eBookContainWidth))*-1+"px";
			});
		}
	},
	glossary: function (word) {
		var self = this,
			root = self.root,
			gdWord;

		if (word && word.length) {
			root.popupEnabled = 1;
			word = word.toLowerCase();
			if (gdWord = root.glossaryData[word]) {
				$(root.glossary).fadeIn("fast");
				root.glossaryPopout.getElementsByTagName("strong")[0]
					 .innerHTML = gdWord.originalWord;

				root.glossaryPopout.getElementsByClassName("def")[0]
					 .innerHTML =  gdWord.definition
			} else {
				return 0;
			}
		} else {
			$(root.glossary).fadeOut("fast");
			root.popupEnabled = 0;
		}
		return 1;
	},
	dragDrop: function (tog) {
		var self = this, root = self.root;
		self.$dragItems = $("#dragDrop .dragItems div");
		var thisElm,elmW,elmH,
			targetElm, status = document.getElementById("dragStatus"),
			targetItem,leftDragCoor,topDragCoor,
			offset = self.$dragItems.offset();
			tog = tog || 0;

		if (tog) {
			if (!root.supportTouch) {
				self.$dragItems
					.on("mousedown", function (ee) {
						//prevent triggering other mousedown events
						ee.preventDefault()
						thisElm = this;
						elmW = $(thisElm).width();
						elmH = $(thisElm).height();
						self.$elmEvent=root.$document.on("mousemove", function (e) {
							e.preventDefault();
							topDragCoor = (e.pageY-offset.top-(elmH/2));
							leftDragCoor = (e.pageX-offset.left-elmW-6);
	
							topDragCoor = topDragCoor > 1 ? topDragCoor : 0
							leftDragCoor = leftDragCoor > 1 ? leftDragCoor : 0;
	
							thisElm.style.left = (leftDragCoor<730?leftDragCoor:730)+"px";
							thisElm.style.top = (topDragCoor<350?topDragCoor:350)+"px";
						});
					})
				} else {
					self.$dragItems
					  .on("touchstart", function (ee) {
						//prevent triggering other mousedown events
						thisElm = this;
						elmW = $(thisElm).width();
						elmH = $(thisElm).height();

						ee.preventDefault()
						this.addEventListener("touchmove", function (e) {
							topDragCoor = (e.touches[0].pageY-offset.top-(elmH/2));
							leftDragCoor = (e.touches[0].pageX-offset.left-elmW-6-30);
	
							topDragCoor = topDragCoor > 1 ? topDragCoor : 0
							leftDragCoor = leftDragCoor > 1 ? leftDragCoor : 0;
	
							thisElm.style.left = (leftDragCoor<730?leftDragCoor:730)+"px";
							thisElm.style.top = (topDragCoor<350?topDragCoor:350)+"px";
							targetElm = document.elementFromPoint( e.touches[0].clientX, e.touches[0].clientY);
							targetItem = targetElm.getAttribute("item");


							if (targetItem && (thisElm != targetElm)){ 
								thisElm.setAttribute("style",targetElm.getAttribute("style"));
								thisElm.style.borderRadius = "9px";

								//handles if the element dropped in the right box and displays an appropriate message
								if (thisElm.getAttribute("item") == targetElm.getAttribute("item")) {
									thisElm.style.border = "3px green solid";
									status.style.display = "block";
									status.style.color = "green";
									status.innerHTML = "Correct";
									
								} else {
									thisElm.style.border = "3px red solid";
									status.style.display= "block";
									status.style.color = "red";
									status.innerHTML = "Wrong, try again";
								}
								window.setTimeout(function () {$(status).fadeOut()},5000);
							}
							e.preventDefault();
						},false);
					});
			}
			if (!root.supportTouch) {
				root.$document.on("mouseup","#features .dragDrop", function (e){
						targetElm = document.elementFromPoint( e.clientX, e.clientY);
						if (self.$elmEvent){self.$elmEvent.off("mousemove")}
						//stop the mousedown drag event when mouseup happens

						//find drop element
						targetItem = targetElm.getAttribute("item");
						//get the drop elements attribute of "item"

						if (targetItem && (thisElm != targetElm)){
							thisElm.setAttribute("style",targetElm.getAttribute("style"));
							thisElm.style.borderRadius = "9px";

							//handles if the element dropped in the right box and displays an appropriate message
							if (thisElm.getAttribute("item") == targetElm.getAttribute("item")) {
								thisElm.style.border = "3px green solid";
								status.style.display = "block";
								status.style.color = "green";
								status.innerHTML = "Correct";
								
							} else {
								thisElm.style.border = "3px red solid";
								status.style.display= "block";
								status.style.color = "red";
								status.innerHTML = "Wrong, try again";
							}
							window.setTimeout(function () {$(status).fadeOut()},5000);
						}
					
					});
			}
		} else {
			//turns off all the drag and drop related events
			self.$dragItems.off("mousedown touchstart touchmove");
			if (self.$elmEvent){self.$elmEvent.off("mousemove touchmove")}
			root.$document.off("mouseup touchend","#features .dragDrop");

		}
	},
	AG_switch: function (anch) {
		//handle active graphic interfaces, link and arrow interactions with video
		//video file name is contained in the anchor tags
		var dataAttr = anch.getAttribute("data"),
			videoElm = $('#popupFeature video')[0],
			$anchs = $('.bootLinkHeader a, .vidLinkHeader a, .timelineLinkHeader a, .multiLinkHeader a, .padding70 a', "#popupFeature");
		
		this.vidInstance = $anchs.index(anch);

		$anchs.css('color','#919190');
		anch.style.color='#01567a';
			if (document.createElement("video").canPlayType('video/mp4')) {
				videoElm.src = "https://s3.amazonaws.com/compatia/video/mp4/"+dataAttr+".mp4";
			} else {
				videoElm.src = "https://s3.amazonaws.com/compatia/video/ogv/"+dataAttr+".ogv";
			}
		//reset video with new data
		videoElm.load();
	},
	chooseVideo: function (video) {
		//video file name is contained in the anchor tags
		var self = this,
			$headerAnchs = $('.bootLinkHeader a, .vidLinkHeader a, .timelineLinkHeader a, .multiLinkHeader a, .padding70 a', "#popupFeature"),
			videoElm = document.getElementById("popupFeature")
					   .getElementsByTagName("video")[0];

		$headerAnchs.css('color','#919190');//set all links to gray
		videoElm.src = "assets/video/mp4/"+video+".mp4";
		$headerAnchs.parent().find("[data="+video+"]")[0].style.color = '#01567a';//color blue the active link
	},
	setupVideo: function (defaultVideo) {
		var self = this, root = self.root,
			$headerAnchs = $('.bootLinkHeader a, .vidLinkHeader a, .timelineLinkHeader a, .multiLinkHeader a, .padding70 a', "#popupFeature"),
			instance = $headerAnchs.length, videoPlaying = 0,
			videoElm = document.getElementById("popupFeature")
					   		.getElementsByTagName("video")[0];
		if(!root.supportTouch) {videoElm.setAttribute("height","");}
		defaultVideo = defaultVideo || "b";
		self.vidInstance = 0;
		root.popupFeature.getElementsByClassName("close")[0].outerHTML = '<span class="icon reloadVideo"></span><div class="close"> </div>';
		$headerAnchs.on("click", function () {
			if (typeof this.getAttribute("data") === "string") {
				self.AG_switch(this); //tag video file, sent it do AG_switch
			}
		});
		//detects if it can play an mp4, if not use ogv
		if (videoElm.canPlayType && videoElm.canPlayType('video/mp4')) {
			videoElm.src = "assets/video/mp4/"+defaultVideo+".mp4";
		} else {
			videoElm.src = "assets/video/ogv/"+defaultVideo+".ogv";
		}
		var tryAgain = function () {
			if (videoPlaying === 0 && videoElm.readyState === 1) {
				root.toggleLoader(0);
				videoElm.load();
				window.setTimeout(tryAgain,1000);
			}
		}
		videoElm.addEventListener("loadstart", function() {
			videoPlaying = 0;
			root.toggleLoader(1);
			window.setTimeout(tryAgain,1000);
		});
		videoElm.addEventListener("waiting", function() {
			root.toggleLoader(1);
		});
		videoElm.addEventListener("canplay", function() {
			root.toggleLoader(0);
			videoPlaying = 1;
		});
		videoElm.addEventListener("playthrough", function() {
			root.toggleLoader(0);
		});
		videoElm.load();
		

		$("#popupFeature .arrowLeft").on("click", function () {
			$headerAnchs.css('color','#919190');
			self.vidInstance = self.vidInstance === 0 ? instance-1 : self.vidInstance-1;
			$headerAnchs[self.vidInstance].style.color = '#01567a';
			if (videoElm.canPlayType('video/mp4')) {
				videoElm.src = "assets/video/mp4/"+$headerAnchs[self.vidInstance].getAttribute("data")+".mp4";
			} else {
				videoElm.src = "assets/video/ogv/"+$headerAnchs[self.vidInstance].getAttribute("data")+".ogv";
			}

			videoElm.load();

		});
		$("#popupFeature .arrowRight").on("click", function () {
			$headerAnchs.css('color','#919190');
			self.vidInstance = self.vidInstance === instance-1 ? 0 : self.vidInstance+1;
			$headerAnchs[self.vidInstance].style.color = '#01567a';
			if (videoElm.canPlayType('video/mp4')) {
				videoElm.src = "assets/video/mp4/"+$headerAnchs[self.vidInstance].getAttribute("data")+".mp4";
			} else {
				videoElm.src = "assets/video/ogv/"+$headerAnchs[self.vidInstance].getAttribute("data")+".ogv";
			}
			videoElm.load();
		});
	},

	popupScroll: function () {
		var currentContent = document.getElementById(this.root.uiSwitches.popup),
			$readMoreScroll = $(".scroll",currentContent),
			readMoreScrollBar = $(".scrollBar",currentContent)[0],
			$columns = $(".columnContain",currentContent),
			columns = $columns[0],
			barPosition = 0,
			arrowUp = $(".arrowUp",currentContent)[0],
			arrowDown = $(".arrowDown",currentContent)[0];
			
		
		arrowUp.style.display = "none";
		arrowDown.style.display = "block";
		$readMoreScroll[0].display = "block";
		columns.scrollTop = 0;
		readMoreScrollBar.style.top = "0";
		$readMoreScroll.css("display","block");

		//if client is using a touch screen, the ebook won't need scroll bar
		if (this.root.supportTouch) {
			$(".popup .scroll","#features").hide();
		}
		//chrome doesn't support scrollTopMax so we give it a proper value
		if (!columns.scrollTopMax) {
			columns.scrollTopMax = columns.scrollHeight - parseInt($columns.css("height"));
		}

		columns.onscroll = function () {
			//when scrolling, adjust the GUI appropriately
			barPosition = columns.scrollTop*(300/columns.scrollTopMax);
			readMoreScrollBar.style.top = barPosition+"px";
			//show or hide scroll indicators based on bar position
			if(barPosition >= 300) {
				arrowUp.style.display = "block";
				arrowDown.style.display = "none";
			} else if (!barPosition) {
				arrowUp.style.display = "none";
				arrowDown.style.display = "block";
			} else {
				arrowUp.style.display = "block";
				arrowDown.style.display = "block";
			}
		}

		$readMoreScroll
			.on("mousedown",function (e) {
				e.preventDefault();
				$("#features").on("mousemove",function (ee) {
					barPosition = (ee.pageY - $readMoreScroll.offset().top - 53);
					//bar bounderies
					barPosition = barPosition<0 ? 0 : barPosition;
					barPosition = barPosition>300 ? 300 : barPosition;
					readMoreScrollBar.style.top = barPosition+"px";
					columns.scrollTop = barPosition*(columns.scrollTopMax/300);
					if(barPosition >= 300) {
						arrowUp.style.display = "block";
						arrowDown.style.display = "none";
					} else if (!barPosition) {
						arrowUp.style.display = "none";
						arrowDown.style.display = "block";
					} else {
						arrowUp.style.display = "block";
						arrowDown.style.display = "block";
					}
				});
			})
			.parent().parent().parent().on("mouseup", function () {
				$("#features").off("mousemove");
			});
			//default bar position is at the top, or 0
			columns.scrollTop = 0;
	},
	keyboardFigure: function () {
		var img="";
		$("#keyboardFigure .overlays div[roll]")
		.on(this.root.normalizedClick, function (){
			img = this.getAttribute("roll");
			$("#overlayKeyImages div[roll=\"" + img + "\"]")[0].style.display = "block";
		});

	},
	Figure2_5: function (img) {
		if (img) {
			$("#fig2_5 div[bg='"+img+"']").css("display","block");
		}
	},

	toggle_EraserHighlight: function (tog) {
		var uiSwitches = this.root.uiSwitches,
			highlighter = $(".icon.highlight",this.root.highlightGUI)[0],
			eraser = $(".icon.eraser",this.root.highlightGUI)[0];
		uiSwitches.eraser = tog;
		//the class Highlighter and Eraser change the interface to accomodate erasing,
		//changes include selection box color and cursor image
		if (uiSwitches.eraser) {
			document.body.className += " eraser";
			highlighter.parentElement.className = "HighlightEraserTog";
			eraser.parentElement.className = "HighlightEraserTog green";
		} else {
			document.body.className =
				document.body.className.replace(" eraser","");
			highlighter.parentElement.className = "HighlightEraserTog green";
			eraser.parentElement.className = "HighlightEraserTog";
		}
	},
	highlightListener: function (event) {
		var pointer = event.touch ? event.touch[0] : event,elm;

		if (event.touches) {
			elm = document.elementFromPoint( event.touches[0].clientX,
												 event.touches[0].clientY);
		} else {
			elm = document.elementFromPoint( event.clientX,
												 event.clientY);
		}
		if (compTia.uiSwitches.eraser) {
			if (elm.className == "yellow") {
				if (event.touches) {
					elm.className = "notYellow"
				}
			} else if(elm.parentNode.className == "yellow") {
				if (event.touches) {
					elm.parentNode.className = "notYellow"
				}
				elm = elm.parentNode;
			}
		} else {
			if (elm.className == "notYellow") {
				if (event.touches) {
					elm.className = "yellow"
				}
			} else if(elm.parentNode.className == "notYellow") {
				if (event.touches) {
					elm.parentNode.className = "yellow"
				}
				elm = elm.parentNode;
			}
		}

		compTia.features.endElm = elm;
	},
	notesToEmail:function () {
		//
		//this.sendEmail("alex@allthingsmedia.com","","",this.root.notesOL.innerHTML)
	},
	sendEmail: function (toEmail, ccEmail, subject, body) {
		var emailString;

		if(toEmail.indexOf("@") != -1 && toEmail.indexOf(".") != -1) {
			emailString = "mailto:"+toEmail+"?"
			 + "cc=" + ccEmail
             + "&subject=" + escape("eBook - notes archive :: "+(new Date()).getTime())
             + "&body=" + "escape(body)";
             window.open(emailString,"_self")
		}
		
	},
	notesComponent: function() {
		var root = this.root,
			self = this,
			scrollPosition = 0,
			notesComp = root.notes,moveScrollBar,
			customVertScroll = notesComp.getElementsByClassName("customVertScroll")[0],
			scrollContain = notesComp.getElementsByClassName("noteContain")[0],
			$scrollContain = $(scrollContain),
			scrollBar = customVertScroll.getElementsByClassName("bar")[0],
			$scrollBar = $(scrollBar),
			notes = notesComp.getElementsByClassName("notes")[0], toggle=false,
			scrollBarBoundary = $scrollContain.height() - $scrollBar.height()-8;

		$("a.toggle",notesComp).on(root.normalizedClick, function(){
			toggle = !toggle;
			self.toggleNotes(toggle)
		});

		if (root.supportTouch) {
			scrollBar.style.display = "none";

			scrollContain.addEventListener("touchmove", function (e) {
				//e.preventDefault();

			}, false);
			notesComp.getElementsByClassName("head")[0].addEventListener("touchmove", function (e) {
				e.preventDefault();
			}, false);
		}
		moveScrollBar = function (e) {
			//custom scroll bar functionality
			e.preventDefault();
			scrollPosition = e.pageY - $(customVertScroll).offset().top - $scrollBar.height()/2;
			
			if (scrollPosition < 0) {
				scrollPosition = 0;
			} else if (scrollPosition > scrollBarBoundary) {
				scrollPosition = scrollBarBoundary;
			}
			scrollBar.style.top = scrollPosition +"px";
			notes.scrollTop = scrollPosition*(notes.scrollTopMax/scrollBarBoundary);
		}
		if (!root.supportTouch) {
			notes.onscroll = function () {
				scrollBar.style.top = notes.scrollTop*(scrollBarBoundary/notes.scrollTopMax)+"px";
			}
		};

		$(root.contain)
			.on("mousedown", "#"+notesComp.id+" .bar", function (e) {
				//root.uiSwitches.dontSwipe = true;
				e.preventDefault();
				scrollBarBoundary = $scrollContain.height() - $scrollBar.height()-8;
				$(notesComp).on("mousemove", function (ee) {
					moveScrollBar(ee)})
				notes.onscroll = function () {};
			})
			.on("mouseup", function () {
				$(notesComp).off("mousemove");
				//root.uiSwitches.dontSwipe = false;
				scrollBar.style.top = notes.scrollTop*(scrollBarBoundary/notes.scrollTopMax)+"px";
				if (!root.supportTouch) {
					notes.onscroll = function () {
						scrollBar.style.top = notes.scrollTop*(scrollBarBoundary/notes.scrollTopMax)+"px";
					}
				};
		});
	},
	checkCL_ATN: function () {
		var self = this, root = self.root;
		if ($(".yellow").length) {
			$(".off").removeClass("off")
		} else {
			$(".addToNotes,.clearHighlight",".optionWrap").parent().addClass("off");
		}
	},
	startHighlight: function () {
		var self = this, root = self.root,node = [], $contentsThis, indexHold=0,$YnYelms,
			holdIndex,startIndex = 0, endIndex = 0,ptext=[];


		$("#layout .bottomNav a.highlight").click(function(){
			if(root.uiSwitches.enableHighlight && root.currentPage.className.indexOf("toc") === -1 &&
												  root.currentPage.className.indexOf("chapterStart") === -1 &&
												  root.currentPage.className.indexOf("contents") === -1 &&
												  root.currentPage.className.indexOf("poll") === -1) {
				if (root.uiSwitches.highlighting = !root.uiSwitches.highlighting) {
					if (root.popupEnabled){
						self.$content = $("p, li","#features .popup").filter(":visible");
						self.popupContain = $("#features .popup").filter(":visible")[0];
					} else {
						self.$content = $("p, li","#currentPage");
						self.popupContain = root.currentPage;
					}
					root.currentPage.className += " highlight";
					document.body.className += " selection";
					document.body.className = document.body.className.replace("locked", "");
					root.uiSwitches.dontSwipe = true;
					if (root.popupEnabled){
						self.$content = $("p, li","#features .popup");
					} else {
						self.$content = $("p, li","#currentPage");
					}

					root.highlightGUI.style.display = "block";
					self.HL_clicked = 1;
					if(!this.getElementsByTagName("hlight").length) {
						root.highlightGUI.getElementsByClassName("clearHighlight")[0]
							.parentElement.className = "off";
						root.highlightGUI.getElementsByClassName("addToNotes")[0]
							.parentElement.className = "off";

						self.$content
						.addClass("HL_hov")
						.each(function() {
							
							self.$this = $(this);
								if (!(this.className.indexOf("highlights")+1)) {
									$contentsThis = self.$this.contents();
									self.$this
										.find("*").contents().add($contentsThis).filter(function() {return this.nodeType === 3})
										.each(function () {
											this.textContent = "HLTAGSTARTnotYellow"+
											this.textContent.split(" ").join("HLTAGENDnotYellow HLTAGSTARTnotYellow")+"HLTAGENDnotYellow"
									});
										

									

									this.className += " highlights";
								}
								
						});
						self.popupContain.innerHTML =
										self.popupContain.innerHTML.replace(/HLTAGSTARTnotYellow/g, "<hlight class='notYellow'>")
																  .replace(/HLTAGENDnotYellow/g, "</hlight>");
					}

					self.$YnYelms=$("hlight",self.popupContain);
					self.$YnYelms.each(function(){
						this.setAttribute("wordIndex",indexHold++)
					});

					
					indexHold=0;
					/*HIGHTLIGHTING CODE*/
					if (root.supportTouch) {
							self.popupContain.addEventListener("touchmove",
									self.highlightListener, false);
							self.popupContain.addEventListener("touchend",
									self.checkCL_ATN, false);
							
					} else {
					self.$content = $(".HL_hov");
					self.$content.on("mousedown", function (event) {
							self.thisElm = this;
							self.MUEvent=1;
							self.startY = event.clientY;
							if (root.uiSwitches.dontSwipe) {
								self.startElm = document.elementFromPoint( event.clientX, event.clientY);
								if (self.startElm.parentNode.tagName === "hlight") {
									self.startElm = self.startElm.parentNode;
								}
								startIndex = parseInt(self.startElm.getAttribute("wordIndex"));
								this.addEventListener("mousemove",
									self.highlightListener, false);
								this.addEventListener("mousedown",
									self.highlightListener, false);
							}
						})
						.on("mouseup", function (e) {
							self.MUEvent=0;
							if (self.endElm){
								endIndex = parseInt(self.endElm.getAttribute("wordIndex"));
								if(isNaN(endIndex)) {
									if (self.startY < e.clientY) {
										endIndex = self.$YnYelms.length;
									} else {
										endIndex=0;
									}
								}
								if (startIndex > endIndex) {
									holdIndex = endIndex;
									endIndex = startIndex;
									startIndex = holdIndex;
								}
								self.$YnYelms.each(function(index){
									if (index >= startIndex && index <= endIndex) {
										if (root.uiSwitches.eraser) {
											this.className = "notYellow";

										} else {
											this.className = "yellow";
										}
									}
								});
								if(self.$YnYelms.parent().find(".yellow").length) {
									$(".off",root.highlightGUI).removeClass("off");
								}
								root.clearSelection();
								self.startElm = undefined;
								self.endElm = undefined;
								startIndex = 0;
								endIndex = 0;
								this.removeEventListener("mousemove",
									self.highlightListener);
								this.removeEventListener("mousedown",
									self.highlightListener);
							}

						});
						$("body").on("mouseup", function(e) {
							if(self.MUEvent) {
								self.MUEvent=0;
								self.thisElm.removeEventListener("mousemove",
									self.highlightListener);
								self.thisElm.removeEventListener("mousedown",
									self.highlightListener);
								if (e.clientY > self.startY) {
									endIndex=self.$YnYelms.length;
								} else {
									endIndex = 0;
								}
								if (startIndex > endIndex) {
									holdIndex = endIndex;
									endIndex = startIndex;
									startIndex = holdIndex;
								}
									root.clearSelection();

								self.$YnYelms.each(function(index){
									if (index >= startIndex && index <= endIndex) {
										if (root.uiSwitches.eraser) {
											this.className = "notYellow";

										} else {
											this.className = "yellow";
										}
										
									}
								});
								self.startElm = undefined;
								self.endElm = undefined;
								startIndex = 0;
								endIndex = 0;
							}
						})
					}
				} else {
					self.removeHighlight();
				}
			}
		});
	},
	resetHighlight:function (e) {
		var root = this.root;
		root.highlightGUI.getElementsByClassName("clearHighlight")[0]
			.parentElement.className = "off";
		root.highlightGUI.getElementsByClassName("addToNotes")[0]
			.parentElement.className = "off";
		$("[wordindex]",".HL_hov").each(function(){this.className = this.className.replace("yellow", "notYellow")});
	},
	clearHighlightMarkup:function () {
		var root = this.root;
		root.highlightGUI.getElementsByClassName("addToNotes")[0]
			.parentElement.className = "off";
		root.highlightGUI.getElementsByClassName("clearHighlight")[0]
			.parentElement.className = "off";
		$("[wordindex]").replaceWith(function(){return this.innerHTML});
		$(".highlights")
			.each(function(){this.innerHTML = this.innerHTML.replace(/\n/g,"")})
			.removeClass("highlights");
	},
	removeHighlight: function() {
		var self = this, root = self.root,
			highlighter = $(".icon.highlight,.icon.highlightGreen",this.root.highlightGUI)[0],
			eraser = $(".icon.eraser,.icon.eraserGreen",this.root.highlightGUI)[0];
		highlighter.className = "icon highlight";
		eraser.className = "icon eraser";
		root.highlightGUI.getElementsByClassName("clearHighlight")[0]
			.parentElement.className = "off";
		root.highlightGUI.getElementsByClassName("addToNotes")[0]
			.parentElement.className = "off";
		root.uiSwitches.highlighting = false;
		root.uiSwitches.eraser = false;
		root.uiSwitches.dontSwipe = false;
		root.currentPage.className = root.currentPage.className.replace(" highlight","");
		root.highlightGUI.style.display = "none";
		document.body.className += " locked";
		document.body.className = document.body.className.replace(/ selection/g, "").replace(/ eraser/g, "")
		self.HL_clicked = 0;
		self.$content.off("touchstart touchmove click mousedown mouseup");
		if (self.$this) {self.$this.off("mousedown mouseup touchstart touchmove");}
		$("body").off("mouseup");
		if (root.supportTouch){

			self.popupContain.removeEventListener("touchend",self.checkCL_ATN);
			self.popupContain.removeEventListener("touchmove", self.highlightListener);
		}
		$(".HL_hov",self.popupContain)
			.removeClass("HL_hov")
			.off("click")
			.each(function () {
				this.removeEventListener("mousemove",
										  self.highlightListener);
		});
		
		root.pagesDOM[root.currentPageNumber].innerHTML = root.currentPage.innerHTML;
	},
	sendToNotes: function (noteText) {
		//this function takes the note text or all highlighted items on a given page and
		//wraped it in custom note LI format with buttons and addes it to the notes OL tag
		
		var self = this, root = self.root,
			timeObj=(new Date()), noNotesMessageElm,
			ptext=[],
			editEntryElm = 
				"<div class='editComment'>" +
					"<span class='icon notesPen'> </span> " +
					"<span class='icon notesMag'> </span> " +
					"<span class='icon notesCheck hideToggle'> </span> " +
					"<span class='icon notesCancel hideToggle'> </span> " +
					"<span class='icon notesTrash'> </span> " +
				"</div>";

			if (!noteText) {
				if (root.popupEnabled){
					$(".highlights .yellow", "#features .popup").each(function(){
						ptext.push(this.textContent)
					});
				} else {
					$(".highlights .yellow", "#currentPage").each(function(){
						ptext.push(this.textContent)
					});
				}

				
			} else {
				ptext = noteText || "";
			}
			if (noNotesMessageElm = document.getElementById("noNotes")) {
				noNotesMessageElm.parentNode.removeChild(noNotesMessageElm);
			}
			root.notesOL.innerHTML =
				"<li><div><p>" + ptext.join(" ") +
				"</p>"+editEntryElm +
				"<span chapter='" +root.currentChapter+"' page='"+root.currentBookPageNumber+"' "+
				"class='time'>Chapter "+
				root.currentChapter +
				", Page " + root.currentBookPageNumber +
				" • " + timeObj.toLocaleTimeString().slice(0,5) + " " + timeObj.toLocaleTimeString().slice(-2)+
				" • " + (timeObj.getMonth()+1) + "." + timeObj.getDate()+"."+(1900+timeObj.getYear()).toString().slice(-2)+
				"</span><div class='deleteWarning'>Are you sure you want to delete this note?"+
				"<br><a class='yes'>YES</a> <a class='no'>NO</a></div></div></li>" + root.notesOL.innerHTML;
				root.notes.scrollTop = 0;
				root.notes.getElementsByClassName("bar")[0].style.top = "0px";
	}
}