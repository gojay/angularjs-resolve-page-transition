
/**
 * PhoneServices Module
 *
 * Description
 */

 angular.module('PhoneServices', ['ngResource']).
	factory('Phone', function($resource) {
		return $resource('phones/:phoneId.json', {}, {
			query: {
				method: 'GET',
				params: {
					phoneId: 'phones'
				},
				isArray: true
			}
		});
	}).
	factory('PhoneImage', function($resource) {
		return $resource('api/upload.php?action=:action', {}, {
			query: {
				method: 'GET',
				params: {
					action: 'get'
				},
				isArray: true
			}
		});
	});