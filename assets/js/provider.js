
/**
 * PhoneProvider Module
 *
 * Description
 */

angular.module('PhoneProvider', [])
	.provider('debug', function(){
		var isActive = false;

		this.setDebug = function(isActive) {
			isActive = isActive;
			var consoleHolder = console;
			if (isActive === false) {
				consoleHolder = console;
				console       = {};
				console.log   = function() {};
			}
			else console = consoleHolder;
		};

		this.$get = function(){
			return;
		};
	})
	.provider('pageTransition', function(){
		// default
		this.selector        = 'body';
		this.startTransition = 'rotateInRight';
		this.pageTransition  = 'slide';
		this.transition      = {};

		this.setStartTransition = function(startTransition){
			this.startTransition = startTransition;
		};
		this.setPage = function(selector){
			this.selector = selector;
		};
		this.setPageTransition = function(type){
			this.pageTransition = type;
			switch(this.pageTransition){
				case 'whirl':
					this.transition._in = 'whirlIn';
					this.transition.out = 'whirlOut';
					break;

				case 'rotate':
					this.transition._in = 'rotateInLeft';
					this.transition.out = 'rotateOutLeft';
					break;

				case 'tumble':
					this.transition._in = 'tumbleIn';
					this.transition.out = 'tumbleOut';
					break;

				default     :
				case 'slide':
					this.transition._in = 'slideInSkew';
					this.transition.out = 'slideOutSkew';
					break;
			}
		};

		this.$get = function(){
			var selector        = this.selector;
			var startTransition = this.startTransition;
			var pageTransition  = this.pageTransition;
			var classOut        = this.transition.out;
			var classIn         = this.transition._in;
			return {
				isPerspective: function(){
					var perspective = ['whirl', 'rotate', 'tumble'];
					return perspective.indexOf(pageTransition) != -1 ;
				},
				getElement: function(){
					if(selector == 'body' || angular.equals($(selector), [])) return $('body');

					console.log('pageTransition', pageTransition, this.isPerspective());
					if( this.isPerspective() ){
						var height    = $('body').height();
						var top       = $(selector).offset().top;
						var setHeight = height - top;
						$(selector).css('height', setHeight + 'px');
					}

					return $(selector);
				},
				start: function(){
					$('body').addClass(startTransition);
					setTimeout(function(){
						console.log('change html, body css');
						$('html').css({'height':'auto', 'overflow':'auto', 'background':'#fff'});
						$('body').css({'height':'auto', 'overflow':'auto'}).removeClass(startTransition);
					}, 1200);
				},
				change: function(){
					var self  = this;
					var $page = this.getElement();
					// http://api.jquery.com/delay/
					// http://api.jquery.com/queue/
					$page.addClass(classOut).delay(1000).queue(function(next) {

						$(this).removeClass(classOut);
						$(this).addClass(classIn);

						setTimeout(function() {
							if( self.isPerspective() ){
								$page.css('height', '100%');
							}
						}, 1000);

						next();
					});
				}
			};
		};
	})
	/*
	 * multipleImageUpload Provider
	 * 
	 * multiple images upload
	 * 
	 * input file multiple
	 * drag drop multiple
	 */
	.provider('multipleImageUpload', function(){

		this.$get = function(){
			var CHUNK_MB = 1048576; // 1mB 1024*1024
			var CHUNK_KB = 262144;  // 256kb 1024 * 256
			var _blobSize    = [],
				_chunkSlices = [],
				_chunkIndex  = [],
				_chunkFiles  = [];
			return {
				init: function(options){
					var self = this;

					var defaults = {
						ajaxurl    : 'upload.php',
						dropArea   : '#drop-area',
						inputFile  : '#input-files',
						uploadList : '#upload-accordion',
						uploadRow  : '.accordion-group',
						binding    : null,
						compile    : null
					};
					// auto merge options
					var config = self.config = $.extend(defaults, options);

					// create button file for better input file
					var buttonFileId = config.inputFile + '-button';
					$(config.dropArea).prepend('<button id="'+ buttonFileId.replace(/\#/, '') +'" class="btn">Upload Files</button>');
					// event button file 
					$(buttonFileId).click(function() {
						$(config.inputFile).click();
					});

					// event input file 

					$(config.inputFile).bind('change', function(evt){
						var files = evt.target.files;
						self.handleMultipleFiles(files);
					});

					// drag n drop events

					$(config.dropArea)
						// event drop 
						.bind('drop', function(evt){
							evt.stopPropagation();
							evt.preventDefault();

							$(this).removeClass('over');

							var original = evt.originalEvent,
								files    = original.dataTransfer.files;

							console.log('drop original', original);

							self.handleMultipleFiles(files);
						})
						// event drag over
						.bind('dragover', function(evt) {
							evt.stopPropagation();
							evt.preventDefault();
						})
						// event drag enter
						// add class over
						.bind('dragenter', function(evt) {
							evt.stopPropagation();
							evt.preventDefault();
							$(evt.currentTarget).addClass('over');
						})
						// event drag leave
						// remove class over
						.bind('dragleave', function(evt) {
							evt.stopPropagation();
							evt.preventDefault();

							var target = evt.target;
							if (target && target === this) {
								$(this).removeClass('over');
							}
						});
				},

				handleMultipleFiles: function(files){
					var self = this;
					var $uploadList = $(this.config.uploadList);

					$uploadList.parent().removeClass('hide');

					for (var i = 0; i < files.length; i++)
					{
						var file = files[i];
						if (!file.type.match('image.*')) continue;

						var fr = new FileReader();
						fr.onload = (function(theFile) {
							// console.log('onload', theFile);
							return function(e) {
								// clone upload row
								var $uploadRow  = $(self.config.uploadRow + ':last', $uploadList).clone();

								// file size prettyfy
								var sizePretty = (theFile.size > 1024 * 1024) ?
													(Math.round(theFile.size * 100 / (1024 * 1024)) / 100).toString() + 'MB' :
													(Math.round(theFile.size * 100 / 1024) / 100).toString() + 'KB';
								// create description element				
								var desc = '<dl>' +
												'<dt>File Name</dt>' +
												'<dd>' + theFile.name + '</dd>' +
												'<dt>File Type</dt>' +
												'<dd>' + theFile.type + '</dd>' +
												'<dt>File Size</dt>' +
												'<dd>' + sizePretty + '</dd>' +
											'</dl>';
								// upload image			
								var $uploadImg = $('.upload-img', $uploadRow);

								// customize upload row
								$uploadRow.each(function(i,el) {
									// increase anchor accordion toggle
									// set file name as title header
									$('.accordion-toggle', el)
										.attr('href', function(index, id) {
											return id.replace(/(\d+)/, function(fullMatch, n) {
												return Number(n) + 1;
											});
										})
										.text(theFile.name.split('.')[0]);
									// increase id accordion body
									// add class 'in uploading'
									$('.accordion-body', el)
										.attr('id', function(index, id) {
											return id.replace(/(\d+)/, function(fullMatch, n) {
												return Number(n) + 1;
											});
										})
										.addClass('in uploading');

									// add/update image
									if( $('img', $uploadImg).length ){
										$('img', $uploadImg).attr('src', e.target.result);
									} else {
										// create img element
										var image = document.createElement('img');
										image.src = e.target.result;
										$($uploadImg).html(image);
									}
									// remove description
									$('dl', el).remove();
									// append description
									$uploadImg.next().append(desc);
								});

								// collapse all, if the files just 1
								if(files.length === 1){
									$('.accordion-group .accordion-toggle').each(function(i,e){
										$(e).click();
									});
								}

								var $progressBar;
								if(self.config.compile)
								{
									// append to group
									$uploadRow = self.config.compile.before($uploadList, $uploadRow);
									// progress bar element
									$progressBar = $('.progress > .bar', $uploadRow);
									// upload file
									self.createChunkfile(theFile, $progressBar, function(data) {
										// compile after uploaded (merge)
										self.config.compile.after(data.image);
										// set title ke input hidden
										$('input[name="img_title"]', $uploadRow).val(data.name);
										// set image url ke input hidden
										$('input[name="img_url"]', $uploadRow).val(data.image);
										// upload is done! so remove class uploading
										$('.accordion-body', $uploadRow).removeClass('uploading');
										setTimeout(function(){
											$('.alert', $uploadRow)
												.removeClass('show-message')
												.addClass('show-buttons');
										}, 3000);
									});
								}
								else {
									// append to group
									$uploadList.append($uploadRow);
									// progress bar element
									$progressBar = $('.progress > .bar', $uploadRow);
									// upload file
									self.createChunkfile(theFile, $progressBar, function(data) {
										// upload is done! so remove class uploading
										$('.accordion-body', $uploadRow).removeClass('uploading');

										// set binding
										if(self.config.binding)
										{
											var binding = self.config.binding;
											// binding 'insert to editor' 
											$('.buttons .insert-editor', $uploadRow).click(function(evt){
												var title = $('.accordion-toggle', $uploadRow).text();
												binding.insertEditor(this, data.image, data.name);
											});
											// binding 'set featured image' 
											$('.buttons .set-featured', $uploadRow).click(function(evt){
												binding.setFeatured(this, data.image);
											});
											// binding 'delete image' 
											$('.buttons .delete-image', $uploadRow).click(function(evt){
												binding.deleteImage(this, $uploadRow);
											});
										}

										setTimeout(function(){
											$('.alert', $uploadRow)
												.removeClass('show-message')
												.addClass('show-buttons');
										}, 3000);
									});
								}
							};
						})(file);

						// read as data url
						fr.readAsDataURL(file);
					}
				},

				createChunkfile: function(blob, progressBar, callback){
					var self  = this;
					var start = 0, end = 0;
					var BYTES_PER_CHUNK ;

					console.log('%cuploadMultipleFiles', 'color:red;', blob.name);

					_blobSize[blob.name] = blob.size;
					console.log('size', blob.size);

					// BYTES_PER_CHUNK = ( blob.size < CHUNK_MB) ? CHUNK_KB : CHUNK_MB;
					// end = BYTES_PER_CHUNK;
					BYTES_PER_CHUNK = end = CHUNK_KB;

					// set jumlah potongan file (chunk) sesuai nama file
					_chunkSlices[blob.name] = Math.ceil(blob.size / BYTES_PER_CHUNK);
					console.log('slices', _chunkSlices);

					_chunkIndex[blob.name] = 0;
					_chunkFiles[blob.name] = 0;
					// looping upload file
					while (start < blob.size) {
						console.log('start = %d; end = %d', start, end);

						self.uploadFile(blob, start, end, progressBar, callback);

						start = end;
						end   = start + BYTES_PER_CHUNK;

						_chunkIndex[blob.name]++;
					}
				},

				uploadFile : function(blob, start, end, progressBar, callback) {
					// console.log('upload file', blob.name)
					var self  = this;

					// slice file
					var chunk;
					if (blob.webkitSlice) {
						console.log('webkitSlice');
						chunk = blob.webkitSlice(start, end);
					} else if (blob.mozSlice) {
						console.log('mozSlice');
						chunk = blob.mozSlice(start, end);
					} else {
						console.log('slice');
						chunk = blob.slice(start, end);
					}

					// object xmlhttprequest
					var xhr = new XMLHttpRequest();

					xhr.open('POST', this.config.ajaxurl, true);

					// onload event
					xhr.onload= function(e) {
						console.log('onload', e);
						// status ok
						if (this.status == 200) {
							// parse JSON response
							var response = JSON.parse(this.response);
							var file     = response.file;

							// console.log('response', file)
							console.log("Chunk size " + file.size + " uploaded successfully");

							// set chunk files (increase)
							_chunkFiles[blob.name] += file.size;
							// buat hitungan persentase
							var percent = Math.round((_chunkFiles[blob.name] / _blobSize[blob.name]) * 100);

							console.log(
								'progress:%d => size:%d, percent:%s',
								_chunkFiles[blob.name],
								_blobSize[blob.name],
								percent + '%'
							);

							// set progress dgn persentase
							progressBar.css('width', percent + '%');
							progressBar.text(percent + '%');

							console.log(percent + '%');

							// decrease chunkFiles
							_chunkSlices[blob.name]--;

							// complete
							if (_chunkSlices[blob.name] === 0 && percent >= 100) {
								console.log('mergeFile');

								//progressBar.css('width', '100%');
								//progressBar.text('100%');

								// merging files
								self.mergeFiles(blob, function(dataUri) {
									// callback
									if (callback) callback(dataUri);
								});
							}

						}
					};

					// set form data
					var fd = new FormData();
					fd.append('action', 'chunk');
					fd.append('file', chunk);
					fd.append('name', blob.name);
					fd.append('index', _chunkIndex[blob.name]);

					// send
					xhr.send(fd);
				},

				mergeFiles: function(blob, callback) {
					var fd = new FormData();
					fd.append('action', 'merge');
					fd.append('name', blob.name);
					fd.append('type', blob.type);
					fd.append('index', _chunkIndex[blob.name]);

					var xhr = new XMLHttpRequest();
					xhr.open('POST', this.config.ajaxurl, true);
					xhr.onload = function() {
						if (this.status == 200) {
							var response = JSON.parse(this.response);
							if (callback) callback(response);
						}
					};

					xhr.send(fd);
				}
			};
		};
	});