( function( $, ko, viewModel, App )
{
	App.Collection = {};
	App.Model = {};
	App.ViewModel = {};

	$.ajaxQuery.set( "format", "json" );

	$( function()
	{
		viewModel.app = new App.ViewModel.ApplicationViewModel();

		ko.applyBindings( viewModel );
	});

})( window.jQuery, window.ko, window.viewModel || ( window.viewModel = {} ), window.App || ( window.App = {} ) );