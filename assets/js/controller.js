
/**
 * PhoneControllers Module
 *
 * Description
 */

 angular.module('PhoneControllers', [])
	.controller('PhoneListController', function($scope, phones){
		$scope.cart      = 'Empty';
		$scope.phones    = phones;
		$scope.orderProp = 'age';
	})
	.controller('PhoneDetailController', function($scope, phone){
		$scope.phone        = phone;
		$scope.mainImageUrl = phone.images[0];

		$scope.setImage = function(img) {
			$scope.mainImageUrl = img;
		};
	})
	.controller('PhoneEditController', function($scope, phone){
		$scope.phone = phone;
	});