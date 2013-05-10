var MultipleUploads;

var CHUNK_MB = 1048576; // 1mB 1024*1024
var CHUNK_KB = 262144;  // 256kb 1024 * 256
var _blobSize    = [],
	_chunkSlices = [],
	_chunkIndex  = [],
	_chunkFiles  = [];

(function($){

	MultipleUploads = {

		debug: function(bool){
			var consoleHolder = console;
			if (!bool) {
				consoleHolder = console;
				console = {};
				console.log = function() {};
			} else console = consoleHolder;
		},

		init: function(options){
			var self = this;

			var defaults = {
				ajaxurl    : 'upload.php',
				debug      : 'true',
				dropArea   : '#drop-area',
				inputFile  : '#input-files',
				uploadList : '#upload-accordion',
				uploadRow  : '.accordion-group'
			};

			var config = self.config = $.extend(defaults, options);
			this.debug(config.debug);

			var buttonFileId = config.inputFile + '-button';
			$(config.dropArea).prepend('<button id="'+ buttonFileId +'" class="btn">Upload Files</button>');
			$(buttonFileId).click(function() {
				$(config.inputFile.selector).click();
			});

			// input file event

			$(config.inputFile).bind('change', function(evt){
				var files = evt.target.files;
				self.handleMultipleFiles(files);
			});

			// drag n drop events

			$(config.dropArea)
				.bind('drop', function(evt){
					evt.stopPropagation();
					evt.preventDefault();

					$(this).removeClass('over');

					var original = evt.originalEvent,
						files    = original.dataTransfer.files;

					console.log('drop original', original);

					self.handleMultipleFiles(files);
				})
				.bind('dragover', function(evt) {
					evt.stopPropagation();
					evt.preventDefault();
				})
				.bind('dragenter', function(evt) {
					evt.stopPropagation();
					evt.preventDefault();
					$(evt.currentTarget).addClass('over');
				})
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
						// progress bar element
						var $progressBar = $('.progress > .bar', $uploadRow);

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
								.text(theFile.name);
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
							var $uploadImg = $('.upload-img', el);
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
						// append to upload groups
						$uploadList.append($uploadRow);

						// upload file
						self.createChunkfile(theFile, $progressBar, function(dataUri) {
							$('.accordion-body', $uploadRow).removeClass('uploading');
							setTimeout(function(){
								$('.alert', $uploadRow)
									.removeClass('show-message')
									.addClass('show-buttons');
							}, 3090);
						});
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

})(jQuery);
