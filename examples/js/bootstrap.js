//=======================
// The code is executed here for the entire process
// The whole purpose here is to keep objects encapsulated
//=======================

//Initialize the container for your app
window.DEMO = window.DEMO || ( window.DEMO = { viewModel: {}, app: {} } );

( function( $, ko, viewModel, App ) {
	App.Collection = {};
	App.Resource = {};
	App.ViewModel = {};

	//this applies all bindings to your data in your viewmodels (via the app viewmodel)
	$( function() {
		viewModel.app = new App.ViewModel.ApplicationViewModel();
		ko.applyBindings( viewModel );
	});
}( window.jQuery, window.ko, window.DEMO.viewModel, window.DEMO.app ));