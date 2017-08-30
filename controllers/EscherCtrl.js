app.controller("EscherCtrl", function($scope) {

	$scope.defaultColorSchema = true;
	
	$scope.calculateStats = function(data) {
	
	}
   
   $scope.changeColorSchema = function() {
	$scope.defaultColorSchema = !$scope.defaultColorSchema;
   
   }
   
   d3.json('../data/e_coli_core.Core%20metabolism.json', function(e, data) { 
   $scope.escher_options = {
            // Just show the zoom buttons
            menu: 'zoom',
            // use the smooth pan and zoom option
            use_3d_transform: true,
            // No editing in this map
            enable_editing: false,
            // No keyboard shortcuts
            enable_keys: false,
            // No tooltips
            enable_tooltips: false,
        };
    escher.Builder(data, null, null, d3.select('#container'), $scope.escher_options);
	});
});
