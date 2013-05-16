angular.module('PhoneDirectives', [])
	.directive('loader', function($rootScope, $timeout, $log, pageTransition) {
		// Runs during compile
		return {
			restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
			templateUrl: 'partials/components/loader.html',
			replace: true,
			link: function($scope, iElm, iAttrs, controller) {

				// start page transition untuk pertama kali
				pageTransition.start();

				$rootScope.$on('$routeChangeStart', function(event, next, current) {
					$log.info('route starting...');
					$scope.isShow      = true;
					$scope.loaderClass = 'load';
					$scope.alertClass  = '';
					$scope.textInfo    = 'Loading';

					// page transition saat pindah halaman
					pageTransition.change();

				});
				$rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
					$log.info('route success');
					$scope.isShow   = false;
					$scope.textInfo = 'Loaded';

					/*
					 * tampilkan 'message' saat page sudah tampil
					 * 
					$scope.loaderClass = 'loaded';
					$scope.alertClass  = 'alert alert-success';
					$timeout(function(){
						$scope.isShow = false;
					}, 3000);
					*/
				});
				$rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
					$log.error('route error', rejection);
					$scope.isShow      = true;
					$scope.loaderClass = 'error';
					$scope.alertClass  = 'alert alert-error';
					$scope.textInfo    = 'Error Occured';
				});
			}
		};
	});