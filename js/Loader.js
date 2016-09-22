/**
 * @author mrdoob / http://mrdoob.com/
 */

var Loader = function ( ) {


	this.texturePath = '';

	this.loadFile = function ( file ) {
		console.log("loadFile");
console.log(new Date(Date.now()));
		var filename = file.name;
		var extension = filename.split( '.' ).pop().toLowerCase();

		var reader = new FileReader();

		/*reader.addEventListener( 'progress', function ( event ) {

			var size = '(' + Math.floor( event.total / 1000 ).format() + ' KB)';
			var progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';
			console.log( 'Loading', filename, size, progress );

		} );*/

		switch ( extension ) {

			case 'gml': {

				var inlineWorkerText =
    			"self.addEventListener('message', function(e) { postMessage(e); } ,false);"
				;



				//var socket = io.connect();
				reader.addEventListener( 'load', function ( event ) {
					console.log("gml file load finish");
					console.log(new Date(Date.now()));
					var contents = event.target.result;

					var indoorgmlLoader = new IndoorGMLLoader();

					var data = indoorgmlLoader.unmarshal(contents);
					//console.log(data);
					//var worker = require('webworkify')(require('./loader/IndoorGMLLoader.js'));
					//worker.addEventListener('message', function (ev) {
					 	console.log("receive json!!");

						console.log(new Date(Date.now()));
						var indoor = new Indoor();
						//var maxmin_xyz = indoor.init(ev.data);
						var maxmin_xyz = indoor.init(data);
						console.log("init indoorfeature!!");

						console.log(new Date(Date.now()));
						//var ic = new SetIndoorGMLCommand();
						//ic.makeGeometry(indoor,maxmin_xyz);
					draw(indoor,maxmin_xyz);
					//});
					//worker.postMessage(contents);	
				}, false );
				reader.readAsText( file );

				break;
			}
			case 'csv' : {
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var lines = contents.split('\n');
					console.log("csv load finish");
					console.log(new Date(Date.now()));
					 makeMF(lines);
				}, false );
				reader.readAsText( file );
				break;
			}
			default:

				alert( 'Unsupported file format (' + extension +  ').' );

				break;

		}

	};
};
