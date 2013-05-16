
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
		return $resource('api/images/:imgId', {}, {
			query: {
				method: 'GET',
				params: {
					imgId: 1
				},
				isArray: true
			},
			update: {
				method: 'PUT',
				isArray: true
			},
			remove: {
				method: 'DELETE'
			}
		});
	});