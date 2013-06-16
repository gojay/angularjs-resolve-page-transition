
/**
 * PhoneDirectives Module
 *
 * Description
 */

 angular.module('PhoneDirectives', [])

/* 
 * header component 
 */

.directive('appheader', function() {
	// Runs during compile
	return {
		scope: {
			title: '@'
		}, // {} = isolate, true = child, false/undefined = no change
		restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/components/appheader.html',
		replace: true
	};
})

/* 
 * footer component 
 */

.directive('appfooter', function() {
	// Runs during compile
	return {
		scope: {}, // {} = isolate, true = child, false/undefined = no change
		restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/components/appfooter.html',
		transclude: true,
		replace: true
	};
})

/* 
 * loader component 
 */

.directive('loader', function($rootScope, $timeout, $log, pageTransition) {
	// Runs during compile
	return {
		restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/components/loader.html',
		replace: true,
		link: function($scope, iElm, iAttrs, controller) {

			$scope.isShow = true;
			// start page transition untuk pertama kali
			pageTransition.start();

			$rootScope.$on('$routeChangeStart', function(event, next, current) {
				$log.info('route starting...');

				/*$.blockUI({
					timeout: 2000,
					showOverlay: false,
					message:'<i class="icon-spinner icon-spin icon-4x"></i>',
					css : {
						color : 'darkBlue',
						background : 'none',
						border : 'none'
					}
				});*/

				$scope.isShow      = true;
				// $scope.loaderClass = 'load';
				// $scope.alertClass  = '';
				// $scope.textInfo    = 'Loading';

				// page transition saat pindah halaman
				pageTransition.change();

			});
			$rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
				$log.info('route success');

				$scope.isShow   = false;
				// $scope.textInfo = 'Loaded';

				/*
				 * tampilkan 'message' saat page sudah tampil
				 * 
				$scope.loaderClass = 'loaded';
				$scope.alertClass  = 'alert alert-success';
				$timeout(function(){
					$scope.isShow = false;
				}, 3000);
				*/

				// $.unblockUI();
			});
			$rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
				$log.error('route error', rejection);
				$scope.isShow      = true;
				$scope.loaderClass = 'error';
				$scope.alertClass  = 'alert alert-error';
				$scope.textInfo    = 'Error Occured';
			});
		}
	};
})

/* 
 * tabs component 
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
		templateUrl: 'partials/components/tabs.html',
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
		templateUrl: 'partials/components/markdownmce.html',
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

			this.refreshPreview = $scope.refreshPreview = function(callback){
				var makeHtml = markdownConverter.makeHtml(el.value);
				self.previewEl.html(makeHtml);
				// buat video player
				if($('video', self.previewEl).length) $('video', self.previewEl).mediaelementplayer();
				if(callback) callback.call(self);
			};

			$scope.replaceTo = function(type) {
				var replaceText;

				// get textarea text selection
				// source : http://stackoverflow.com/questions/275761/how-to-get-selected-text-from-textbox-control-with-javascript
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

				// get preselection value
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

				// ada 3 tahap utk replacing 
				// pertama, potong text dari 0 hingga start position
				// kedua, sisipkan text replacement. (untuk single, tambahkan new line \r)
				// ketiga, potong text hingga end position
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
				self.refreshPreview();
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

					// set textarea value : text before caret + tab + text after caret
					$(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end));

					// put caret at right position again
					$(this).get(0).selectionStart = $(this).get(0).selectionEnd = start + 1;
				}

			});

			// auto update title saat input name
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
				ctrl.refreshPreview();
			});
		}
	};
})

/*
 * Twitter Bootstrap Modal Component
 * Restrict Element
 */

.directive('tbmodal', function($timeout, $log) {
	// Runs during compile
	return {
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		replace: true,
		transclude: true,
		scope: {
			modalId    : '@',
			modalTitle : '@',
			modalBtnOk : '@',
			class : '@'

		}, // {} = isolate, true = child, false/undefined = no change
		templateUrl: 'partials/components/tbmodal.html',
		controller: function($scope, $element) {
			this.element = $element;
		},
		link: function($scope, element, attrs) {

			$log.log('modal', $scope);

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
				modal.css('display', 'block');

				// bind .close close modal
				jQuery('.close', modal).bind('click', closeModal);
				jQuery('.btn-close', modal).bind('click', closeModal);

				// show modal
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

.directive('tbModalOpen', function() {
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
				console.log('click', attrs.tbModalOpen);
				jQuery('#' + attrs.tbModalOpen)
					.trigger('modalOpen', [hasBackdrop, hasEscapeExit]);
			});
		}
	};
})

