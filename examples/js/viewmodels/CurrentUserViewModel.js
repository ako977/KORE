( function( $, ko, KORE, App ) {
	App.ViewModel.CurrentUserViewModel = KORE.ViewModel.extend({
		init: function() {
			KORE.ViewModel.prototype.init.call( this );

			this.live = new App.Model.UserModel();
			this.auth = new App.Model.AuthenticatedUserModel();
			this.signup = new App.Model.UserModel();

			this.tryLoading = function() {
				var self = this;
				var username = ko.utils.unwrapObservable( this.live.model.username ) || "";

				if( username.length > 0 ) {
					this.live.fetch( function( data, textStatus ) {
						var isSuccessful = textStatus === "success";

						self.isAuthenticated( isSuccessful );
						if( isSuccessful ) self.bookmarks.fetch();
					});
				}
			}.bind( this );

			this.saveProfile = function() {
				this.live.edit.commit();
				this.live.save();
				this.live.model.password( undefined );
			}.bind( this );

			this.isSaveEnabled = ko.dependentObservable( function() {
				if( ko.utils.unwrapObservable( this.live.flags.save ) === true ) return false;
				if( ! this.live.isModelIdentical( this.live.model, this.live.edit ) ) return true;
				return false;
			}, this );

			this.revertProfile = function() {
				this.live.edit.revert();
			}.bind( this );

			this.isRevertEnabled = ko.dependentObservable( function() {
				return this.isSaveEnabled();
			}, this );

			//=======================
			// Bookmarks
			//=======================

			this.bookmarks = new App.Collection.UserBookmarkCollection( [], this.live );

			//=======================
			// Authentication
			//=======================

			this.isAuthenticated = ko.observable( false );
			this.authMessage = ko.delayedRevertObservable( "", 2500 );

			this.isAuthenticating = ko.dependentObservable( function() {
				return this.auth.flags.fetch() === true || this.live.flags.fetch() === true;
			}, this );

			this.tryAuthenticating = function( callback ) {
				var self = this;

				this.auth.fetch( function( data, textStatus ) {
					if( textStatus === "success" ) {
						self.live.model.username( this.model.username() );
						self.tryLoading();
					}

					if( typeof callback === "function" ) callback.apply( this, arguments );
				});
			}.bind( this );

			//=======================
			// Sign-up
			//=======================

			this.signupMessage = ko.delayedRevertObservable( "", 2500 );

			this.isSigningUp = ko.dependentObservable( function() {
				return this.live.flags.save() === true || this.live.flags.fetch() === true;
			}, this );

			this.trySignUp = function() {
				var self = this;

				if( this.signup.model.username().length > 0 ) {
					this.signupMessage( "" );

					this.live.cloneFrom( this.signup );
					this.signup.clear();

					this.live.save( function( data, textStatus ) {
						if( textStatus === "success" ) {
							$.security.setBasicCredentials( this.model.username(), this.model.password() );

							this.model.password( undefined );
							self.tryLoading();
						}
					});
				} else {
					this.signupMessage( "Please enter at least a username." );
				}
			}.bind( this );

			this.isSignupEnabled = ko.dependentObservable( function() {
				// All fields must be filled out

				var username = this.signup.model.username() || "";
				var password = this.signup.model.password() || "";
				var email = this.signup.model.email() || "";
				var name = this.signup.model.name() || "";

				if( username.length === 0 ) return false;
				if( password.length === 0 ) return false;
				if( email.length === 0 ) return false;
				if( name.length === 0 ) return false;

				return true;
			}, this );
		}
	});

})( window.jQuery, window.ko, window.KORE, window.DEMO.app );