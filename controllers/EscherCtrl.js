app.controller("EscherCtrl", function($scope) {

	$scope.defaultColorSchema = true;
	
	$scope.calculateStats = function(data) {
		var stats={}
		for (var n in data[1].nodes) {
			if (!stats[data[1].nodes[n].node_type])
				stats[data[1].nodes[n].node_type]=1
			else
				stats[data[1].nodes[n].node_type] = stats[data[1].nodes[n].node_type]+1
		}
		console.log(stats)
	}
   
   $scope.changeColorSchema = function() {
	$scope.defaultColorSchema = !$scope.defaultColorSchema;
   
   }
   
   d3.json('../data/e_coli_core.Core%20metabolism.json', function(e, data) { 
   $scope.calculateStats(data);
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
      var css = "svg.escher-svg .segment { \
  stroke: #334E75; \
  stroke-width: 10px; \
  fill: none; \
} \
svg.escher-svg .arrowhead { \
  fill: #334E75; \
} \
"
    escher.Builder(data, null, null, d3.select('#container'), $scope.escher_options);
	});
});