/**
 * iupload component 
 * restrict Element
 * require markdownmce (optional)
 * 
 * multiple images upload
 */

.directive('iupload', function($timeout, $compile, imageUpload, multipleImageUpload){
	// Runs during compile
	return {
		require: '^markdownmce',
		scope: {
			phone: '=',
			modalId : '@',
			modalTitle : '@'
		}, // {} = isolate, true = child, false/undefined = no change
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/components/iupload.html',
		controller: function($scope, $element, PhoneImage){
			$scope.phoneImages = PhoneImage.get({ imageId:1 });
			console.log($scope.phoneImages);

			$scope.deleteImage = function(event, index){
				var $btn    = $(event.currentTarget);
				var $group  = $btn.parents('.accordion-group');
				var $parent = $group.parent();
				var imageId = $('input[name="img_id"]', $group).val();

				$btn.button('loading');
				PhoneImage.remove({ imageId:imageId }, function(){
					$scope.phoneImages.splice(index, 1);
					$group.fadeOut('slow', function(){
						$(this).remove();
						$('.accordion-group:last .accordion-toggle', $parent).click();
					});
				});
			};

			$scope.changeImage = function(event, image){
				console.log('changeImage', image);
				var $btn       = $(event.currentTarget);
				var $group     = $btn.parents('.accordion-group');
				var imgId      = $('input[name="img_id"]', $group).val();

				var $row       = $btn.parents('.upload-img');
				var $parent    = $btn.parent();
				var $inputFile = $('input[type="file"]', $parent);
				var $img       = $parent.prev();

				var data = {
					imgId : imgId,
					rowEl : $row,
					imgEl : $img,
					callback : function(response){
						console.log('callback response', response);
					}
				};
				$inputFile.bind('change', data, handleFileReaderUplod).click();
			};

			var handleFileReaderUplod = function(e){
				var target = e.currentTarget;
				var file   = e.target.files[0];
				// data
				var $row   = e.data.rowEl;
				var $img   = e.data.imgEl;
				var callback = e.data.callback;
				// url
				var url    = 'api/phone/images/' + e.data.imgId;

				console.log('handleFileReaderUplod', e);

				var fr = new FileReader();
				fr.onerror = function(e){
					switch (e.target.error.code) {
						case e.target.error.NOT_FOUND_ERR:
							alert('File not found!');
							break;
						case e.target.error.NOT_READABLE_ERR:
							alert('File is not readable');
							break;
						case e.target.error.ABORT_ERR:
							break;
						default:
							alert('An error occured reading this file');
					}
				};
				fr.onloadstart = function(){
					$row.addClass('loading');
				};
				fr.onloadend = (function(fileImg){
					return function(evt) {
						$img[0].src = evt.target.result;
						imageUpload.upload({
							file : fileImg,
							url  : url
						}, function(response){
							$img[0].src = response.url;
							$row.removeClass('loading');
							if( callback ) callback(response);
						});
					};
				})(file);
				// read as Data URI
				fr.readAsDataURL(file);
			};
		},
		// replace: true,
		compile: function(element, attrs) {
			// ambil attribut element
			var $featureEl  = $('#'+attrs.featureId);
			var showInModal = attrs.modal;
			var el          = element.html();

			return function($scope, iElm, iAttrs, markdownmceCtrl) {
				// jika attribute modal set true
				// wrap dengan modal template
				// letakkan element pd modal body
				if( showInModal !== 'false' ) {
					// ambil element html
					// buat template modal,
					// set modal id
					var modal  = '<div id="{{modalId}}" class="modal modal-large hide fade" tabindex="-1" role="dialog" aria-labelledby="uploadImages" aria-hidden="true">' +
									'<div class="modal-header">' +
										'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
										'<h3 id="uploadImages">{{modalTitle}}</h3>' +
									'</div>' +
									'<div class="modal-body" ng-model="phone">' + el+ '</div>' +
									'<div class="modal-footer">' +
										'<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>' +
									'</div>' +
								'</div>';
					// compile modal
					el = $compile(modal)($scope);
					// jika dtampilkan, modal akan berada dibelakang backdrop
					// trik, modal diletakan pd akhir body
					$('body').append(el);
					// kemudian hapus element asli 
					iElm.remove();
				}

				var insertImageMarkdownToEditor = function(image, callback){
					// get textarea element dari markdownmce controller
					var textarea = $('textarea', markdownmceCtrl.editorEl)[0];
					var start    = textarea.selectionStart;
					var end      = textarea.selectionEnd;
					// get title
					var title = image.title === undefined ? '' : image.title;
					// create markdown img syntax
					var markdownImg = '!['+ title +']('+ image.url +' "'+ title +'")';
					// set value textarea
					textarea.value = textarea.value.substring(0, start) + '\r' + markdownImg + '\r' + textarea.value.substring(end);
					// close modal
					$('.close', el).click();
					// refresh markdown preview
					markdownmceCtrl.refreshPreview();
					// call callback
					if(callback) callback();
				};
				var insertImageHTMLToEditor = function(image, callback){
					console.log(image);
					// ambil textarea element dari markdownmce controller
					var textarea = $('textarea', markdownmceCtrl.editorEl)[0];
					var start    = textarea.selectionStart;
					var end      = textarea.selectionEnd;
					// get title n create markdown img syntax
					var title = image.title === undefined ? '' : image.title;
					var alt   = image.alt === undefined ? title : image.alt;
					// create img element, dan set attribute src, alt n title
					var img = $('<img/>').attr({
						src  : image.url,
						alt  : alt,
						title: title
					});
					// set image width n height
					if(image.attrs !== undefined){
						img.css({
							width : image.attrs.width,
							height: image.attrs.height
						});
					}
					var imgHTML = img.prop('outerHTML');
					// set value textarea
					textarea.value = textarea.value.substring(0, start) + imgHTML + textarea.value.substring(end);
					// close modal
					$('.close', el).click();
					// set length img html 
					var length = imgHTML.length;
					// callback resizable
					var makeResizable = function(){
						var self = this;
						// update selectionEnd
						var end = start + length;
						// set focus textarea selection 
						textarea.selectionStart = start;
						textarea.selectionEnd   = end;
						textarea.focus();
						// image resizable (jquery ui)
						$('img', this.previewEl)
							.resizable({
								stop: function(e, ui) {
									var parent = ui.element.parent();
									ui.element.css({
										width : ui.element.width() / parent.width() * 100 + "%",
										height: ui.element.width() / parent.width() * 100 + "%"
									});
									// get img width n height 
									var w = $('img', ui.element).css('width');
									var h = $('img', ui.element).css('height');
									// change img sytle width n height 
									var selectedImg = $(textarea.value.substring(start, end)).css({width:w, height:h});
									// get string element
									var imgHTML = selectedImg.prop('outerHTML');
									// set textarea value
									textarea.value = textarea.value.substring(0, start) + imgHTML + textarea.value.substring(end);
									// update length
									length = imgHTML.length;
									// auto resizable
									// selama img tag masih focus pd editor
									markdownmceCtrl.refreshPreview(makeResizable);
								}
							});
					};
					// refresh markdown preview
					markdownmceCtrl.refreshPreview(makeResizable);
					// call callback
					if(callback) callback();
				};

				/* 
				 * Tab URL inject scope
				 * ----------------------------- 
				 */
				$scope.img = {};
				$scope.insertImageURL = function(){
					console.log($scope.img);
					insertImageHTMLToEditor($scope.img);
				};
				// event keypress n blur input url
				$('input[name="url"]', el)
					.on('keypress', function(){
						$('.img-preview').addClass('loading');
					})
					.on('blur',function(e){
						$('.img-preview').removeClass('loading');
						if($scope.imgForm.url.$valid){
							var imgUrl = e.currentTarget.value;
							$('.img-preview > .img').html('<img src="'+imgUrl+'">');
						}
					});

				/* 
				 * Tab Uploads inject scope
				 * ----------------------------- 
				 * multipleImageUpload
				 */

				// binding/inject $scope uploads button 
				var insertEditor = $scope.insertEditor = function(event){
					// get button
					var $button = $(event.currentTarget);
					// get image title
					var img_title = $button.siblings('input[name="img_title"]').val();
					// get image url
					var img_url   = $button.siblings('input[name="img_url"]').val();
					// create object
					var image = {
						url  : img_url,
						title: img_title
					};

					if( $('input[name="img_size"]').val() !== '' ){
						image['attrs'] = JSON.parse($('input[name="img_size"]').val());
					}

					// insert markdown image to editor
					/*insertImageMarkdownToEditor(image, function(){
						// hapus upload rows
						$button
							.parents('#upload-list')
							.find('.accordion-group').not(':first')
							.remove();

					});*/
					insertImageHTMLToEditor(image, function(){
						// hapus upload rows
						$button
							.parents('#upload-list')
							.find('.accordion-group').not(':first')
							.remove();

					});
				};
				var setFeatureImage = $scope.setFeatureImage = function(event){
					var imageURL      = $(event.currentTarget).siblings('input[type="hidden"]').val();
					var imageEl       = $('<img/>').attr('src', imageURL);
					var $featureImgEl = $('.image', $featureEl);

					if( $featureImgEl.length ) {
						$featureImgEl.find('img').remove();
						$featureImgEl.prepend(imageEl);
					} else {
						$featureEl
							.prepend('<div class="image">'+ imageEl.prop('outerHTML') +'</div>')
							.find('.image')
							.append($compile('<a href ng-click="removeFeatured($event)"><i class="icon-remove"></i></a>')($scope));
					}
					// change text button
					$('.btn-primary', $featureEl).text('Change Featured Image');
					// close modal
					$('.close', el).click();
				};
				var removeFeatured = $scope.removeFeatured = function(event){
					// remove featured image
					$(event.currentTarget).parent().remove();
					// change text button
					$('.btn-primary', $featureEl).text('Set Featured Image');
				};

				multipleImageUpload.init({
					ajaxurl: 'api/uploads',
					// compile upload row
					// setiap upload row yg ditambahkan(append) kedalam upload list
					// perlu compile ulang, utk inject $scope
					compile: {
						// inject $scope untuk upload row sebelum diupload 
						// @return upload row element
						before: function($uploadList, $uploadRow){
							return $compile($uploadRow[0])($scope).appendTo($uploadList);
						},
						// inject $scope setelah diupload
						// tambah images dari hasil upload
						after: function(image){
							$scope.$apply(function(scope){
								scope.phone.images.push(image.url);
								scope.phoneImages.push(image);
							});
						}
					}
					/* 
					 * binding uploads button dengan provider
					 *
					,
					binding: {
						insertEditor : insertEditor,
						setFeatured  : setFeatureImage,
						deleteImage  : removeFeatured
					}
					*/
				});
			};
		}
	};
})
.directive('calculateImageSize', function(){
	// Runs during compile
	return {
		scope: {
			img:'=image'
		}, // {} = isolate, true = child, false/undefined = no change
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/components/calculate-image-size.html',
		replace: true,
		controller: function($scope, $element, $attrs) {
			this.sizes = [{type:'small',percent: 25},{type:'medium',percent: 50}];
			this.calculate = function(d, percent){
				return {
					width: Math.round(d.width/100 * percent),
					height: Math.round(d.height/100 * percent)
				};
			};
		},
		link: function($scope, iElm, iAttrs, ctrl) {
			var d = $scope.img.image.dimensions;
			var calcDimensions = [];
			angular.forEach(ctrl.sizes, function(e){
				calcDimensions.push({
					type: e.type,
					dimension: ctrl.calculate(d, e.percent)
				});
			});
			calcDimensions.push({
				type:'original',
				dimension:d
			});
			$scope.dimensions = calcDimensions;

			$scope.setSize = function(index){
				var dimension = calcDimensions[index].dimension;
				console.log(dimension);
				$('input[name="img_size"]').val(JSON.stringify(dimension));
			};
		}
	};
})

