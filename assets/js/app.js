/**
 * MyApp Module
 *
 */
var MyApp = angular.module('MyApp', ['PhoneDirectives', 'PhoneServices', 'PhoneFilters']);

/* Provider */

MyApp.provider('pageTransition', function(){
	// default
	this.selector        = 'body';
	this.startTransition = 'rotateInRight';
	this.pageTransition  = 'slide';
	this.transition      = {};

	this.setStartTransition = function(startTransition){
		this.startTransition = startTransition;
	};
	this.setPage = function(selector){
		this.selector = selector;
	};
	this.setPageTransition = function(type){
		this.pageTransition = type;
		switch(this.pageTransition){
			case 'whirl':
				this.transition._in = 'whirlIn';
				this.transition.out = 'whirlOut';
				break;

			case 'rotate':
				this.transition._in = 'rotateInLeft';
				this.transition.out = 'rotateOutLeft';
				break;

			case 'tumble':
				this.transition._in = 'tumbleIn';
				this.transition.out = 'tumbleOut';
				break;

			default     :
			case 'slide':
				this.transition._in = 'slideInSkew';
				this.transition.out = 'slideOutSkew';
				break;
		}
	};

	this.$get = function(){
		var selector        = this.selector;
		var startTransition = this.startTransition;
		var pageTransition  = this.pageTransition;
		var classOut        = this.transition.out;
		var classIn         = this.transition._in;
		return {
			isPerspective: function(){
				var perspective = ['whirl', 'rotate', 'tumble'];
				return perspective.indexOf(pageTransition) != -1 ;
			},
			getElement: function(){
				if(selector == 'body' || angular.equals($(selector), [])) return $('body');

				console.log('pageTransition', pageTransition, this.isPerspective());
				if( this.isPerspective() ){
					var height    = $('body').height();
					var top       = $(selector).offset().top;
					var setHeight = height - top;
					$(selector).css('height', setHeight + 'px');
				}

				return $(selector);
			},
			start: function(){
				$('body').addClass(startTransition);
				setTimeout(function(){
					console.log('change body css');
					$('html').css({'height':'auto', 'overflow':'auto'});
					$('body').css({'height':'auto', 'overflow':'auto'});
				}, 1200);
			},
			change: function(){
				var self = this;
				var $page = this.getElement();
				// http://api.jquery.com/delay/
				// http://api.jquery.com/queue/
				$page.addClass(classOut).delay(1000).queue(function(next) {

					$(this).removeClass(classOut);
					$(this).addClass(classIn);

					setTimeout(function() {
						if( self.isPerspective() ){
							$page.css('height', '100%');
						}
					}, 1000);

					next();
				});
			}
		};
	};
});

/* Config */

MyApp.config(['$routeProvider', 'pageTransitionProvider', function($routeProvider, pageTransitionProvider) {
	// transition config
	pageTransitionProvider.setStartTransition('rotateInLeft');
	pageTransitionProvider.setPage('#ngView');
	pageTransitionProvider.setPageTransition('slide');
	// route
	$routeProvider.
		when('/phones', {
			templateUrl: 'partials/phoneList.html',
			controller: PhoneListController,
			resolve: PhoneListController.resolve
		}).
		when('/phone/:phoneId', {
			templateUrl: 'partials/phoneDetail.html',
			controller: PhoneDetailController,
			resolve: PhoneDetailController.resolve
		}).
		otherwise({
			redirectTo: '/phones'
		});
}]);

/* ========================================= Directive ========================================= */

