var MovingFeature = function() {
    this.poslist = []; 
    this.infomation;
    this.start;
    this.end;

    this.targetPosition = 3;
    this.timeList = [];
    this.delta = [];
    this.mid =[];
    this.object;
 }
 MovingFeature.prototype.init = function(mf) {
  var mfIdRef = mf.attr("mfIdRef");
  this.infomation = find(mfIdRef);
  this.start = mf.attr("start") * 1;
  this.end = mf.attr("end") * 1;
  var pointsplit = mf.find("posList").text().split(" ");

  for(var i = 0;i < pointsplit.length;i += MovingFeatureMetaData.dimension) {
    this.poslist.push(pointsplit[i] * 1);
    this.poslist.push(pointsplit[i + 1] * 1);
    this.poslist.push(0);
    if(MovingFeatureMetaData.dimension == 3) {
      this.poslist[this.poslist.length - 1] = pointsplit[i + 2] * 1;
    }
  }

  var x = 0, y = 0, z = 0;
  var total = [0];
  var time = this.end - this.start;
  for(var i = 0; i < this.poslist.length - 3; i += 3) {
    x = this.poslist[i + 3] - this.poslist[i];
    y = this.poslist[i + 4] - this.poslist[i + 1];
    z = this.poslist[i + 5] - this.poslist[i + 2];
    total.push(Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2)));
    total[0] += total[total.length - 1];
  }
  for(var i = 0; i < this.poslist.length - 3; i += 3) {
    var curtime = (total[(i / 3) + 1] / total[0]) * time;
    this.timeList.push(curtime + this.start);
    x = this.poslist[i + 3] - this.poslist[i];
    y = this.poslist[i + 4] - this.poslist[i + 1];
    z = this.poslist[i + 5] - this.poslist[i + 2];
    this.delta.push((x / curtime) * timeunit);
    this.delta.push((y / curtime) * timeunit);
    this.delta.push((z / curtime) * timeunit);
  }

  //this.poslist = pointsplit;
  
  this.mid[0] = this.poslist[0];
  this.mid[1] = this.poslist[1];
  this.mid[2] = this.poslist[2];
 //console.log(this.poslist);
};

var Member = function() {
    this.id;
    this.name;
 }
Member.prototype.init = function(member) {
  this.id = member.attr("gml:id");
  this.name = member.find("name").text();
};

var MovingFeatureMetaData = function() {
    this.lowerCorner = [];
    this.upperCorner = [];
    this.beginPosition;
    this.endPosition;
    this.offset;
 }
MovingFeatureMetaData.prototype.init = function(sTBoundedBy) {
  this.offset= sTBoundedBy.attr("offset");
  var pointsplit = sTBoundedBy.find("lowerCorner").text().split(" ");
  MovingFeatureMetaData.dimension = pointsplit.length;

  this.lowerCorner.push(pointsplit[0] * 1);
  this.lowerCorner.push(pointsplit[1] * 1);
  this.lowerCorner.push(0);
  if(MovingFeatureMetaData.dimension == 3) {
    this.lowerCorner[this.lowerCorner.length - 1] = pointsplit[2] * 1;
  }
  pointsplit = sTBoundedBy.find("upperCorner").text().split(" ");

  this.upperCorner.push(pointsplit[0] * 1);
  this.upperCorner.push(pointsplit[1] * 1);
  this.upperCorner.push(0);
  if(MovingFeatureMetaData.dimension == 3) {
    this.upperCorner[this.upperCorner.length - 1] = pointsplit[2] * 1;
  }
  
};
/*var UserType = function() {
    this.name;
    this.restriction;
 }
UserType.prototype.init = function(jsoncontent) {

};*/
function read() {

  $.ajax({
      type: "GET"
      ,dataType: "xml"
      ,url: "test.xml"
      ,success: makeFeature
      ,error:function(request,status,error){
          alert("code:"+request.status+"\n"+"error:"+error);
      }
    });
}

function find(id) {
  for(var i = 0;i < mfMember.length;i++) {
    if(id == mfMember[i].id) return mfMember[i];
  }
}
function makeFeature(xml) {
  var meta = new MovingFeatureMetaData();
  var mfmetaData = $(xml).find("sTBoundedBy");  
  meta.init(mfmetaData);

  var mfinfo = $(xml).find("member");  
  mfMember = [];
  var membernum = mfinfo.length;
  if (membernum) {                       
      $(mfinfo).each(function(){ 
        var mfmem = $(this).find("MovingFeature");
        var mfmemnum = mfmem.length;
        if(mfmemnum) {
          var member = new Member();
          member.init(mfmem);
          mfMember.push(member);
        }
        
      }); 
  }       
  
  mfArray = [];
  var xmlData = $(xml).find("LinearTrajectory");  
  
  var listLength = xmlData.length;
  if (listLength) {                       
      $(xmlData).each(function(){ 
        var mf = new MovingFeature();
        mf.init($(this));
        mfArray.push(mf);
      }); 
  }                             
  play();
}


var objectArray = [];
var time = 0;
function play() {

  setInterval(function() {
    
    update();
    time += timeunit;
  },timeunit * 1000);
}

var timeunit = 1;
var iszoom = false;
var e = 0.001;
function update(){
     
      for(var i = 0;i < mfArray.length;i++) {
        if(mfArray[i].start > time - timeunit && mfArray[i].start <= time) {
          mfArray[i].object = viewer.entities.add({
              name : mfArray[i].infomation.name,
              ellipsoid : {
                  radii : new Cesium.Cartesian3(2.0, 2.0, 2.0),
                  material : Cesium.Color.RED.withAlpha(0.3)
              }
          });
          iszoom = true;       
        }       
        else if(mfArray[i].end <= time) {
          mfArray[i].object.show = false;
          mfArray.splice(i,1);
          continue;
        } 
        
        if(mfArray[i].start <= time && mfArray[i].end > time){
          var offset = new Cesium.Cartesian3(mfArray[i].mid[0], mfArray[i].mid[1], mfArray[i].mid[2]);
          var finalPos = Cesium.Matrix4.multiplyByPoint(ENU, offset, new Cesium.Cartesian3());
          
          mfArray[i].object.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(Cesium.Cartographic.fromCartesian(finalPos, ellipsoid));
          Cesium.Transforms.eastNorthUpToFixedFrame(mfArray[i].object.position,ellipsoid);
          mfArray[i].mid[0] += mfArray[i].delta[mfArray[i].targetPosition - 3];
          mfArray[i].mid[1] += mfArray[i].delta[mfArray[i].targetPosition - 2];
          mfArray[i].mid[2] += mfArray[i].delta[mfArray[i].targetPosition - 1];
        }
        if(mfArray[i].timeList[mfArray[i].targetPosition / 3 - 1] <= time + timeunit) {
          mfArray[i].targetPosition += 3; 
        }
    }
    /*if(iszoom) {
      viewer.zoomTo(viewer.entities);
      iszoom = false;
    }*/

}
     