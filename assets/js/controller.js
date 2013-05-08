// var baseUrl = 'http://dev.angularjs/angular-phonecat/app/phones';

function PhoneListController($scope, phones) {

	/*$http.get(baseUrl + '/phones.json').then(function(result){
		$scope.phones = result.data;
	});*/

	$scope.cart      = 'Empty';
	$scope.phones    = phones;
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

	$scope.phone        = phone;
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

function PhoneEditController($scope, phone){
	$scope.phone = phone;
}

PhoneEditController.resolve = {
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