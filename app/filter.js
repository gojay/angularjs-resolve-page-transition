
/**
 * PhoneFilters Module
 *
 * Description
 */

 angular.module('PhoneFilters', [])
	.filter('checkmark', function() {
		return function(input) {
			return input ? '\u2713' : '\u2718';
		};
	})
	.filter('fileSize', function(){
		return function(size){
			return (size > 1024 * 1024) ?
				(Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB' :
				(Math.round(size * 100 / 1024) / 100).toString() + 'KB';
		};
	})
	.filter('getFilename', function(){
		return function(path){
			return path.substr(0, path.lastIndexOf('.')).replace(/^.*[\\\/]/, '');
		};
	})
	.filter('duration', function(){
		return function(sec){
			var toHHMMSS = function(sec) {
				sec_numb = parseInt(sec, 10); // don't forget the second parm
				var hours = Math.floor(sec_numb / 3600);
				var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
				var seconds = sec_numb - (hours * 3600) - (minutes * 60);

				if (hours < 10) {
					hours = "0" + hours;
				}
				if (minutes < 10) {
					minutes = "0" + minutes;
				}
				if (seconds < 10) {
					seconds = "0" + seconds;
				}
				var time = hours + ':' + minutes + ':' + seconds;
				return time;
			};
			return toHHMMSS(sec);
		};
	});
