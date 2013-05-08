angular.module('PhoneDirectives', [])

/* header component */

.directive('theheader', function() {
	// Runs during compile
	return {
		scope: {
			title: '@'
		}, // {} = isolate, true = child, false/undefined = no change
		restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/header-nav.html',
		replace: true
	};
})

/* footer component */

.directive('thefooter', function() {
	// Runs during compile
	return {
		scope: {}, // {} = isolate, true = child, false/undefined = no change
		restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/footer.html',
		transclude: true,
		replace: true
	};
})

/* loader component */

.directive('loader', function($rootScope, $timeout, $log, pageTransition) {
	// Runs during compile
	return {
		restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/loader.html',
		replace: true,
		link: function($scope, iElm, iAttrs, controller) {

			// start page transition untuk pertam kali
			pageTransition.start();

			$rootScope.$on('$routeChangeStart', function(event, next, current) {
				$log.info('route starting...');
				$scope.isShow = true;
				$scope.loaderClass = 'load';
				$scope.alertClass = '';
				$scope.textInfo = 'Loading';

				/*$transtionPage.addClass("slideOutSkew").delay(1000).queue(function(next) {
						$(this).removeClass("slideOutSkew");
						$(this).addClass("slideInSkew");
						next();
					});*/

				pageTransition.change();

			});
			$rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
				$log.info('route success');
				$scope.isShow = false;
				$scope.textInfo = 'Loaded';

				/*
					 * tampilkan 'message' saat page sudah tampil
					 * 
					$scope.loaderClass = 'loaded';
					$scope.alertClass  = 'alert alert-success';
					$timeout(function(){
						$scope.isShow = false;
					}, 3000);
					*/
			});
			$rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
				$log.error('route error', rejection);
				$scope.isShow = true;
				$scope.loaderClass = 'error';
				$scope.alertClass = 'alert alert-error';
				$scope.textInfo = 'Error Occured';
			});
		}
	};
})

/* tabs component */

.directive('tabs', function() {
	// Runs during compile
	return {
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		scope: {}, // {} = isolate, true = child, false/undefined = no change
		replace: true,
		transclude: true,
		templateUrl: 'partials/tabs.html',
		controller: function($scope, $element, $attrs) {
			var panes = $scope.panes = [];

			$scope.select = function(pane) {
				angular.forEach(panes, function(pane) {
					pane.selected = false;
				});
				pane.selected = true;
			};

			this.addPane = function(pane) {
				if (panes.length === 0) $scope.select(pane);
				panes.push(pane);
			};
		}
	};
})
	.directive('pane', function() {
	// Runs during compile
	return {
		require: '^tabs', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		scope: {
			title: '@'
		}, // {} = isolate, true = child, false/undefined = no change
		template: '<div class="tab-pane" ng-class="{active:selected}" ng-transclude></div>',
		replace: true,
		transclude: true,
		link: function($scope, iElm, iAttrs, tabsCtrl) {
			tabsCtrl.addPane($scope);
		}
	};
})

/* markdown component */

