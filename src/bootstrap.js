window.DEMO = window.DEMO || ( window.DEMO = { viewModel: {}, app: {} } );

( function( $, ko, viewModel, App ) {
	App.Collection = {};
	App.Resource = {};
	App.ViewModel = {};

	$( function() {
		viewModel.app = new App.ViewModel.ApplicationViewModel();
		ko.applyBindings( viewModel );
	});
}( window.jQuery, window.ko, window.DEMO.viewModel, window.DEMO.app ));