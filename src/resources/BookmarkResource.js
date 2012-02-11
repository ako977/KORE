( function( $, ko, KORE, App ) {
	App.Resource.BookmarkResource = KORE.Resource.extend({
		properties: [
			{ name: "bid", type: "int", pk: true },
			{ name: "uid", type: "int" },
			{ name: "is_public", type: "bool" },
			{ name: "title", type: "str" },
			{ name: "url", type: "str" },
			{ name: "tags", type: "str" }
		],
		init: function( data, parent ) {
			this._super( data );

			this.parent = ko.observable( parent );

			this.url = ko.dependentObservable( function() {
				var idName = this.getIDName();
				var id = ko.utils.unwrapObservable( this.data[ idName ] ) || 0;

				if( id > 0 ) {
					return this.parent().url() + id + "/";
				} else {
					return this.parent().url();
				}
			}, this );

			this.deleteBookmark = function() {
				this.destroy();
			}.bind( this );

			this.isDeleteEnabled = ko.dependentObservable( function() {
				var idName = this.getIDName();
				var id = ko.utils.unwrapObservable( this.data[ idName ] ) || 0;
				return id > 0;
			}, this );

			this.saveBookmark = function() {
				this.edit.commit();
				this.save();
			}.bind( this );

			this.isSaveEnabled = ko.dependentObservable( function() {
				if( ko.utils.unwrapObservable( this.flags.save ) === true ) {
					return false;
				}
				if( ! this.isDataIdentical( this.data, this.edit ) ) {
					return true;
				}

				return false;
			}, this );

			this.revertBookmark = function() {
				this.edit.revert();
			}.bind( this );

			this.isRevertEnabled = ko.dependentObservable( function() {
				return this.isSaveEnabled();
			}, this );
		}
	});
})( window.jQuery, window.ko, window.KORE, window.App );