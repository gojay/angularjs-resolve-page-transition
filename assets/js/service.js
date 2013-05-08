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