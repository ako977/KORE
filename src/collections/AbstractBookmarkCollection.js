( function( $, ko, KORE, App ) {
	App.Collection.AbstractBookmarkCollection = KORE.Collection.extend({
		init: function( models )
		{
			this.models = ko.observableArray( models );
			this.model = ko.observable( App.Resource.BookmarkResource );
			this.getModelInstance = function() {
				return new this.model()( {}, this );
			}.bind( this );

			this._super();
		}
	});

})( window.jQuery, window.ko, window.KORE, window.App );