( function( $, ko, KORE, App ) {
	App.Resource.UserResource = KORE.Resource.extend({
		properties: [
			{ name: "uid", type: "int", pk: true },
			{ name: "username", type: "str" },
			{ name: "password", type: "str" },
			{ name: "name", type: "str" },
			{ name: "email", type: "str" }
		],
		init: function( data ) {
			this._super( data );

			this.url = ko.dependentObservable( function() {
				var username = ko.utils.unwrapObservable( this.data.username ) || "";

				if( username.length > 0 ) {
					return "/api/users/" + username + "/";
				} else {
					return "/api/users/";
				}
			}, this );
		}
	});
})( window.jQuery, window.ko, window.KORE, window.App );