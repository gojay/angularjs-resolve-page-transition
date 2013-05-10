
/**
 * PhoneDirectives Module
 *
 * Description
 */

 angular.module('PhoneDirectives', [])

/* header component */

.directive('appheader', function() {
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

.directive('appfooter', function() {
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

/* 
 * Bootstrap tabs component 
 */

.directive('tabs', function() {
	// Runs during compile
	return {
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		scope: {
			class: '@'
		}, // {} = isolate, true = child, false/undefined = no change
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

/*
 * Bootstrap Modal Element
 * Restrict Element
 */

.directive('bootstrapModal', function($timeout, $log) {
	// Runs during compile
	return {
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		// replace: true,
		transclude: true,
		scope: {
			modalId: '@'
		}, // {} = isolate, true = child, false/undefined = no change
		template: '<div id="{{modalId}}" class="modal modal-large hide" ng-transclude></div>',
		link: function($scope, element, attrs) {

			$log.log('modal', attrs.modalId);

			var escapeEvent = function(e) {
				if (e.which == 27) {
					closeModal();
				}
			};

			var openModal = function(e, hasBackdrop, hasEscapeExit) {

				$log.log('hasEscapeExit', hasEscapeExit);


				// get modal element
				var modal = jQuery('#' + attrs.modalId);

				// set backdrop
				if (hasBackdrop === true) {
					// buat modal backdrop jika tidak ada
					if (!document.getElementById('modal-backdrop')) {
						jQuery('body').append('<div id="modal-backdrop" class="modal-backdrop"></div>');
					}

					// set display block dan bind modal backdrop untuk close modal
					jQuery('#modal-backdrop')
						.css('display', 'block')
						.bind('click', closeModal);
				}

				// bind body escape event
				if (hasEscapeExit === true) {
					jQuery('body').bind('keyup', escapeEvent);
				}
				// add class modal-open pd body
				jQuery('body').addClass('modal-open');

				// bind .close close modal
				jQuery('.close', modal).bind('click', closeModal);

				// show modal
				modal.css('display', 'block');
			};

			var closeModal = function() {
				// set 'modal-backdrop' unbind event click & display none
				jQuery('#modal-backdrop')
					.unbind('click', closeModal)
					.css('display', 'none');

				// set 'body' unbind escape event & hapus class modal-open
				jQuery('body')
					.unbind('keyup', escapeEvent)
					.removeClass('modal-open');

				// set 'bootstrap modal' display none
				jQuery('#' + attrs.modalId).css('display', 'none');
			};

			//Bind modalOpen and modalClose events, so outsiders can trigger it
			//We have to wait until the template has been fully put in to do this,
			//so we will wait 100ms
			$timeout(function() {
				jQuery('#' + attrs.modalId)
					.bind('modalOpen', openModal)
					.bind('modalClose', closeModal);
			}, 100);
		}
	};
})

/*
 * Bootstrap Modal Open
 * Restrict Attribute
 */

.directive('bootstrapModalOpen', function() {
	// Runs during compile
	return {
		restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
		link: function($scope, element, attrs) {
			// define backdrop & escape Key
			var hasBackdrop = attrs.backdrop === undefined ? true : attrs.backdrop;
			var hasEscapeExit = attrs.escapeExit === undefined ? true : attrs.escapeExit;

			// define event type
			var eventType = attrs.modalEvent === undefined ? 'click' : attrs.modalEvent;

			// set element bind event type
			// panggil trigger modalOpen
			jQuery(element).bind(eventType, function() {
				console.log('click', attrs.bootstrapModalOpen);
				jQuery('#' + attrs.bootstrapModalOpen)
					.trigger('modalOpen', [hasBackdrop, hasEscapeExit]);
			});
		}
	};
})

/**
 * markdownmce component 
 * restrict Element
 * 
 * markdown editor secara live preview
 * beserta beberapa tombol command sederhana utk konversi ke markdown syntax
 * yaitu header(h1->h6), bold, italic dan blockquote
 */

.directive('markdownmce', function() {
	var markdownConverter = new Showdown.converter();
	return {
		scope: {
			phone: '=ngModel'
		}, // {} = isolate, true = child, false/undefined = no change
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/markdown-editor.html',
		replace: true,
		controller: function($scope, $element) {

			var self = this;

			this.editorEl  = $('#editor', $element);
			this.previewEl = $('#preview', $element);

			$scope.isShowHeader = false;

			$scope.swicthToPreview = function(isPreview) {
				var preview = self.previewEl.parent();
				// change class
				if (isPreview) preview.show('slow');
				else preview.hide('slow');

				$scope.isPreviewMode = isPreview;
			};

			$scope.toggleHeader = function(){
				$scope.isShowHeader = $scope.isShowHeader ? false : true ;
				console.log($scope.isShowHeader);
			};

			var el = $('textarea', $element)[0];

			$scope.refreshPreview = function(){
				var makeHtml = markdownConverter.makeHtml(el.value);
				self.previewEl.html(makeHtml);
			};

			$scope.replaceTo = function(type) {
				var replaceText;

				// set textarea text selection
				// http://stackoverflow.com/questions/275761/how-to-get-selected-text-from-textbox-control-with-javascript
				var startPos     = el.selectionStart;
				var endPos       = el.selectionEnd;
				var selectedText = $.trim(el.value.substring(startPos, endPos));

				// set kedalam object utk manipulasi replace text selection 
				var selection = {
					'start' : startPos,
					'end'   : endPos,
					'value' : el.value
				};

				var isSingle = false, isFocus = true, regex = {};

				// set preselection value
				// memungkinkan melakukan konversi balik, jika markdon syntax tdk ter-'text selection'
				var preselection = $.trim(selection.value.substring((startPos-2), startPos));
				switch(type){
					// untuk header
					// markdown syntax '#{text}'
					// inject scope 'isShowHeader' utk 'hidden' tombol dropdown header pd markdown editor
					// seteleah melakukan pemilihan header
					// set single true
					case 'h1':
						$scope.isShowHeader = false;
						isSingle            = true;

						// buat regex global utk header 1
						regex['global'] = new RegExp("(\\#){1}");
						// jika text selection match dgn regex lakukan konversi balik
						// sebaliknya lakukan konversi utk markdown syntax
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '#'+selectedText;
						break;
					// markdown syntax '##{text}'
					// sama seperti 'header'
					case 'h2':
						$scope.isShowHeader = false;
						isSingle            = true;

						regex['global'] = new RegExp("(\\#){2}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '##'+selectedText;
						break;
					// markdown syntax '###{text}'
					// sama seperti 'header'
					case 'h3':
						$scope.isShowHeader = false;
						isSingle            = true;

						regex['global'] = new RegExp("(\\#){3}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '###'+selectedText;
						break;
					// markdown syntax '####{text}'
					// sama seperti 'header'
					case 'h4':
						$scope.isShowHeader = false;
						isSingle            = true;

						regex['global'] = new RegExp("(\\#){4}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '####'+selectedText;
						break;
					// markdown syntax '#####{text}'
					// sama seperti 'header'
					case 'h5':
						$scope.isShowHeader = false;
						isSingle            = true;

						regex['global'] = new RegExp("(\\#){5}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '#####'+selectedText;
						break;
					// markdown syntax '######{text}'
					case 'h6':
						$scope.isShowHeader = false;
						isSingle            = true;

						regex['global'] = new RegExp("(\\#){6}");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '######'+selectedText;
						break;
					// markdown syntax '**{text}**'
					// ada 2 tipe regex, yaitu single dan global
					// regex single utk pengecekan pd text pre-selection
					// regex global utk pengecekan jika pd text selection memilikin markdown syntax
					// pd awal dan akhir
					case 'b':
						regex['single'] = new RegExp("(\\*){2}");
						regex['global'] = new RegExp("(\\*){2}", 'g');

						if (regex['global'].test(selectedText)) {
							replaceText = selectedText.replace(regex['global'], '');
						} else if (regex['single'].test(preselection)) {
							// match dgn pre-selection (konversi balik)
							// update perhitungan selection bersasar 'length' markdown syntax
							// text replacement adalah text selection
							selection['start'] = startPos - 2;
							selection['end']   = endPos + 2;
							replaceText        = selectedText;
						} else {
							replaceText = '**' + selectedText + '**';
						}
						break;
					// markdown syntax '_{text}_'
					// sama seperti 'bold'
					case 'i':
						regex['single'] = new RegExp("(\\_)");
						regex['global'] = new RegExp("(\\_)", 'g');

						if (regex['global'].test(selectedText)) {
							replaceText = selectedText.replace(regex['global'], '');
						} else if (regex['single'].test(preselection)) {
							selection['start'] = startPos - 1;
							selection['end']   = endPos + 1;
							replaceText        = selectedText;
						} else {
							replaceText = '_' + selectedText + '_';
						}
						break;
					// markdown syntax '>{text}'
					// sama seperti 'header'
					// hanya saja tidak perlu inject scope 'isShowHeader'
					case 'quote':
						regex['global'] = new RegExp("(\\>)");
						replaceText     = (regex['global'].test(selectedText)) ? selectedText.replace(regex['global'], '') : '>'+selectedText;
						isSingle = true;
						break;
					case 'more':
						replaceText = '\r\r***\r\r';
						isFocus = false;
						break;
				}

				// replace text selection
				self.replaceSelectedText(selection, replaceText, isSingle, isFocus);
			};

			this.replaceSelectedText = function(selection, replaceText, isSingle, isFocus) {
				var val = selection.value;
				var strBuffer;

				// cara replacing ada 3 tahap
				// tahap pertama, potong text dari 0 hingga start position
				// tahap kedua, sisipkan text replacement. 
				// (untuk single, tambahkan new line \r)
				// tahap ketiga, potong text hingga end position
				// -----------------------------------------------
				// khusus utk single, tdk memerlukan trim(), 
				// yg memungkinkan text tdk terkoversi secara live preview
				if( isSingle ){
					strBuffer = val.slice(0, selection.start) + replaceText;
					if(isSingle)
						strBuffer += '\r\r';
					strBuffer += $.trim(val.slice(selection.end));
				} else {
					strBuffer = $.trim(val.slice(0, selection.start)) + ' ' + replaceText;
					strBuffer += ' ' + $.trim(val.slice(selection.end));
				}

				// set textarea value
				el.value = strBuffer;
				// set focus selection setelah di replace
				if(isFocus){
					el.selectionStart = selection.start;
					el.selectionEnd   = selection.start + replaceText.length;
					el.focus();
				} else {
					el.selectionStart = selection.start + replaceText.length;
				}
				// konversi markdown syntax ke html
				self.markdownMakeHtml(el.value);
			};

			this.markdownMakeHtml = function(text){
				var makeHtml = markdownConverter.makeHtml(text);
				self.previewEl.html(makeHtml);
			};

		},
		link: function($scope, iElement, iAttrs, ctrl) {

			// add event listener 'keydown' 
			// tabbify markdown editor textare
			// http://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea
			var $editor  = $('textarea', ctrl.editorEl);
			$editor.bind('keydown', function(e){
				var keyCode = e.keyCode || e.which;

				if (keyCode == 9) {
					e.preventDefault();
					var start = $(this).get(0).selectionStart;
					var end   = $(this).get(0).selectionEnd;

					// set textarea value to: text before caret + tab + text after caret
					$(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end));

					// put caret at right position again
					$(this).get(0).selectionStart = $(this).get(0).selectionEnd = start + 1;
				}

			});

			$scope.name = $scope.phone.name;
			$scope.$watch('name', function(input) {
				$('legend > span').html(input);
			});
			// inject markdown dr phone description
			$scope.markdown = $scope.phone.description;
			// default is preview mode
			$scope.isPreviewMode = true;

			// update preview setiap perubahan pd editor
			$scope.$watch('markdown', function(desc) {
				ctrl.markdownMakeHtml(desc);
			});
		}
		/*,compile: function(tElement, tAttrs, transclude) {
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
	};
})

/**
 * iuploads component 
 * restrict Element
 * 
 * multiple image uploads
 */

.directive('iuploads', function($timeout, iUploads){
	// Runs during compile
	return {
		scope: {
			phone: '=ngModel',
			onOk: '&',
			insertEditor: '&'
		}, // {} = isolate, true = child, false/undefined = no change
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/image-uploads.html',
		replace: true,
		// transclude: true,
		controller: function($scope, $element, $attrs, $transclude) {
			iUploads.init();
		},
		link: function($scope, iElm, iAttrs, controller) {
			$scope.onOk = function(){
				console.log('onOk');
			};
			$scope.insertEditor = function(index){
				console.log('insertEditor', index, iElm);
			};
		}
	};
});