angular.module('PhoneDirectives', []).
	directive('loader', function($rootScope, $timeout, $log, pageTransition) {
		// Runs during compile
		return {
			restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
			templateUrl: 'partials/loader.html',
			replace: true,
			link: function($scope, iElm, iAttrs, controller) {

				// start page transition untuk pertam kali
				pageTransition.start();

				$rootScope.$on('$routeChangeStart', function(event, next, current) {
					$log.info('route starting...');
					$scope.isShow = true;
					$scope.loaderClass = 'load';
					$scope.alertClass = '';
					$scope.textInfo = 'Loading';

					/*$transtionPage.addClass("slideOutSkew").delay(1000).queue(function(next) {
						$(this).removeClass("slideOutSkew");
						$(this).addClass("slideInSkew");
						next();
					});*/

					pageTransition.change();

				});
				$rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
					$log.info('route success');
					$scope.isShow = false;

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
					$scope.isShow = true;
					$scope.loaderClass = 'error';
					$scope.alertClass = 'alert alert-error';
				});
			}
		};
	})
	.directive('tabs', function(){
		// Runs during compile
		return {
			restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
			scope: {}, // {} = isolate, true = child, false/undefined = no change
			replace: true,
			transclude: true,
			templateUrl: 'partials/tabs.html',
			controller: function($scope, $element, $attrs) {
				var panes = $scope.panes = [];

				$scope.select = function(pane){
					angular.forEach(panes, function(pane){
						pane.selected = false;
					});
					pane.selected = true;
				};

				this.addPane = function(pane){
					if(panes.length === 0) $scope.select(pane);
					panes.push(pane);
				};
			}
		};
	})
	.directive('pane', function(){
		// Runs during compile
		return {
			require: '^tabs', // Array = multiple requires, ? = optional, ^ = check parent elements
			restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
			scope: {
				title: '@'
			}, // {} = isolate, true = child, false/undefined = no change
			template: '<div class="tab-pane" ng-class="{active:selected}" ng-transclude></div>',
			replace: true,
			transclude: true,
			link: function($scope, iElm, iAttrs, tabsCtrl) {
				tabsCtrl.addPane($scope);
			}
		};
	});

/* ========================================= Filters ========================================= */

angular.module('PhoneFilters', []).
filter('checkmark', function() {
	return function(input) {
		return input ? '\u2713' : '\u2718';
	};
});

/* ========================================= Services ========================================= */

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
});

/*
var baseUrl = 'http://dev.angularjs/angular-phonecat/app/phones';

angular.module('PhoneServices', []).
	factory('Phone', function($http){
		var Phone = function(data) {
			angular.copy(data, this);
		};

		Phone.query = function(){
			return $http.get(baseUrl + '/phones.json').then(makeArray(Phone));
		};

		Phone.get = function(id){
			return $http.get(baseUrl + '/' + id + '.json').then(instantiate(Phone));
		};

		return Phone;
	});

function makeArray(Type){
	return function(response){
		var list = [];
		angular.forEach(response.data, function(data){
			list.push(new Type(data));
		});
		return list;
	};
}

function instantiate(Type){
	return function(response){
		return new Type(response.data);
	};
}
*/

/* ========================================= Controllers ========================================= */

// var baseUrl = 'http://dev.angularjs/angular-phonecat/app/phones';

function PhoneListController($scope, phones) {

	/*$http.get(baseUrl + '/phones.json').then(function(result){
		$scope.phones = result.data;
	});*/

	$scope.phones = phones;
	$scope.orderProp = 'age';
}

PhoneListController.resolve = {
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
		$timeout(delay.resolve, 1000);
		return delay.promise;
	}
};

function PhoneDetailController($scope, phone) {

	/*$http.get(baseUrl + '/' + $routeParams.phoneId + '.json').then(function(result){
		$scope.phone = result.data;
		$scope.mainImageUrl = $scope.phone.images[0];
	});

	$scope.phone = Phone.get({ phoneId:$routeParams.phoneId }, function(phone){
		$scope.mainImageUrl = phone.images[0];
	});
	*/

	$scope.phone = phone;
	$scope.mainImageUrl = phone.images[0];
	$scope.setImage = function(img) {
		$scope.mainImageUrl = img;
	};
}

PhoneDetailController.resolve = {
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
		$timeout(delay.resolve, 1000);
		return delay.promise;
	}
};