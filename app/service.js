
/**
 * PhoneServices Module
 *
 * Description
 */

 angular.module('PhoneServices', ['ngResource']).
	factory('Phones', function($resource) {
		return $resource('api/phones/:phoneId', {}, {
			get: {
				method: 'GET',
				isArray: true
			},
			update : {
				method: 'PUT'
			}
		});
	}).
	factory('Phone', function($resource) {
		/*return $resource('phones/:phoneId.json', {}, {
			query: {
				method: 'GET',
				params: {
					phoneId: 'phones'
				},
				isArray: true
			}
		});*/
		return $resource('api/phone/:phoneId', {}, {
			query: {
				method: 'GET',
				isArray: true
			},
			update : {
				method: 'PUT'
			}
		});
	}).
	factory('PhoneImage', function($resource) {
		return $resource('api/phone/images/:imageId', {}, {
			get: {
				method: 'GET',
				isArray: true
			},
			remove: {
				method: 'DELETE'
			}
		});
	});