"use strict";
compTia.modules = {
	toggleModule: function (index) {
		var self = this,
			root = self.root,
			data = "", moduleObj,
			pageModuleElm = document.getElementById("pageModule"),
			pageArticle = root.currentPage.getElementsByTagName("article")[0],
			pageFooter = root.currentPage.getElementsByTagName("footer")[0];

		$("#flipPage #pageModule").remove();
		//if this isn't removed, the modules function will targer the element with id="pageModule"
		//in the flip page rather then the currentPage
		if (--index !== -1) {
			pageArticle.style.display = "none";
			pageFooter.style.display = "none";
			if (moduleObj = root.pageModules[index]) {
				self.closeScript = moduleObj.closeScript;
				pageModuleElm.innerHTML = moduleObj.section;
				pageModuleElm.className = moduleObj.distinction;
				if (data = moduleObj.data) {
					pageModuleElm.setAttribute("data", data);
				}
				root.uiSwitches.dontSwipe = 1;
				if (moduleObj.customScript) {
					window.eval(moduleObj.customScript);
				}
				
			}
		} else {
			pageModuleElm.innerHTML = "";
			pageModuleElm.className = "";
			pageArticle.style.display = "block";
			pageFooter.style.display = "block";
			root.uiSwitches.dontSwipe = 0;
			if (self.closeScript) {
				window.eval(self.closeScript);
			}
			
		}
	},
	checkScore:function () {
		var self = this,
			root = self.root;

		self.quizComplete = true;
		if (document.getElementById("questions") &&
			document.getElementById("pointsPerQues") &&
			document.getElementById("correctPoints") &&
			document.getElementById("maxPoints") &&
			document.getElementById("ratio")) {
			
			document.getElementById("questions")
				.innerHTML += self.questions;

			document.getElementById("pointsPerQues")
				.innerHTML += self.scorePerQues;

			document.getElementById("correctPoints")
				.innerHTML = self.CYUscore;

			document.getElementById("maxPoints")
				.innerHTML = self.maxScore;

			document.getElementById("ratio")
				.innerHTML += Math.round(self.CYUscore/self.maxScore*100);
		}
	},
	setupQuiz: function () {
		var self = this,
			root = self.root,
			step = 0, msgElm, scorePerQues = 10,
			pageModuleElm = document.getElementById("pageModule"),
			answers = pageModuleElm.getAttribute("data"),
			quizes = pageModuleElm.getElementsByClassName("quiz"),
			slideQuizeFunc = function () {
				$(quizes[step++]).slideUp(200, function () {
							self.quiz(step);
						});
				};
		self.quizComplete = false;
		self.scorePerQues = scorePerQues;
		self.CYUscore = 0;
		self.questions = quizes.length;
		self.maxScore = self.questions*10;
		$("#pageModule .greySkip").click(function () {
			slideQuizeFunc();
			scorePerQues = 10;
		});
		quizes[step].style.display = "block";
		$("#pageModule .quizButton").click(
			function () {
				msgElm = this.parentNode.getElementsByClassName("answerMessage")[0];
				if (this.getAttribute("correct") !== null) {
					this.className += " correct";
					msgElm.style.color = "#00af30";
					msgElm.innerHTML = "Correct!";
					self.CYUscore += scorePerQues;
					scorePerQues=10;
					window.setTimeout(function ()
						{ slideQuizeFunc() },1000);
				} else {
					msgElm.style.color = "#f00";
					msgElm.innerHTML = "That's incorrect. Please try again";
					scorePerQues = (scorePerQues===10?5:0);
				}
			}
		);
		$("#pageModule [nextstep]").click(
			function () {
				$(quizes[step++]).slideUp(200, function () {
					scorePerQues = 10;
					self.quiz(step);
				});
			}
		);
	},
	quiz: function (index) {
		var self = this,
			root = self.root,
			pageModuleElm = document.getElementById("pageModule"),
			quizes = pageModuleElm.getElementsByClassName("quiz"),
			$quizes = $(quizes);
		
		if ($quizes.eq(index).length) {
			$quizes.css("display","none").eq(index).slideDown(200);
		} else {
			self.scoreInt = ~~(self.CYUscore/self.maxScore*100);
			self.toggleModule(0);
		}
	},
	setupTryThis: function () {
		var self = this,
			root = self.root,
			step = 0,
			pageModuleElm = document.getElementById("pageModule"),
			tryThisElms = pageModuleElm.getElementsByClassName("tryThisElm");

		tryThisElms[step].style.display = "block";
		document.getElementsByTagName('footer')[1].style.display = 'block';
		pageModuleElm.style.height = '100%'

		$("#pageModule .nextStep").click(
			function () {
				$(tryThisElms[step++]).slideUp(100, function () {
					self.TryThis(step);
				});
			}
		);
		$("#pageModule .prevStep").click(
			function () {
				$(tryThisElms[step--]).slideUp(100, function () {
					self.TryThis(step);
				});
			}
		);
	},
	TryThis: function (index) {
		var self = this,
			root = self.root,
			pageModuleElm = document.getElementById("pageModule"),
			tryThisElms = pageModuleElm.getElementsByClassName("tryThisElm"),
			$tryThisElms = $(tryThisElms);

		$tryThisElms.css("display","none").eq(index).slideDown(200);


	}
}