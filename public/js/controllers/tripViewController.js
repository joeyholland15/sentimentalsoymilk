angular.module('app.trip', ['app.services'])

// ActivitiesData is a factory/service loaded from app.services
// $routeParams is used to get the trip mongoose _.id
.controller('TripController', function ($scope, $http, Ratings, ActivitiesData, $routeParams) {

  
  $scope.id = $routeParams.id;
  $scope.locations;

  $scope.submitRating = function() {
    $scope.ratingData = {
      rating: $scope.rating,
      playlistid: $scope.id
    }

    Ratings.postRatings($scope.ratingData)
      .then(function() {
        console.log('made request'); 
      })
      .catch(function(){
        console.log($scope.ratingData);
      })
  }

  $scope.sendItin= function(number) {
    console.log("number is....", number)
    console.log("number is....", $scope.activities)
    var itinArray = $scope.activities.map(function(element) {
      return [element.name, element.address]
    })

    var itinMessage = ''
    for (var i = 0; i < itinArray.length; i++) {
      itinMessage += i+1+ ")" + itinArray[i][0] + '\n'
    }

    console.log(itinMessage)

    var sendData = {
      id: number,
      itin: itinMessage
    }
    ActivitiesData.sendItin(sendData)
    .then(function(result) {
      console.log('got it back')
    })

  }

  // ActivitiesData.getTripActivities returns and object containing

  // the details for each activity stored in this trip
  // $scope.activities stores an array of all activities
  // $scope.name stores the name of the trip/playlist
  // $scope.destination stores the destination of the trip
  ActivitiesData.getTripActivities($scope.id, function (tripObj) {

    //Refer to join table via the tripObj.data.id

    //return all activities associated with said table.....


    $scope.activities = tripObj.data.list[0];
    $scope.name = tripObj.data.name;
    $scope.time = tripObj.data.time;

    $scope.area = tripObj.data.destination;
    $scope.playlist = tripObj.data; // creating a scope variable of the trip to be used in adddtoWishList below
    

    //map out => name, lat, long
    $scope.locations = $scope.playlist.list[0].map(function(element) {
      console.log(element)
      return [element.name, element.lat, element.lng]
    })

    init($scope.locations)

  });
  // this function adds a playlist to a users wishlist via the addItemstowishlist factory function
  $scope.addToWishList = function () {

    ActivitiesData.postToWishList($scope.playlist);
    console.log('tripObj.data', $scope.playlist);
  }
  
  function MapLabel(opt_options) {
  this.set('fontFamily', 'sans-serif');
  this.set('fontSize', 12);
  this.set('fontColor', '#000000');
  this.set('strokeWeight', 4);
  this.set('strokeColor', '#ffffff');
  this.set('align', 'center');

  this.set('zIndex', 1e3);

  this.setValues(opt_options);
}
MapLabel.prototype = new google.maps.OverlayView;

window['MapLabel'] = MapLabel;


/** @inheritDoc */
MapLabel.prototype.changed = function(prop) {
  switch (prop) {
    case 'fontFamily':
    case 'fontSize':
    case 'fontColor':
    case 'strokeWeight':
    case 'strokeColor':
    case 'align':
    case 'text':
      return this.drawCanvas_();
    case 'maxZoom':
    case 'minZoom':
    case 'position':
      return this.draw();
  }
};

/**
 * Draws the label to the canvas 2d context.
 * @private
 */
MapLabel.prototype.drawCanvas_ = function() {
  var canvas = this.canvas_;
  if (!canvas) return;

  var style = canvas.style;
  style.zIndex = /** @type number */(this.get('zIndex'));

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = this.get('strokeColor');
  ctx.fillStyle = this.get('fontColor');
  ctx.font = this.get('fontSize') + 'px ' + this.get('fontFamily');

  var strokeWeight = Number(this.get('strokeWeight'));

  var text = this.get('text');
  if (text) {
    if (strokeWeight) {
      ctx.lineWidth = strokeWeight;
      ctx.strokeText(text, strokeWeight, strokeWeight);
    }

    ctx.fillText(text, strokeWeight, strokeWeight);

    var textMeasure = ctx.measureText(text);
    var textWidth = textMeasure.width + strokeWeight;
    style.marginLeft = this.getMarginLeft_(textWidth) + 'px';
    // Bring actual text top in line with desired latitude.
    // Cheaper than calculating height of text.
    style.marginTop = '-0.4em';
  }
};

/**
 * @inheritDoc
 */
MapLabel.prototype.onAdd = function() {
  var canvas = this.canvas_ = document.createElement('canvas');
  var style = canvas.style;
  style.position = 'absolute';

  var ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';
  ctx.textBaseline = 'top';

  this.drawCanvas_();

  var panes = this.getPanes();
  if (panes) {
    panes.mapPane.appendChild(canvas);
  }
};
MapLabel.prototype['onAdd'] = MapLabel.prototype.onAdd;

/**
 * Gets the appropriate margin-left for the canvas.
 * @private
 * @param {number} textWidth  the width of the text, in pixels.
 * @return {number} the margin-left, in pixels.
 */
MapLabel.prototype.getMarginLeft_ = function(textWidth) {
  switch (this.get('align')) {
    case 'left':
      return 0;
    case 'right':
      return -textWidth;
  }
  return textWidth / -2;
};

/**
 * @inheritDoc
 */
MapLabel.prototype.draw = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  if (!this.canvas_) {
    // onAdd has not been called yet.
    return;
  }

  var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));
  if (!latLng) {
    return;
  }
  var pos = projection.fromLatLngToDivPixel(latLng);

  var style = this.canvas_.style;

  style['top'] = pos.y + 'px';
  style['left'] = pos.x + 'px';

  style['visibility'] = this.getVisible_();
};
MapLabel.prototype['draw'] = MapLabel.prototype.draw;


MapLabel.prototype.getVisible_ = function() {
  var minZoom = /** @type number */(this.get('minZoom'));
  var maxZoom = /** @type number */(this.get('maxZoom'));

  if (minZoom === undefined && maxZoom === undefined) {
    return '';
  }

  var map = this.getMap();
  if (!map) {
    return '';
  }

  var mapZoom = map.getZoom();
  if (mapZoom < minZoom || mapZoom > maxZoom) {
    return 'hidden';
  }
  return '';
};

/**
 * @inheritDoc
 */
 function init(array) {
  var myLatlng = new google.maps.LatLng(array[0][1], array[0][2]);
  var myOptions = {
    zoom: 12,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

      var map = new google.maps.Map(document.getElementById('map'), myOptions);
//////////  markers 

  var image = {
    url: './cater.gif',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(100, 100),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(0, 32)
  };

var NewLabels=array

  for (var i = 0; i < NewLabels.length; i++) {
var title = NewLabels[i][0];
        var title = new MapLabel({
          text: NewLabels[i][0],
          position: new google.maps.LatLng(NewLabels[i][1], NewLabels[i][2]),
          map: map,
          fontSize: 14,
          align: 'right'
        });

        var marker = new google.maps.Marker({animation: google.maps.Animation.DROP, icon: image,});
        marker.bindTo('map', title);
        marker.bindTo('position', title);
        marker.setDraggable(true);
};
///////////
    

       }
      
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-12846745-20']);
      _gaq.push(['_trackPageview']);
      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();

  //create maps

})
