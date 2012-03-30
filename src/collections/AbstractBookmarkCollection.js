( function( $, ko, KORE, App ) {
	App.Collection.AbstractBookmarkCollection = KORE.Collection.extend({
		init: function( resources )
		{
			this.resources = ko.observableArray( resources );
			this.resource = ko.observable( App.Resource.BookmarkResource );
			this.getResourceInstance = function() {
				return new this.resource()( {}, this );
			}.bind( this );

			this._super();
		}
	});

})( window.jQuery, window.ko, window.KORE, window.DEMO.app );