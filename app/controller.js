
/**
 * PhoneControllers Module
 *
 * Description
 */

 angular.module('PhoneControllers', [])
	.controller('PhoneListController', function($scope, phones, Phones){
		$scope.cart      = 'Empty';
		$scope.phones    = phones;
		$scope.orderProp = 'age';

		$scope.save = function(){
			var phones = new Phones({
				name : 'name',
				description : 'lorem ipsum',
				meta: {
					"android": {
						"os": "Android 2.2",
						"ui": "Dell Stage"
					},
					"availability": [
						"AT&amp;T,",
						"KT,",
						"T-Mobile"
					],
					"battery": {
						"standbyTime": "400 hours",
						"talkTime": "7 hours",
						"type": "Lithium Ion (Li-Ion) (1400 mAH)"
					},
					"camera": {
						"features": [
							"Flash",
							"Video"
						],
						"primary": "8.0 megapixels"
					},
					"connectivity": {
						"bluetooth": "Bluetooth 2.1",
						"cell": "850/1900/2100 3G; 850/900/1800/1900 GSM/GPRS/EDGE\n900/1700/2100 3G; 850/900/1800/1900 GSM/GPRS/EDGE",
						"gps": true,
						"infrared": false,
						"wifi": "802.11 b/g/n"
					}
				},
				"images": [
					"img/phones/lg-axis.0.jpg",
					"img/phones/lg-axis.1.jpg",
					"img/phones/lg-axis.2.jpg"
				]
			});
			// phones.$save(function(saved){
			// 	console.log('post', saved);
			// });
			phones.$update({phoneId:99}, function(saved){
				console.log('put', saved);
			});
		};
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