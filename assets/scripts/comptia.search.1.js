"use strict";
compTia.search = {
	currentSearchPages: [],
	searchTermsSelector: "figcaption,figcaption>em, h2, p, li, span, li>div",
	searchFowardPage: function () {
		var self = this;
		self.searchingAtPage++;
		if (self.searchingAtPage >= self.pagesWithTerm) {
			self.searchingAtPage = 0;
		}
		self.returnSearch = self.currentSearchPages[self.searchingAtPage];
		self.currentSearches--; //since we just did a search, we take one off
		if (self.currentSearches === 0) {
			self.currentSearches = self.pagesWithTerm;
		}
		self.updateSearchRender()
	},
	searchBackwardPage: function () {
		var self = this;
		self.searchingAtPage--;
		if (self.searchingAtPage < 0) {
			self.searchingAtPage = self.pagesWithTerm-1;
		}
		self.returnSearch = self.currentSearchPages[self.searchingAtPage];
		self.currentSearches++;
		if (self.currentSearches == self.pagesWithTerm) {
			self.currentSearches = 1;
		}
		self.updateSearchRender()
	},

	searchString: function (sString) {
		var self = this, root = self.root, n=0,nn=0,nnn=0, containPage=[],articleIndex=0,
			$articles,stringN, resultIndexHTML="",
			resultIndex = document.getElementById("resultIndex"), holdChapter = [],
			$aResultIndex;

	
		self.sString = sString;
		self.searching = 1;
		if (typeof sString === "string" && sString.length > 2) { //check if string and at least 3 characters
			if (self.oldsString !== sString) { //is the search a new word?
				self.currentSearches = 0; //resets the search amount index
				self.oldsString = sString; 
				//set oldString to the current string so we know later if it's being reused
				resultIndex.innerHTML = "";
				resultIndexHTML = "<div class='resultsSection active' style='width:165px' sect='0'><div>"
				while (n<self.searchStrings.length) {
					stringN = self.searchStrings[n].toLowerCase().indexOf(sString.toLowerCase());
					if (stringN+1) {
						containPage.push(n);
						resultIndexHTML += "<a>"+ (n) + ",</a> ";
						
						self.returnSearch = containPage[0];
						self.currentSearches++;
						nn++;
						if(nn === 66) {
							nnn++;
							resultIndexHTML += "</div></div><div class='resultsSection hideToggle' sect='"+nnn+"' style='width:0'><div>";
							nn = 0;
						}
					}					
					n++;
				}
				root.searchResultsSection = 0;
				resultIndex.innerHTML = resultIndexHTML.split("").reverse().join("")
													   .replace(",","").split("")
													   .reverse().join("") + "</div></div>"; //remove last comma
				/*if (resultIndex.innerHTML.indexOf(",")) {
					resultIndex.innerHTML = resultIndex.innerHTML.slice(0,-2);
				}*/
				$aResultIndex = $("a", resultIndex);
				window.$a = $aResultIndex;
				self.pagesWithTerm = containPage.length;
				self.searchingAtPage = 0;
				$aResultIndex.off("click").on("click",function () {
					$aResultIndex.removeClass("currentTermPage");
					this.className="currentTermPage";
					self.returnSearch = parseInt(this.innerHTML);
					self.updateSearchRender();
				});
				document.getElementById("searchResults").innerHTML = self.currentSearches;
				if (self.currentSearches == 0) {
					self.searching = 0;
					$("#searchBox .results").slideUp(100);
					$("#searchBox .noResults").slideDown(100);
					window.setTimeout(function () {
						if (!self.searching) {
							self.toggleSearchBox(0);
						}
					},9000)
					return 0;
				}
				$("#searchBox .noResults").slideUp(100);
				$("#searchBox .results").slideDown(100);
				self.currentSearchPages = containPage.slice();

			} else if (self.oldsString === sString && self.currentSearches) {
				self.searchFowardPage();
			}
			self.updateSearchRender();
		} else {
			self.oldsString = "";
			return 0;
		}
	},
	refreshSearchContent: function () {
		var self = this, root = self.root, o=0,
			holdArticles=[], pagesLength = root.allPagesDOM.length,
			pageIndex=0,content="",$articles,holdChapter;


		
		while(o<pagesLength) {
			holdChapter = root.allPagesDOM[o];
			o++;
			holdArticles = holdArticles.concat($("article",holdChapter).toArray());
		}
		$articles = $(holdArticles);

		self.searchStrings = [];
		root.toggleLoader(1);

		$articles.each(function () { //search inside the article tag inside all prestructured pages
			$(self.searchTermsSelector,this).contents() //check for text in places text most likely exists
				.filter(function() {return this.nodeType === 3}) //filters out non-text elements
				.each(function () {content += this.data+" ";}) //save text content to content
			self.searchStrings[pageIndex++] = content; //save text content for later parsing
			content = "";
		});
		root.toggleLoader(0);
	},
	updateSearchRender: function () {
		var self = this, root = self.root, sStringReg, $parentTags,sString = self.sString,caseString,strLocation,strLength,n=0;
		this.root.toggleLoader(1);
		if ((self.currentSearches>0 && self.oldsString === self.sString) || self.oldsString !== self.sString) {
			$("a", resultIndex).removeClass("currentTermPage")
							   .filter(function () {return (parseInt(this.innerHTML) == parseInt(self.returnSearch)) })
							   .addClass("currentTermPage");

			self.root.switchBookPage(self.returnSearch);
			sStringReg = new RegExp(sString,"ig");
			//regex global string search for the search term

			$parentTags = $(".row, .cell>div, .column>div", "#currentPage article")
			//select all template blocks that contain current page content
			$parentTags.find("*").contents()
				.add($parentTags.contents())
				.filter(function() { return this.nodeType === 3 || (!this.children.length && this.tagName !== "BR")})
					   .each(function() {
					   		strLocation = this.textContent.toLowerCase().indexOf(sString.toLowerCase());
							if(strLocation !== -1) {

								//wrap all matching search terms in a blue block
								caseString = sString.toLowerCase().split(" ");
								while(n < caseString.length) {
									caseString[n] = caseString[n].split("");
									caseString[n][0] = caseString[n][0].toUpperCase();
									caseString[n] = caseString[n].join("")
									n++;
								}
								n = 0;
								caseString = caseString.join(" ");
								sStringReg = new RegExp(caseString,"g");
								this.textContent =
								this.textContent.replace(sStringReg, "STARTSITEM"+caseString+"ENDSITEM")
								
								caseString = sString.toLowerCase();
								sStringReg = new RegExp(caseString,"g");
								this.textContent =
								this.textContent.replace(sStringReg, "STARTSITEM"+caseString+"ENDSITEM")
								
								caseString = sString;
								sStringReg = new RegExp(caseString,"g");
								this.textContent =
								this.textContent.replace(sStringReg, "STARTSITEM"+caseString+"ENDSITEM")
								 
							}
					
			})
				root.currentPage.innerHTML =
				root.currentPage.innerHTML.replace(/STARTSITEM/g, "<sitem>")
										  .replace(/ENDSITEM/g, "</sitem>");

		} else {
			self.oldsString = "";
		}
		this.root.toggleLoader(0);
	},
	searchEvents: function () {
		//sets up the events 
		var self = this, root = self.root;

		$(root.currentPage).on("click", function () {
			var $searchItems = $(".searchItem");			
			$searchItems.removeClass("searchItem");
		});

		//if you press enter or click the magnifying glass, initiate a search
		$("#ebookSearch").on("keypress", function (e) {
			if (typeof e === "undefined" || e.keyCode == 13) {
				self.startSearch();
			}
				
		});
		$(".magnify",self.contain).on("click", function () {
			self.startSearch();		
		});
	},
	toggleSearchBox: function (tog) {
		//show or hide the search box
		var self = this;

		if (tog){
			$("#searchBox").slideDown(200);
		} else {
			self.oldsString = "";
			$('#searchBox').slideUp(100);
		}
	},
	startSearch: function(e) {
		var self = this, root = self.root,
			searchString = document.getElementById("ebookSearch").value,
			glosData = root.glossaryData[searchString.toLowerCase()] || "";
			
		$(".searchTerm").each(function () {
				this.innerHTML = searchString;
		});

		if (searchString && searchString.toLowerCase().indexOf("page") === -1
						 && searchString.toLowerCase().indexOf("chapter") === -1) {
			//if the search box contains a page and chapter number
			self.toggleSearchBox(1);
			self.searchString(searchString);
			if (typeof glosData === "object") {
				document.getElementById("searchGlosDesc").innerHTML =
					"<strong>"+glosData.originalWord + ": </strong>"+
					glosData.definition;
				$(".searchBoxDef").slideDown();
			} else {
				$(".searchBoxDef").slideUp(100);
			}

		} else if (searchString.toLowerCase().indexOf("page") > -1 && searchString.split(" ").length == 2) {
			//check if searchbox contains only a page number "page 4"
			root.switchBookPage(parseInt(searchString.split(" ")[1]) || 0);
	
		} else if (searchString.toLowerCase().indexOf("chapter") > -1 && searchString.split(" ").length == 2) {
			//check if searchbox contains a chapter number "chapter 4"
			root.switchChapter(parseInt(searchString.split(" ")[1]) || 0);
	
		}
	}
}