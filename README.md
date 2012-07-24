KORE: KnockoutJS RESTful library
==============================

What is KORE?
-------------

KORE is a library inspired by Backbone.js that bridges the gap between a KnockoutJS application and a RESTful back-end.
The idea is to duplicate the models available in your RESTful backend and have them in your front-end (Javascript).

These models would interact with your front-end layout.
Your front-end layout which is represented as HTML, would contain KnockoutJS data-bind attributes accessing the data in your ViewModel.
This is where KORE comes in. The data in your attributes can be pulled from models, models that are representations of your RESTful back-end versions.

KORE attempts to create a structure and foundation from which you can create these models, collections of models, resources, etc.

ViewModels
-------------

ViewModels in KORE represent the same ViewModels used in KnockoutJS, except the abstract ViewModel in KORE implements maps data from models you would create to data accessed in your HTML.

KORE also provides base model functionality to fetch, save, destroy model data with the RESTful back-end.