.directive('markdownmce', function() {
	var markdownConverter = new Showdown.converter();
	return {
		scope: {
			phone: '=ngModel'
		}, // {} = isolate, true = child, false/undefined = no change
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/markdown-editor.html',
		controller: function($scope, $element) {
			var self = this;

			this.editorEl  = $('#editor', $element);
			this.previewEl = $('#preview', $element);

			$scope.swicthToPreview = function(isPreview) {
				$scope.isPreviewMode = isPreview;
				// change class
				if (isPreview) self.editorEl.switchClass('span12', 'span6', 'slow');
				else self.editorEl.switchClass('span6', 'span12', 'slow');
			};

			$scope.isShowHeader = false;
			$scope.toggleHeader = function(){
				$scope.isShowHeader = $scope.isShowHeader ? false : true ;
				console.log($scope.isShowHeader);
			};

			this.makeHtml = function(text){
				var makeHtml = markdownConverter.makeHtml(text);
				self.previewEl.html(makeHtml);
			};

			var el = $('textarea', $element)[0];

			// http://stackoverflow.com/questions/3964710/replacing-selected-text-in-the-textarea
			var getInputSelection = function() {

				var start = 0,
					end = 0,
					normalizedValue, range,
					textInputRange, len, endRange;

				if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
					start = el.selectionStart;
					end = el.selectionEnd;
				} else {
					range = document.selection.createRange();

					if (range && range.parentElement() == el) {
						len = el.value.length;
						normalizedValue = el.value.replace(/\r\n/g, "\n");

						// Create a working TextRange that lives only in the input
						textInputRange = el.createTextRange();
						textInputRange.moveToBookmark(range.getBookmark());

						// Check if the start and end of the selection are at the very end
						// of the input, since moveStart/moveEnd doesn't return what we want
						// in those cases
						endRange = el.createTextRange();
						endRange.collapse(false);

						if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
							start = end = len;
						} else {
							start = -textInputRange.moveStart("character", -len);
							start += normalizedValue.slice(0, start).split("\n").length - 1;

							if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
								end = len;
							} else {
								end = -textInputRange.moveEnd("character", -len);
								end += normalizedValue.slice(0, end).split("\n").length - 1;
							}
						}
					}
				}

				return {
					start: start,
					end: end
				};
			};

			var replaceSelectedText = function(data, replaceText, isHeader) {
				var val = data.value;

				// reverse
				var start = (data.start !== undefined) ? data.start : data.selection.start;
				var end   = (data.end !== undefined) ? data.end : data.selection.end;

				var strbuffer;
				if( isHeader ){
					strbuffer = val.slice(0, start) + replaceText;
					if(isHeader)
						strbuffer += '\r\r';

					strbuffer += val.slice(end);
				} else {
					strbuffer = val.slice(0, start).rtrim() + ' ' + replaceText;
					if(isHeader)
						strbuffer += '\r\r';

					strbuffer += ' ' + val.slice(end).ltrim();
				}

				el.value = strbuffer;
				self.makeHtml(el.value);
			};

			// http://stackoverflow.com/questions/275761/how-to-get-selected-text-from-textbox-control-with-javascript
			$scope.replaceTo = function(type) {
				var selectedText, replaceText;
				var startPos, endPos;
				// IE version
				if (document.selection !== undefined) {
					textComponent.focus();
					var sel      = document.selection.createRange();
					selectedText = sel.text;
				}
				// Mozilla version
				else if (el.selectionStart !== undefined) {
					startPos     = el.selectionStart;
					endPos       = el.selectionEnd;
					selectedText = el.value.substring(startPos, endPos);
				}
				else return;

				selectedText = selectedText.trim();
				var data = {
					'selection':getInputSelection(),
					'value' : el.value
				};

				var isHeader = false, regex = {};
				var preselection = data.value.substring((startPos-2), startPos).trim();
				switch(type){
					case 'h1':
						regex['global'] = new RegExp("(\\#){1}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '#'+selectedText;

						$scope.isShowHeader = false;
						isHeader            = true;
						break;
					case 'h2':
						regex['global'] = new RegExp("(\\#){2}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '##'+selectedText;

						$scope.isShowHeader = false;
						isHeader            = true;
						break;
					case 'h3':
						regex['global'] = new RegExp("(\\#){3}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '###'+selectedText;

						$scope.isShowHeader = false;
						isHeader            = true;
						break;
					case 'h4':
						regex['global'] = new RegExp("(\\#){4}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '####'+selectedText;

						$scope.isShowHeader = false;
						isHeader            = true;
						break;
					case 'h5':
						regex['global'] = new RegExp("(\\#){5}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '#####'+selectedText;

						$scope.isShowHeader = false;
						isHeader            = true;
						break;
					case 'h6':
						regex['global'] = new RegExp("(\\#){6}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '######'+selectedText;

						$scope.isShowHeader = false;
						isHeader            = true;
						break;
					case 'b':
						regex['test'] = new RegExp("(\\*){2}");
						regex['replace'] = new RegExp("(\\*){2}", 'g');

						if (regex['test'].test(selectedText)) {
							replaceText = selectedText.replace(regex['replace'], '');
						} else if (regex['test'].test(preselection)) {
							data['start'] = startPos - 2;
							data['end']   = endPos + 2;
							replaceText   = selectedText;
						} else {
							replaceText = '**' + selectedText + '**';
						}

						// replaceText = (regex['test'].test(selectedText)) ? selectedText.replace(regex['replace'], '') : '**'+selectedText+'**';
						break;
					case 'i':
						regex['test'] = new RegExp("(\\_)");
						regex['replace'] = new RegExp("(\\_)", 'g');

						if (regex['test'].test(selectedText)) {
							replaceText = selectedText.replace(regex['replace'], '');
						} else if (regex['test'].test(preselection)) {
							data['start'] = startPos - 1;
							data['end']   = endPos + 1;
							replaceText   = selectedText;
						} else {
							replaceText = '_' + selectedText + '_';
						}
						// replaceText = (regex['test'].test(selectedText)) ? selectedText.replace(regex['replace'], '') : '*'+selectedText+'*';
						break;
				}

				replaceSelectedText(data, replaceText, isHeader);
			};
		},
		/*compile: function(tElement, tAttrs, transclude) {
			var $editor = $('#editor', tElement);
			var $preview = $('#preview', tElement);
			return function($scope, iElement, iAttrs) {
				$scope.markdown = $scope.phone.description;
				$scope.isPreviewMode = true;

				$scope.$watch('markdown', function(desc) {
					var makeHtml = markdownConverter.makeHtml(desc);
					$preview.html(makeHtml);
				});

				$scope.swicthToPreview = function(isPreview) {
					$scope.isPreviewMode = isPreview;
					// change class
					if (isPreview) $editor.switchClass('span12', 'span6', 'slow');
					else $editor.switchClass('span6', 'span12', 'slow');
				};
			};
		}*/
		link: function($scope, iElement, iAttrs, ctrl) {

			var $editor = ctrl.editorEl;
			var $preview = ctrl.previewEl;

			$scope.markdown = $scope.phone.description;
			$scope.isPreviewMode = true;

			$scope.$watch('markdown', function(desc) {
				ctrl.makeHtml(desc);
			});
		}
	};
});