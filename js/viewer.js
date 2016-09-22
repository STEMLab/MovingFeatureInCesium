function calCenter(maxmin_xyz) {
      var boundingBoxLength = [maxmin_xyz[0] - maxmin_xyz[3], maxmin_xyz[1] - maxmin_xyz[4], maxmin_xyz[2] - maxmin_xyz[5]];
      var maxLength = Math.max(boundingBoxLength[0], boundingBoxLength[1], boundingBoxLength[2]);
      if(userScale == 0) {
        scale = 370 / maxLength;
      }else scale = userScale;
      
      translate = [-(boundingBoxLength[0] / 2) - maxmin_xyz[3] + x, -(boundingBoxLength[1] / 2) - maxmin_xyz[4] + y, -maxmin_xyz[5]];
}

function transformCoordinates(myvertices) {
  for (var i = 0; i < myvertices.length / 3; i++) {
    myvertices[i * 3] = (myvertices[i * 3] +translate[0]) * scale;
    myvertices[i * 3 + 1] = (myvertices[i * 3 + 1] +translate[1]) * scale;
    myvertices[i * 3 + 2] = (myvertices[i * 3 + 2] +translate[2]) * scale;

    myvertices[i * 3] = Math.floor( myvertices[i * 3] * 1000000000) / 1000000000
    myvertices[i * 3 + 1] = Math.floor( myvertices[i * 3 + 1] * 1000000000) / 1000000000
    myvertices[i * 3 + 2] = Math.floor( myvertices[i * 3 + 2] * 1000000000) / 1000000000
 
  }
}
function draw(indoor,maxmin_xyz) {
  console.log("before draw");
console.log(new Date(Date.now()));
    calCenter(maxmin_xyz);
    var cells = indoor.primalSpaceFeature;
    
    for(var i = 0; i < cells.length; i++) {
        var surfaces = cells[i].geometry;
        for(var j = 0; j < surfaces.length; j++) {

            transformCoordinates(surfaces[j].exterior);

            transformCoordinates(surfaces[j].interior);
            if(surfaces[j].interior.length == 0) {
              createPolygon(surfaces[j].exterior,cells[i].cellid);
            }
            else {
              createPolygonwithHole(surfaces[j].exterior,surfaces[j].interior,cells[i].cellid)
            }
        }
    }
console.log("draw cell finish");
console.log(new Date(Date.now()));
  var cellboundary = indoor.cellSpaceBoundaryMember;
    
      for(var j = 0; j < cellboundary.length; j++) {
        if(cellboundary[0].geometry[0] instanceof Polygon) {
          transformCoordinates(cellboundary[j].geometry[0].exterior);
          createPolygon(cellboundary[j].geometry[0].exterior,cellboundary[j].cellBoundaryid);

        }
        else {
          transformCoordinates(cellboundary[j].geometry[0].points);
          createPolygon(cellboundary[j].geometry[0].points,cellboundary[j].cellBoundaryid);
        }
      } 
      console.log("draw boundary finish");
console.log(new Date(Date.now()));
    var graphs = indoor.multiLayeredGraph;

    for(var i = 0; i < graphs.length; i++){
        /*var states = graphs[i].stateMember;
        for(var j = 0; j < states.length; j++){
            transformCoordinates(states[j].position);
            var result = toCartesian3(states[j].position);
            var redSphere = viewer.entities.add({
                name : 'Red sphere with black outline',
                position: result[0],
                ellipsoid : {
                    radii : new Cesium.Cartesian3(1000.0, 1000.0, 1000.0),
                    material : Cesium.Color.RED.withAlpha(0.5),
                }
            });
        }*/

        var edges = {};
        var trasitions = graphs[i].transitionMember;
        for(var j = 0; j < trasitions.length; j++){
            transformCoordinates(trasitions[j].line);
            var redTube = viewer.entities.add({
                name : trasitions[j].transitionid,
                polyline : {
                    positions : toCartesian3(trasitions[j].line),
                    material : Cesium.Color.BLUE
                }
            });
            edges[trasitions[j].transitionid] = redTube;
            //console.log(redTube);
        }
        NetworkDictionary[graphs[i].graphid] = edges;
        //graph.push(edges);

        //NetworkDictionary[graphs[i].graphid] = graph;

    }
    console.log("draw transition finish");
console.log(new Date(Date.now()));
    viewer.zoomTo(viewer.entities);
    console.log("draw transition finish");
console.log(new Date(Date.now()));
}
function toggleNetwork() {
  for(var gid in NetworkDictionary) {
    for(var eid in NetworkDictionary[gid]) {
      NetworkDictionary[gid][eid].show = !NetworkDictionary[gid][eid].show;
    }
  }
}
function toCartesian3(vertices) {
  
  var result = [];
  
  for(var k = 0;k < vertices.length;k += 3) {
   var offset = new Cesium.Cartesian3(vertices[k], vertices[k + 1], vertices[k + 2]);
    var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

    Cesium.Matrix4.multiplyByPoint(ENU, finalPos, finalPos);


    result.push(finalPos);
  }
  return result;
}
function createPolygon(exterior,id) {

viewer.entities.add({
                name : id,
                polygon : {
                    hierarchy : toCartesian3(exterior),
                    material : Cesium.Color.BLUE.withAlpha(0.01),
                    perPositionHeight : true,
                    outline : true,
                    outlineColor : Cesium.Color.BLACK.withAlpha(0.1),
                    outlineWidth : 2.0
                }
            });
}
function createPolygonwithHole(exterior,interior,id) {
viewer.entities.add({
                name : id,
                polygon : {
                    hierarchy : {

                        positions : toCartesian3(exterior),
                        holes : toCartesian3(interior)
                    },
                    material : Cesium.Color.BLUE.withAlpha(0.1),
                    perPositionHeight : true,
                    outline : true,
                    outlineColor : Cesium.Color.BLACK,
                    outlineWidth : 2.0
                }
            });
}