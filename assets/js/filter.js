
/**
 * PhoneFilters Module
 *
 * Description
 */

 angular.module('PhoneFilters', []).
	filter('checkmark', function() {
		return function(input) {
			return input ? '\u2713' : '\u2718';
		};
	});
