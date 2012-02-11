( function( $, ko, KORE, App ) {
	App.ViewModel.ApplicationViewModel = KORE.ViewModel.extend({
		init: function() {
			this._super();

			//=======================
			// Public bookmarks
			//=======================

			this.bookmarks = new App.Collection.FilterablePublicBookmarkCollection( [] );
			this.refreshBookmarks = function() {
				this.bookmarks.fetch();
			}.bind( this );

			var refreshBookmarksInterval;
			this.triggerRefreshBookmarks = function() {
				window.clearInterval( refreshBookmarksInterval );
				this.refreshBookmarks();
				refreshBookmarksInterval = window.setInterval( function() {
					this.refreshBookmarks();
				}.bind( this ), 5000 );
			}.bind( this );

			this.triggerRefreshBookmarks();

			//=======================
			// Current user
			//=======================

			this.currentUser = new App.ViewModel.CurrentUserViewModel();
		}
	});
})( window.jQuery, window.ko, window.KORE, window.App );