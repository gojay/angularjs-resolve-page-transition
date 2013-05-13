
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
	factory('Upload', function($resource){
		return $resource('api/upload.php?action=get', {}, {
			get: {
				method: 'GET',
				isArray: true
			}
		});
	});