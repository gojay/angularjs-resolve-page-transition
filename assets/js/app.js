String.prototype.trim = function(){return this.replace(/^\s+|\s+$/g, '');};

String.prototype.ltrim = function(){return this.replace(/^\s+/,'');};

String.prototype.rtrim = function(){return this.replace(/\s+$/,'');};

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
					console.log('change html, body css');
					$('html').css({'height':'auto', 'overflow':'auto', 'background':'#fff'});
					$('body').css({'height':'auto', 'overflow':'auto'}).removeClass(startTransition);
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
	pageTransitionProvider.setStartTransition('expandIn');
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
		when('/phone/edit/:phoneId', {
			templateUrl: 'partials/phoneEdit.html',
			controller: PhoneEditController,
			resolve: PhoneEditController.resolve
		}).
		otherwise({
			redirectTo: '/phones'
		});
}]);

