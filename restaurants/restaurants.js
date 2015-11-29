'use strict'

var utils = (function () {

    function getTimeStamp() {

        var now = new Date(),
            yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
            timeStamp = Math.floor(yesterday.getTime() / 1000);

        return timeStamp;

    }

    return {
        getTimeStamp: getTimeStamp
    };

})();


var locations = (function () {

    var map,
    markers = [],
        infowindows = [];


    function addMarkers(data) {

        console.log('==========  ADD MARKERS ==============');
        console.dir(data);

        var loc,
        len = data.length,
            defaultImg = 'https://placeholdit.imgix.net/~text?txtsize=13&txt=image%20not%20found&w=140&h=150';

        for (var i = 0; i < len; i++) {

            var obj = data[i].location,
                img = data[i].image || defaultImg,
                label = '',
                markup = '',
                myLatlng;

            label = data[i].name || ''.concat(obj.latitude, ' - ', obj.longitude);
            markup = '<h3>' + label + '</h3>' + '<img src="' + img + '"/>';

            console.info('label %s', label);
            console.info('latitude: %s | longitude: %s ', obj.latitude, obj.longitude);

            myLatlng = new google.maps.LatLng(obj.latitude, obj.longitude);
            markers[i] = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: label
            });

            infowindows[i] = new google.maps.InfoWindow({
                content: markup,
                maxWidth: 200
            });

            google.maps.event.addListener(markers[i], 'click', function (innerKey) {
                return function () {
                    for (var w = 0; w < infowindows.length; w++) {
                        infowindows[w].close();
                    }
                    infowindows[innerKey].open(map, markers[innerKey]);
                }
            }(i));
        }
    }




    function placesResponse(response) {

        console.log('------- places response -------');
        console.dir(response);

        var json = response.restaurants || [],
            len = json.length,
            curr,
            locData = [];

        for (var i = 0; i < len; i++) {

            var obj = {};
            obj.location = {
                'latitude': json[i].lat || '',
                    'longitude': json[i].lng || ''
            }
            // json[i].location || '';
            obj.image = json[i].image_url || '';
            obj.name = json[i].name;

            locData.push(obj);

        }
        console.log('========= locData========');
        console.dir(locData);
        addMarkers(locData);
    }

    function getMarkers(obj) {

        console.info('markers');
        console.dir(obj);


        // https://api.instagram.com/v1/media/search?max_timestamp=1410332400&distance=1000&lat=37.8062&lng=-122.4738&access_token=XXX

        // console.log(position.lat);
        // console.log(position.lng);

        //10118

        //http://opentable.herokuapp.com/api/restaurants?zip=10118

        // $.ajax({
        //     method: 'GET',
        //     dataType: 'jsonp',
        //     jsonp: 'locations.placesResponse',
        //     url: 'https://api.instagram.com/v1/media/search?',
        //     data: {
        //         lat: position.lat,
        //         lng: position.lng,
        //         distance: 3000,
        //         min_timestamp: utils.getTimeStamp(),
        //         access_token: tk,
        //         callback: 'locations.placesResponse'
        //     },
        //     success: function(response) {
        //         console.info(response);
        //     }
        // });

        $.ajax({
            method: 'GET',
            dataType: 'json',
            url: 'http://opentable.herokuapp.com/api/restaurants',
            data: obj,
            success: function (response) {
                console.info(response);
                placesResponse(response);
            }
        });

    }

    function clearMarkers() {
        for (var m = 0; m < markers.length; m++) {
            markers[m].setMap(null);
        }
    }

    //     function (request, response) {
    //   geocoder.geocode({ 'address': request.term, 'latLng': centLatLng, 'region': 'US' }, function (results, status) {
    //     response($.map(results, function (item) {
    //       return {
    //        item.address_components.postal_code;//This is what you want to look at
    //       }
    // }



    function translatePosition(position) {

        console.log('translate position');
        console.log(position);

        // $.ajax({
        //     method: 'GET',
        //     dataType: 'json',
        //     url: 'http://ws.geonames.org/findNearbyPostalCodesJSON',
        //     data: {
        //         zip: '10118'
        //     },
        //     success: function(response) {
        //         console.info(response);
        //         placesResponse(response);
        //     }
        // });

        // url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=#{ coords.latitude },#{ coords.longitude }&sensor=true&callback=zipmap"
        $.ajax({
            url: 'http://maps.googleapis.com/maps/api/geocode/json',
            data: {
                'latlng': position.lat + ',' + position.lng,
                // 'sensor': true
                // ,
                // 'callback': 'zipmap'
            },
            dataType: 'json',
            // cache: true,
        }).success(function (data) {
            console.dir(data);

            console.log(data.results[0].formatted_address);

            // var str = data.results[0].formatted_address || '';

            // console.info(str);

            // var patt = new RegExp('^\d{5}(?:[-\s]\d{4})?$');

            // console.info(patt);
            // var res = patt.test(str);

            // console.info(res);

            console.log(data.results[0].address_components);

            var obj = {},
            cmp = data.results[0].address_components,
                len = cmp.length,
                a;

            for (var i = 0; i < len; i++) {
                a = cmp[i];
                console.info(a.types[0]);

                if (a.types[0] === 'postal_code') {
                    obj['zip'] = a.long_name;
                    break;
                }

            }

            console.info('obj ---- ');

            console.dir(obj);
            getMarkers(obj);

        });


    }


    function setMarkers(position) {
        clearMarkers();
        translatePosition(position);
        // getMarkers(position);
    }


    function initialize() {

        //empire state building
        var defaultPosition = {
            lat: 40.7484018,
            lng: -73.9860264
        },
        // icon = 'http://openmbta.org/images/map/PinDown1.png?1306943843',
        icon = 'http://maps.google.com/mapfiles/ms/micons/ylw-pushpin.png',
            circle,
            dropPin,
            infoWin;


        map = new google.maps.Map(document.getElementById('map_div'), {
            zoom: 13,
            center: defaultPosition
        });

        setMarkers(defaultPosition);


        dropPin = new google.maps.Marker({
            position: defaultPosition,
            map: map,
            title: 'Drag Me',
            icon: icon,
            draggable: true,
            animation: google.maps.Animation.DROP
        });



        circle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.2,
            map: map,
            center: defaultPosition,
            radius: 3500
        });


        /*
        google.maps.event.addListener(dropPin, 'dragstart', function () {
            console.info('Dragging...');
            var test = dropPin.getPosition();
            console.warn(test);
        });
        */

        /*
        google.maps.event.addListener(dropPin, 'drag', function () {
            console.info('Dragging...');
            var test = dropPin.getPosition();
            console.warn(test);
        });
        */

        /*      
  google.maps.event.addListener(marker, 'dragend', function() {
    updateMarkerStatus('Drag ended');
    geocodePosition(marker.getPosition());
  });*/

        google.maps.event.addListener(dropPin, 'dragend', function (evt) {

            // var position = {
            //     lat: evt.latLng.G,
            //     lng: evt.latLng.K
            // };

            // infoWin.close();
            // infoWin.setContent('<h3>Location </h3> latitude: ' + position.lat + ' <br/> longitude: ' + position.lng);


            //var position = evt.latLng;

            //console.log('position');
            //console.info(position);

            //var test = dropPin.getPosition().lat();
            //console.warn(test);

            var position = {
                lat: dropPin.getPosition().lat(),
                lng: dropPin.getPosition().lng()
            };


            circle.setCenter(position);
            setMarkers(position);

            //window.setTimeout(function () {
            //map.setCenter(position);
            //}, 1000);


        });

        $('#current_location').click(function () {

            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(function (position) {

                    var position = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // infoWin.close();
                    // infoWin.setContent('<h3>Location </h3> latitude: ' + position.lat + ' <br/> longitude: ' + position.lng);

                    dropPin.setPosition(position);
                    map.setCenter(position);
                    circle.setCenter(position);
                    setMarkers(position);

                });
            } else {

                // infoWin.close();
                // infoWin.setContent('<h3>Location </h3> latitude: ' + position.lat + ' <br/> longitude: ' + position.lng);

                dropPin.setPosition(defaultPosition);
                map.setCenter(defaultPosition);
                circle.setCenter(defaultPosition);
                setMarkers(defaultPosition);

            }

        });

    }

    google.maps.event.addDomListener(window, 'load', initialize);

    return {
        placesResponse: placesResponse
    }

})();