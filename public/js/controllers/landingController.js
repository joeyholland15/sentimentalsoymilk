angular.module('app.landing', ['app.services', 'angular-carousel'])

// ActivitiesData a factory/service stored in app.services
// $location is for redirecting

.controller('LandingController', function ($scope, $http, Ratings, ActivitiesData, $location, Ratings) {


  $scope.timeOptions = ['Quarter Day', 'Half Day', 'Full Day', 'Night'];
  // this stores the value of what time duration the user wants to filter for use in a get request along with location info.
  var searchedTime;

  $scope.data;
  $scope.time;

  //CREATE AN object to send time and location to the api
  $scope.searchData = {};
  
  $scope.searchTime = function (time) {
    $scope.tripResults = ""
    ActivitiesData.getTrips()
    .then(function(results) {
      $scope.data = results.data.filter(function(element) {
        return element.timeReq === time
      })
    $scope.tripResults = $scope.data
    })
  };

  // this method makes a get request to the api for playlists filtered by user inputs of location and duration
  // $scope.filteredByTimeTrips = function () {
  //   // make a get 
  //   ActivitiesData.getSearchedTrips($scope.searchData)
  //     .then(function(trips){
  //       $scope.searchResults = trips.data;  
  //     })

  // }

   var coordinates = ActivitiesData.getip(); //lat and long returned here

  // <h4>ActivitiesData.getTrips()</h4>
  // function that gets all the trips to populate the landing page
  // trips are stored in $scope.tripResults


  // ActivitiesData.getTrips()
  // .then(function(results){
  //   console.log('TRIP RESULTS', results.data)
  //   $scope.tripResults = results.data;
  //   console. log('trip results', results.data);
  // })

  $scope.tripResults = 1;
  $scope.ratingArray; 
  //scope.ratingArray, where all the ratings will go 
  //calls Activities Data factory's getTrips - routes to /trips
  ActivitiesData.getTrips()
  //returns results
  .then(function(results){

var filteredResults = [];

    if(coordinates && coordinates.geo.city){
        for (playlists in results.data){
          if(results.data[playlists].area.includes(coordinates.geo.city)){   
            filteredResults.push(results.data[playlists]);
          }   
        }
    }
    
  if(filteredResults[0] === undefined){
    filteredResults = undefined;
  };

    $scope.tripResults = filteredResults || results.data;

    var tripids = $scope.tripResults.map(function(element) {
      return element.id})

    Ratings.getPlaylistRating(tripids)
    .then(function(data) {
      //data.data is obj where keys are pl id and values are
      //array of ratings
      $scope.ratingArray = data.data;
      Ratings.calcRatings($scope.ratingArray, $scope.tripResults)
      console.log('updated results', $scope.tripResults)
    }) 
  })


  // Redirect to view playlist information
  $scope.viewTrip = function (index) {
    // $scope.id is the mongoose _.id for the trip
    $scope.id = $scope.tripResults[index].id;
    $location.path('/trip/' + $scope.id);
  };

    $scope.colors = ["#fc0003", "#f70008", "#f2000d", "#ed0012", "#e80017", "#e3001c", "#de0021", "#d90026", "#d4002b", "#cf0030", "#c90036", "#c4003b", "#bf0040", "#ba0045", "#b5004a", "#b0004f", "#ab0054", "#a60059", "#a1005e", "#9c0063", "#960069", "#91006e", "#8c0073", "#870078", "#82007d", "#7d0082", "#780087", "#73008c", "#6e0091", "#690096", "#63009c", "#5e00a1", "#5900a6", "#5400ab", "#4f00b0", "#4a00b5", "#4500ba", "#4000bf", "#3b00c4", "#3600c9", "#3000cf", "#2b00d4", "#2600d9", "#2100de", "#1c00e3", "#1700e8", "#1200ed", "#0d00f2", "#0800f7", "#0300fc"];

    $scope.slides3 = [];
/////////////  twitter API call
  var request = function(callback){
    if (coordinates && coordinates.geo){
    var lat = coordinates.geo.ll[0];
    var lng = coordinates.geo.ll[1];}
    if (!lat){lat=37.773972; lng=-122.431297;};
    var url = 'https://api.instagram.com/v1/media/search?lat='+lat+'&lng='+lng+'&access_token=16384709.6ac06b4.49b97800d7fd4ac799a2c889f50f2587&callback=JSON_CALLBACK';
    $http.jsonp(url).success(function(data){
      callback(data);
    }).error(function(data){
      console.log("failure: ",arguments);
    });
  }

  request(function(data){
    data = data.data
    for(i = 0; i < data.length; i++){
      $scope.slides3.push(data[i].images.standard_resolution.url);
    }
    //console.log($scope.slides3);
  });
////////////


        



});