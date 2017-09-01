
app.controller("EscherCtrl", [ '$scope', function($scope) {

	$scope.defaultColorSchema = true;
	//$scope.nodeStats = {} 
	$scope.calculateStats = function(data) {
		var stats={}
		// gene statistics calculation
		geneStats={}
		for (var r in data[1].reactions) {
			var genes = data[1].reactions[r].genes
			for (var g in genes) {
				if (!geneStats[genes[g].name])
					geneStats[genes[g].name]=1
				else
					geneStats[genes[g].name]=geneStats[genes[g].name]+1
			}
		}
		for (var sg in geneStats)
			if (geneStats[sg]<2)
				delete geneStats[sg]; // remove entries that do not occur at least twice
		
		// node statistics calculation
		for (var n in data[1].nodes) {
			if (!stats[data[1].nodes[n].node_type])
				stats[data[1].nodes[n].node_type]=1
			else
				stats[data[1].nodes[n].node_type] = stats[data[1].nodes[n].node_type]+1
		}
		
		$scope.$apply(function() {
			$scope.nodeStats = stats;
			$scope.geneStats = geneStats
		});
		
	}
   
   $scope.changeColorSchema = function() {
	$scope.defaultColorSchema = !$scope.defaultColorSchema;
	
	var color = '#334E75'
	if (!$scope.defaultColorSchema) color = 'greenyellow'
   
	$('svg.escher-svg .segment').css('stroke', color)
	$('svg.escher-svg .arrowhead').css('fill', color)

   }
   
   $scope.init = function(fileName) {
	   d3.json(fileName, function(e, data) { 
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
	   	$('#container').css('height', '600px');
	    escher.Builder(data, null, null, d3.select('#container'), $scope.escher_options);
		});
	}
	
   $scope.fileChanged = function(element) {

	     $scope.$apply(function(scope) {
	         var file = element.files[0];
	         var reader = new FileReader();
	         reader.onload = function(e) {
	        	 $scope.init(e.target.result);
	         };
	         reader.readAsDataURL(file);
	     });
	};

   
	//$scope.init('../data/e_coli_core.Core%20metabolism.json');
}]);
