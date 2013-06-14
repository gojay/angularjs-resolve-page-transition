
/* Config */

angular.module('MyApp', ['PhoneProvider', 'PhoneControllers', 'PhoneDirectives', 'PhoneServices', 'PhoneFilters'])
	.config(['$routeProvider', 'debugProvider','pageTransitionProvider', 'imageUploadProvider', 'multipleImageUploadProvider',
		function($routeProvider, debugProvider, pageTransitionProvider, imageUploadProvider, multipleImageUploadProvider) {
			// enable/disable debuging
			debugProvider.setDebug(true);

			// config transition 
			pageTransitionProvider.setStartTransition('expandIn');
			pageTransitionProvider.setPage('#ngView');
			pageTransitionProvider.setPageTransition('slide');

			// route
			$routeProvider.
				when('/phones', {
					templateUrl: 'partials/phoneList.html',
					controller: 'PhoneListController',
					resolve: {
						phones: function($q, Phone) {
							var deffered = $q.defer();
							Phone.query(function(data) {
								deffered.resolve(data);
							}, function(err) {
								deffered.reject(err);
							});
							return deffered.promise;
						},
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 2000);
							return delay.promise;
						}
					}
				}).
				when('/phone/:phoneId', {
					templateUrl: 'partials/phoneDetail.html',
					controller: 'PhoneDetailController',
					resolve: {
						phone: function($q, $route, Phone) {
							var deffered = $q.defer();
							Phone.get({
								phoneId: $route.current.params.phoneId
							}, function(data) {
								deffered.resolve(data);
							}, function(err) {
								deffered.rejection(err);
							});
							return deffered.promise;
						},
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 2000);
							return delay.promise;
						}
					}
				}).
				when('/phone/edit/:phoneId', {
					templateUrl: 'partials/phoneEdit.html',
					controller: 'PhoneEditController',
					resolve: {
						phone: function($q, $route, Phone) {
							var deffered = $q.defer();
							Phone.get({
								phoneId: $route.current.params.phoneId
							}, function(data) {
								deffered.resolve(data);
							}, function(err) {
								deffered.rejection(err);
							});
							return deffered.promise;
						},
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 2000);
							return delay.promise;
						}
					}
				}).
				otherwise({
					redirectTo: '/phones'
				});
		}
	]);
