// KORE: Knockout RESTful library v0.2.1
// Inspired by Backbone.js and taken over from matb33 on github
// Dependencies:
// - jQuery 1.7+ (http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js)
// - John Resig's Simple Javascript Inheritance, AKA Class (http://ejohn.org/blog/simple-javascript-inheritance/)
// - KnockoutJS 2+ (https://github.com/downloads/SteveSanderson/knockout/knockout-2.0.0.js)
// - Knockout Mapping (https://github.com/SteveSanderson/knockout.mapping/tree/master/build/output)
// (c) 2012 alexk45
// License: MIT ( http://www.opensource.org/licenses/mit-license.php )

( function( $, ko, Class, KORE ) {

	// Sanity checks
	if( $ === undefined ) throw Error( "KORE dependency 'jQuery' not found" );
	if( ko === undefined ) throw Error( "KORE dependency 'KnockoutJS' not found" );
	if( Class === undefined ) throw Error( "KORE dependency 'Class' not found" );

	KORE.Base = Class.extend({
		init: function() {
			this._super();

			this.flags = {};
			if( this.flags.sync !== undefined ) throw Error( "One of your Resources or Collections has setup this.flags.sync -- it is a reserved property" );

			// Setup standard flags to be leveraged by implementation
			this.flags.sync = ko.observable( false );
		},

		// Communicates with RESTful API
		sync: function( method, model, callback ) {
			var context = this;

			this.flags.sync( true );

			var query = $.ajaxQuery.get();

			$.ajax({
				"url": this.url() + ( query ? ( "?" + query ) : "" ),
				"dataType": "json",
				"type": method,
				"processData": false,
				"crossDomain": false,
				"context": context,
				"data": model
			}).always( function( data, textStatus, jqXHR ) {
				this.flags.sync( false );
				if( typeof callback === "function" ) callback.apply( context, arguments );
			});
		}
	});

	KORE.Resource = KORE.Base.extend({
		init: function( modelData ) {
			this._super();

			// Sanity checks
			if( this.properties === undefined ) throw Error( "One of your Resources did not setup the this.properties object" );
			if( this.flags.fetch !== undefined ) throw Error( "One of your Resources has setup this.flags.fetch -- it is a reserved property" );
			if( this.flags.save !== undefined ) throw Error( "One of your Resources has setup this.flags.save -- it is a reserved property" );
			if( this.flags.destroy !== undefined ) throw Error( "One of your Resources has setup this.flags.destroy -- it is a reserved property" );
			if( this.model !== undefined ) throw Error( "One of your Resources has setup this.model -- it is a reserved property" );
			if( this.edit !== undefined ) throw Error( "One of your Resources has setup this.edit -- it is a reserved property" );

			// Setup standard flags to be leveraged by implementation
			this.flags.fetch = ko.observable( false );
			this.flags.save = ko.observable( false );
			this.flags.destroy = ko.observable( false );

			// this.model is a flat object that stores key-value pairs representing model data
			this.model = {};

			// this.edit is a mirror object to this.model and used as a temporary space for "edits"
			// The edit.commit and edit.revert utility functions copy between this.model and this.edit
			this.edit = {};

			// Private method to subscribe edit fields to model fields
			var subscribeTo = function( source, destination ) {
				source.subscribe( function( value ) {
					destination( value );
				}, this );
			}.bind( this );

			// Setup model and edit observables
			for( var i = 0, len = this.properties.length; i < len; i++ ) {
				var name = this.properties[ i ].name;
				this.model[ name ] = ko.observable();
				this.edit[ name ] = ko.observable();
				subscribeTo( this.model[ name ], this.edit[ name ] );
			}

			// Copies data from "edit" store to "model" store
			this.edit.commit = function() {
				this.copyModel( this.edit, this.model );
			}.bind( this );

			// Copies data from "model" store to "edit" store
			this.edit.revert = function() {
				this.copyModel( this.model, this.edit );
			}.bind( this );

			// Performs a shallow copy of source model data to a destination model's data (same model types)
			this.copyModel = function( sourceModel, destinationModel ) {
				for( var i = 0, len = this.properties.length; i < len; i++ ) {
					var name = this.properties[ i ].name;
					destinationModel[ name ]( ko.utils.unwrapObservable( sourceModel[ name ] ) );
				}
			}.bind( this );

			// Leverages copyModel but accepts a same model as input
			this.cloneFrom = function( source ) {
				this.copyModel( source.model, this.model );
			}.bind( this );

			// Compares two same model data objects and returns true if identical
			this.isModelIdentical = function( model1, model2 ) {
				for( var i = 0, len = this.properties.length; i < len; i++ ) {
					var name = this.properties[ i ].name;
					if( ko.utils.unwrapObservable( model1[ name ] ) !== ko.utils.unwrapObservable( model2[ name ] ) ) {
						return false;
					}
				}
				return true;
			}.bind( this );

			// Returns the model's current ID value. If not yet set, returns null.
			this.getID = ko.dependentObservable( function() {
				var idName = this.getIDName();
				if( idName !== null ) {
					var id = ko.utils.unwrapObservable( this.model[ idName ] );
					if( parseInt( id ) > 0 ) {
						return id;
					}
				}
				return null;
			}, this );

			// Returns a boolean indicating whether or not the model has an ID value
			this.isNew = ko.dependentObservable( function() {
				return this.getID() === null;
			}, this );

			// Returns an array of all property names for this model
			this.getPropertyNames = function() {
				var propertyNames = [];
				for( var i = 0, len = this.properties.length; i < len; i++ ) {
					propertyNames.push( this.properties[ i ].name );
				}
				return propertyNames;
			}.bind( this );

			// Returns an array of all property names for this model that don't have an "undefined" value
			this.getInUsePropertyNames = function() {
				var inUsePropertyNames = $.map( this.getPropertyNames(), function( field ) {
					var isInvalid = ko.utils.unwrapObservable( this.model[ field ] ) === undefined;
					return isInvalid ? null : field;
				}.bind( this ) );

				return inUsePropertyNames;
			}.bind( this );

			// Returns the type of the first property to match a specific name, otherwise returns false
			this.getPropertyTypeByName = function( name ) {
				for( var i = 0, len = this.properties.length; i < len; i++ ) {
					if( this.properties[ i ].name === name ) {
						return this.properties[ i ].type;
					}
				}
				return false;
			}.bind( this );

			// Performs a GET request, importing results into model data
			this.fetch = function( callback ) {
				this.flags.fetch( true );
				this.sync( "GET", function( row ) {
					this.flags.fetch( false );
					this.load( row );
					if( typeof callback === "function" ) callback.apply( this, arguments );
				});
			}.bind( this );

			// Performs a POST or PUT request with the model data
			this.save = function( callback ) {
				var isNew = this.isNew();
				var method = isNew ? "POST" : "PUT";

				this.flags.save( true );
				this.sync( method, function( data, textStatus, jqXHR ) {
					if( isNew ) {
						// POST sends back the newly inserted ID, set it in the model
						var idName = this.getIDName();
						if( idName !== null && data.hasOwnProperty( idName ) ) {
							this.model[ idName ]( data[ idName ] );
						}
					}

					this.flags.save( false );
					if( typeof callback === "function" ) callback.apply( this, arguments );
				});
			}.bind( this );

			// Performs a DELETE request and then clears the model data
			this.destroy = function( callback ) {
				this.flags.destroy( true );
				this.sync( "DELETE", function() {
					this.flags.destroy( false );
					if( typeof callback === "function" ) callback.apply( this, arguments );
				});

				this.clear();

				if( this.parent && ko.utils.unwrapObservable( this.parent ) ) {
					this.parent().resources.remove( this );
				}
			}.bind( this );

			// Loads a local set of data into the model data
			this.load = function( row ) {
				var idName = this.getIDName();

				if( idName !== null ) {
					row = this.typeCastIn( row );
					ko.mapping.fromJS( row, {
						"key": function( row ) {
							return ko.utils.unwrapObservable( row[ idName ] );
						}
					}, this.model );
				}
			}.bind( this );

			// Sets all model property values to "undefined"
			this.clear = function() {
				for( var name in this.model ) {
					if( ko.isWriteableObservable( this.model[ name ] ) ) {
						this.model[ name ]( undefined );
					}
				}
			}.bind( this );

			// Model-specific extension of sync, which can gather data from the model
			this.sync = function( method, callback ) {
				var model = "";
				if( method === "POST" || method === "PUT" ) {
					if( this.model !== undefined ) {
						model = ko.mapping.toJS( this.model, { include: this.getInUsePropertyNames() } );
						model = $.param( this.typeCastOut( model ) );
					}
				}
				return this._super( method, model, callback );
			}.bind( this );

			// Transforms an unwrapped model's data values based on that property type for consumption in an API
			// Booleans: follows a standard of a value of "1" for true and "0" for false
			this.typeCastOut = function( object ) {
				var castObject = {};
				for( var name in object ) {
					if( object.hasOwnProperty( name ) ) {
						var value = object[ name ];
						var type = this.getPropertyTypeByName( name );

						switch( type ) {
							case "bool":
								value = ( value === true ) ? "1" : "0";
						}

						castObject[ name ] = value;
					}
				}
				return castObject;
			}.bind( this );

			// Transforms an unwrapped model's data values based on that property type for consumption by KO.
			// Booleans: attempts various checks against common "boolean" values to obtain real boolean true or false
			this.typeCastIn = function( object ) {
				var castObject = {};
				for( var name in object ) {
					if( object.hasOwnProperty( name ) ) {
						var value = object[ name ];
						var type = this.getPropertyTypeByName( name );

						switch( type ) {
							case "bool":
								value = ( value === true || value === "1" || value === "Y" || value === "on" );
						}

						castObject[ name ] = value;
					}
				}
				return castObject;
			}.bind( this );

			// Load any local data provided during construction
			this.load( modelData );
		},
		getIDName: function() {
			for( var i = 0, len = this.properties.length; i < len; i++ ) {
				if( this.properties[ i ].pk === true ) return this.properties[ i ].name;
			}
			return false;
		}
	});

	KORE.Collection = KORE.Resource.extend({
		init: function() {
			this._super();

			// Sanity checks
			if( this.resources === undefined ) throw Error( "One of your Collections did not setup an observableArray on this.resources" );
			if( this.resource === undefined ) throw Error( "One of your Collections did not setup an observable on this.resource" );
			if( this.getResourceInstance === undefined ) throw Error( "One of your Collections did not setup this.getResourceInstance" );
			if( this.flags.fetch !== undefined ) throw Error( "One of your Collections has setup this.flags.fetch -- it is a reserved property" );
			if( this.flags.save !== undefined ) throw Error( "One of your Collections has setup this.flags.save -- it is a reserved property" );
			if( this.flags.destroy !== undefined ) throw Error( "One of your Collections has setup this.flags.destroy -- it is a reserved property" );

			if( this.resources() === undefined ) this.resources( [] );

			// Setup standard flags to be leveraged by implementation
			this.flags.fetch = ko.observable( false );
			this.flags.save = ko.observable( false );
			this.flags.destroy = ko.observable( false );

			// Loops over the collection's models and calls a method on each of these
			// Also sets the appropriate boolean activity flag
			// Is capable of firing a callback after all models have fired their respective callbacks
			var iterateResources = function( method, collectionCallback, resourceCallback )
			{
				var self = this;
				var resources = ko.utils.unwrapObservable( this.resources ) || [];
				var len = resources.length;
				var resourcesCalledBack = len;

				self.flags[ method ]( true );

				for( var i = 0; i < len; i++ ) {
					resources[ i ][ method ].call( resources[ i ], function() {
						if( typeof resourceCallback === "function" ) resourceCallback.apply( this, arguments );

						if( ( --resourcesCalledBack ) === 0 ) {
							self.flags[ method ]( false );
							if( typeof collectionCallback === "function" ) collectionCallback.apply( self, arguments );
						}
					});
				}
			}.bind( this );

			// Returns the number of models in this collection
			this.length = ko.dependentObservable( function() {
				var resources = ko.utils.unwrapObservable( this.resources ) || [];
				return resources.length;
			}, this );

			// Performs a GET operation that expects an array of rows, then imports them into the collection
			this.fetch = function( callback ) {
				this.flags.fetch( true );
				this.sync( "GET", function( rows ) {
					this.flags.fetch( false );
					this.load( rows );
					if( typeof callback === "function" ) callback.apply( this, arguments );
				});
			}.bind( this );

			// Call save on each model in the collection
			this.save = function( collectionCallback, resourceCallback ) {
				this.iterateResources( "save", collectionCallback, resourceCallback );
			}.bind( this );

			// Calls destroy on each of model in the collection, then clears the collection
			this.destroy = function( collectionCallback, resourceCallback ) {
				this.iterateResources( "destroy", collectionCallback, resourceCallback );
				this.clear();
			}.bind( this );

			// Clears the collection by emptying its models
			this.clear = function() {
				this.resources( [] );
			}.bind( this );

			// Imports an array of data into the collection, leveraging ko.mapping for seamless merging
			this.load = function( rows ) {
				this.resources.importModel( rows, this.resource(), this );
			}.bind( this );

			// Collection-specific extension of sync
			this.sync = function( method, callback ) {
				return this._super( method, "", callback );
			}.bind( this );
		}
	});

	// $.ajaxHeaders.set/unset enforce unique header keys, and
	// then synchronize with jQuery's $.ajaxSetup

	$.ajaxHeaders = function() {

		var headers = {};

		var setHeader = function( name, value ) {
			headers[ name ] = value;
			$.ajaxSetup( { headers: headers } );
		};

		var unsetHeader = function( name ) {
			delete headers[ name ];
			$.ajaxSetup( { headers: headers } );
		};

		return {
			set: setHeader,
			unset: unsetHeader
		};
	}();

	// $.ajaxQuery.set/unset enforce unique query keys, and
	// can be retrieved in querystring format

	$.ajaxQuery = function() {

		var query = {};

		var setQuery = function( name, value ) {
			query[ name ] = value;
		};

		var unsetQuery = function( name ) {
			delete query[ name ];
		};

		var getQuery = function() {
			return $.param( query, true );
		};

		return {
			set: setQuery,
			unset: unsetQuery,
			get: getQuery
		};
	}();

	// These import functions ensure proper instance creation when mapping
	// (TODO: elaborate comment)

	ko.observable.fn.importModel = function( row ) {
		ko.utils.modelImport.call( this, row );
	};

	ko.utils.modelImport = function( row ) {
		ko.mapping.fromJS( row, {}, this );
	};

	ko.observableArray.fn.importModel = function( rows, childConstructor, parent ) {
		ko.utils.modelArrayImport.call( this, rows, childConstructor, parent );
	};

	ko.utils.modelArrayImport = function( rows, childConstructor, parent ) {
		var idName = childConstructor.prototype.getIDName();
		var mapping = {
			"key": function( data ) {
				return ko.utils.unwrapObservable( data[ idName ] );
			},
			"create": function( options ) {
				return new childConstructor( options.data, parent );
			}
		};

		return ko.mapping.fromJS( rows, mapping, this );
	};

}( window.jQuery, window.ko, window.Class, window.KORE || ( window.KORE = {} ) ));