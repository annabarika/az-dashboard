var app = angular.module("modules.buyer.bestsellers", [

]);

app.controller('BestCalendarController',

	[
		'$scope',
		'$rootScope',
		"$modal",
		"$location",
		"$route",
		"RestFactory",


		function ($scope, $rootScope, $modal, $location, $route, RestFactory){

			$scope.$route = $route;
			$scope.$location = $location;
			var url,data,method,header,length,array,year,month;
			/* Getting payments */
			$rootScope.documentTitle = "Bestsellers";

			url=config.API.host+"bestseller/load/status/1";

			$scope.months=
			{
				'01':'January',
				'02':'Fabruary',
				'03':'March',
				'04':'April',
				'05':'May',
				'06':'June',
				'07':'July',
				'08':'August',
				'09':'September',
				'10':'October',
				'11':'November',
				'12':'December'
			};
			/*$scope.months=[
				{'01':'January'},
				{'02':'Fabruary'},
				{'03':'March'},
				{'04':'April'},
				{'05':'May'},
				{'06':'June'},
				{'07':'July'},
				{'08':'August'},
				{'09':'September'},
				{'10':'October'},
				{'11':'November'},
				{'12':'December'}
			];*/
			$scope.years=
			[
				"2013",
				"2014",
				"2015"
			];

			$scope.bestsellers={};
			RestFactory.request(url)
				.then(function(response){

					if(response){
						length=response.length;

						var tempArr=[];
						for(var i=0;i<length;i++){
							angular.forEach(response[i],function(value,key){
								if(key=='createDate'){
									array = value.split("-");
									year=array[0];
									month=array[1];
									tempArr.push({year:year,month:month,item:response[i]});
								}
							})
						}
						//console.log(tempArr);
						array=[];
						angular.forEach(tempArr,function(value,key){

							if($scope.bestsellers[value.year]==undefined){
								//$scope.bestsellers[value.year]={};
								//$scope.bestsellers[value.year]=[];
								$scope.bestsellers[value.year]={
									'01':[],
									'02':[],
									'03':[],
									'04':[],
									'05':[],
									'06':[],
									'07':[],
									'08':[],
									'09':[],
									'10':[],
									'11':[],
									'12':[]
								};
							}
							angular.forEach($scope.bestsellers[value.year],function(val,month){
								if(month==value.month){
									val.push(value.item);
								}
							});

						});
						console.log($scope.bestsellers);
					}
				});

		}]);