/**
 * mceyoutube component 
 * restrict Element
 * requires : markdownmce, tbmodal
 * 
 * insert youtube video utk markdown editor
 * search youtube videos
 */

.directive('mceyoutube', function($compile, $filter){
	// Runs during compile
	return {
		require: ['^markdownmce', '^tbmodal'],
		scope: {}, // {} = isolate, true = child, false/undefined = no change
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'partials/components/mceyoutube.html',
		replace: true,
		link: function($scope, iElm, iAttrs, controller) {
			// set controller dari require controller
			var markdownmceCtrl = controller[0];
			var bootstrapCtrl   = controller[1];

			// set scope dari attributes
			$scope.orderBy  = iAttrs.order === undefined ? 'relevance'  : iAttrs.order;
			$scope.searchBy = iAttrs.search === undefined ? 'relevance' : iAttrs.search;

			// initialize jquery tube
			jQTubeUtil.init({
				key: "AI39si6-gftpN8gxptc0AhEiB8__DVzKgS_FNlHruCZaLwZgNbabeNcltQ9nUjyytTmfNqFwNDKBZxI0nllXIXqnEO4unbSCsw",
				orderby: "viewCount",  // *optional -- "viewCount" is set by default
				time: "this_month",   // *optional -- "this_month" is set by default
				maxResults: 10   // *optional -- defined as 10 results by default
			});

			$scope.changeOrder = function(orderBy, searchBy){
				$scope.orderBy  = orderBy;
				$scope.searchBy = searchBy;
			};

			$scope.disabled = false;
			$scope.searchVideos = function(){
				var inputSearch = $('input[name="query"]', iElm);
				var search = inputSearch.val().trim();
				if(search === ''){
					inputSearch.addClass('invalid');
					return false;
				}

				$('.btn-search').button('loading');
				$scope.disabled = true;
				var param = {
					"q": search,
					"orderby": $scope.orderBy
				};
				jQTubeUtil.search(param, function(response){
					console.log(response);
					$scope.videos = response.videos;
					// untuk menampilkan smooth result
					// maka element iframe tidak disertakan pada html template
					// penambahan iframe akan dihandle 'selectVideo'
					var html = '<div class="media" ng-repeat="video in videos" ng-dblick="insertVideo($index)" ng-click="selectVideo($event, $index)" ng-class="{well:isSelected($index)}">' +
									'<div class="pull-left">' +
										'<img class="media-object" ng-hide="isSelected($index)" ng-src="{{video.thumbs[0].url}}" width="130" height="97">' +
										// '<iframe width="480" height="360" ng-show="isSelected($index)" ng-src="http://www.youtube.com/embed/{{video.videoId}}" frameborder="0" allowfullscreen></iframe>' +
									'</div>' +
									'<div class="media-body">' +
										'<h4 class="media-heading">{{video.title}}</h4>' +
										'<small>{{searchBy}} ' +
											'[{{video.duration|duration}}] ' +
											'by <em>{{video.entry.author[0].name.$t}}</em> ' +
											'on {{video.updated|date:\'mediumDate\'}}' +
										'</small>' +
										'<p>{{video.description}}</p>'+
										'<p ng-show="isSelected($index)">'+
										'<button class="btn btn-primary" ng-click="insertVideo($index)">Insert Video</button>'+
										'</p>'+
									'</div>' +
								'</div>';
					// compile ulang
					html = $compile(html)($scope);
					$('.youtube-videos', iElm).html(html);

					var btnSearch = $compile('<span>Search by {{searchBy}}</span>')($scope);
					$('.btn-search').button('reset').html(btnSearch);

					$scope.$apply(function(scope){
						$scope.disabled = false;
					});
				});
			};

			var selectedVideo = -1;
			$scope.selectVideo = function(evt, index){
				selectedVideo = index;
				// tambahkan youtube iframe saat baris media selected
				// abaikan(return), jika iframe sudah ada
				var $media = $(evt.currentTarget);
				if($media.find('iframe').length) return;
				// create youtube iframe
				var iframe = document.createElement('iframe');
				iframe.src = 'http://www.youtube.com/embed/'+$scope.videos[index].videoId;
				iframe.width = 480;
				iframe.height = 360;
				// set atrribute directive show
				iframe.setAttribute('ng-show', 'isSelected('+ index +')');
				iframe.frameborder = 0;
				iframe.allowfullscreen = true;
				// compile iframe, karena menggunakan directive ngShow
				iframe = $compile(iframe)($scope);
				// tambahkan iframe
				$media.find('.pull-left').append(iframe);
			};
			$scope.isSelected = function(index){
				return selectedVideo === index;
			};

			// double click
			$scope.insertVideo = function(index){
				// buat youtube url
				var youtubeURL = 'http://youtube.com/watch?v='+ $scope.videos[index].videoId;
				// buat youtube video tag
				var videoTag = '<video width="483" height="269">'+
									'<source type="video/youtube" src="'+youtubeURL+'" />'+
								'</video>';
				// ambil textarea element dari markdownmce controller
				var textarea   = $('textarea', markdownmceCtrl.editorEl);
				// tambahkan video tag kedalam textarea
				var start    = textarea[0].selectionStart;
				var end      = textarea[0].selectionEnd;
				textarea.val(
					textarea.val().substring(0, start) +
					'\r' + videoTag + '\r' +
					textarea.val().substring(end)
				);
				// ambil modal element dari bootstrapModal controller
				// close modal
				$('.close', bootstrapCtrl.element).click();
				// refresh markdown preview
				markdownmceCtrl.refreshPreview();
			};

		}
	};
});