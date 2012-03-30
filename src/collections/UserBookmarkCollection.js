( function( $, ko, KORE, App ) {
	App.Collection.UserBookmarkCollection = App.Collection.AbstractBookmarkCollection.extend({
		init: function( resources, parent ) {
			this._super( resources );

			this.parent = ko.observable( parent );
			this.url = ko.dependentObservable( function() {
				return this.parent().url() + "bookmarks/";
			}, this );

			this.bookmarkEntry = this.getResourceInstance();

			this.addBookmark = function() {
				var newResourceInstance = this.getResourceInstance();
				newResourceInstance.cloneFrom( this.bookmarkEntry );
				newResourceInstance.save();
				this.bookmarkEntry.clear();
				this.resources.unshift( newResourceInstance );
			}.bind( this );

			this.afterAdd = function( element ) {
				$( element ).hide().height( "toggle" ).animate( { opacity: 1, height: "toggle" }, 400 );
			}

			this.beforeRemove = function( element ) {
				$( element ).animate( { opacity: 0, height: 0 }, 400, function() {
					$( element ).remove();
				});
			}
		}
	});
})( window.jQuery, window.ko, window.KORE, window.DEMO.app );