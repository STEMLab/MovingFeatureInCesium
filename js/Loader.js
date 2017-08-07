/**
 * @author mrdoob / http://mrdoob.com/
 */

var Loader = function ( ) {
	this.texturePath = '';
	this.loadFile = function ( file ) {
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
				solidtocsv = "id, geom\n";
				movingfeaturewgs84 = "@stboundedby,urn:x-ogc:def:crs:EPSG:6.6:4326,3D,50.23 9.23 0,50.31 9.27 0,2016-10-31T13:44:34Z,2012-01-17T12:49:40Z,sec\n@columns,mfidref,trajectory,\"typecode\",xsd:integer\n";
				
				var inlineWorkerText =
    			"self.addEventListener('message', function(e) { postMessage(e); } ,false);"
				;
				reader.addEventListener( 'load', function ( event ) {
					console.log("gml file load finish");
					console.log(new Date(Date.now()));
					var contents = event.target.result;
					var indoorgmlLoader = new IndoorGMLLoader();
					var data = indoorgmlLoader.unmarshal(contents);
					//console.log(data);
					//var worker = require('webworkify')(require('./loader/IndoorGMLLoader.js'));
					//worker.addEventListener('message', function (ev) {
						/*var blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
						saveAs(blob, "boxs.json");*/
					 	console.log("receive json!!");
						console.log(new Date(Date.now()));
						indoor = new Indoor();
						//var maxmin_xyz = indoor.init(ev.data);
						var maxmin_xyz = indoor.init(data);
					draw(indoor,maxmin_xyz);

					//var blob = new Blob([solidtocsv], {type: "text/plain;charset=utf-8"});
					//	saveAs(blob, "lotte.csv");
					//});
					//worker.postMessage(contents);	
				}, false );
				reader.readAsText( file );
				break;
			}
			case 'csv' : {
				var index = 0;
				var j = 1;
				Papa.parse(file, {
					download: true,
					step: function(row) {
						if(index == 0) {
							makeMF(row);

						}
						else if(index > 1) {
							makeonemft(row);
							/*if(index % 300000 == 0) {
								var blob = new Blob([movingfeaturewgs84], {type: "text/plain;charset=utf-8"});
								saveAs(blob, j + "MFwgs84.csv");
								j++;
								movingfeaturewgs84 = null;
								var blob = null;
								movingfeaturewgs84 = "";
							}*/
						}

						index ++;
					},
					complete: function() {
						complete();
						//var blob = new Blob([movingfeaturewgs84], {type: "text/plain;charset=utf-8"});
						//saveAs(blob, j + "MFwgs84.csv");
					}
				});
				break;
			}
			case 'txt' : {//test
				solidtocsv = "id, geom\n";
				Papa.parse(file, {
					download: true,
					delimiter: " ",
					header: false,
					step: function(row) {
						if(row.data[0])
						drawMultiSurface(row.data[0]);
					},
					complete: function() {
						showInCesium(group,groupline);
						viewer.entities.add({
		                position: new Cesium.Cartesian3.fromDegrees(127.101914, 37.462066, 28.068607),
		                point : {
			                pixelSize : 5,
			                color : Cesium.Color.fromBytes(255, 255, 255, 255)
			              }
		            	});
			            viewer.zoomTo(viewer.entities);
			            var blob = new Blob([solidtocsv], {type: "text/plain;charset=utf-8"});
						saveAs(blob, "boxs.csv");
					}
				});
				break;
			}
			default: {

				alert( 'Unsupported file format (' + extension +  ').' );

				break;
				}

		}

	};

};
