( function( $, ko, KORE, App ) {
	App.Collection.UserBookmarkCollection = App.Collection.AbstractBookmarkCollection.extend({
		init: function( models, parent ) {
			this._super( models );

			this.parent = ko.observable( parent );
			this.url = ko.dependentObservable( function() {
				return this.parent().url() + "bookmarks/";
			}, this );

			this.bookmarkEntry = this.getModelInstance();

			this.addBookmark = function() {
				var newModelInstance = this.getModelInstance();
				newModelInstance.cloneFrom( this.bookmarkEntry );
				newModelInstance.save();
				this.bookmarkEntry.clear();
				this.models.unshift( newModelInstance );
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
})( window.jQuery, window.ko, window.KORE, window.App );