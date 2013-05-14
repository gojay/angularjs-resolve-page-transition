
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
	});
