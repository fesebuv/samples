'use strict'

var utils = (function() {

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


var locations = (function(tk) {

    var map,
        markers = [],
        infowindows = [];


    function addMarkers(data) {

        //  console.log('==========  ADD MARKERS ==============');
        // console.dir(data);

        var loc,
            len = data.length,
            defaultImg = 'https://placeholdit.imgix.net/~text?txtsize=13&txt=image%20not%20found&w=140&h=150';

        for (var i = 0; i < len; i++) {

            var obj = data[i].location,
                img = data[i].image.url || defaultImg,
                label = '',
                markup = '',
                myLatlng;

            label = obj.name || ''.concat(obj.latitude, ' - ', obj.longitude);
            markup = '<h3>' + label + '</h3>' + '<img src="' + img + '"/>';

            // console.info('label %s', label);
            // console.info('latitude: %s | longitude: %s ', obj.latitude, obj.longitude);

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

            google.maps.event.addListener(markers[i], 'click', function(innerKey) {
                return function() {
                    for (var w = 0; w < infowindows.length; w++) {
                        infowindows[w].close();
                    }
                    infowindows[innerKey].open(map, markers[innerKey]);
                }
            }(i));
        }
    }


    function placesResponse(response) {

        // console.log('------- places response -------');
        // console.dir(response);

        var json = response.data || [],
            len = json.length,
            curr,
            locData = [];

        for (var i = 0; i < len; i++) {

            var obj = {};
            obj.location = json[i].location || '';
            obj.image = json[i].images.thumbnail || '';

            locData.push(obj);

        }
        // console.log('========= locData========');
        // console.dir(locData);
        addMarkers(locData);
    }

    function getMarkers(position) {

        // https://api.instagram.com/v1/media/search?max_timestamp=1410332400&distance=1000&lat=37.8062&lng=-122.4738&access_token=XXX

        // console.log(position.lat);
        // console.log(position.lng);

        $.ajax({
            method: 'GET',
            dataType: 'jsonp',
            jsonp: 'locations.placesResponse',
            url: 'https://api.instagram.com/v1/media/search?',
            data: {
                lat: position.lat,
                lng: position.lng,
                distance: 3000,
                min_timestamp: utils.getTimeStamp(),
                access_token: tk,
                callback: 'locations.placesResponse'
            },
            success: function(response) {
                console.info(response);
            }
        });

    }

    function clearMarkers() {
        for (var m = 0; m < markers.length; m++) {
            markers[m].setMap(null);
        }
    }

    function setMarkers(position) {
        clearMarkers();
        getMarkers(position);
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

        // infoWin = new google.maps.InfoWindow({
        //     content: '<h3>Location </h3> latitude: ' + defaultPosition.lat + ' <br/> longitude: ' + defaultPosition.lng,
        //     maxWidth: 200
        // });

        // infoWin.open(map, dropPin);


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


        google.maps.event.addListener(dropPin, 'dragend', function(evt) {

            // var position = {
            //     lat: evt.latLng.G,
            //     lng: evt.latLng.K
            // };

            // infoWin.close();
            // infoWin.setContent('<h3>Location </h3> latitude: ' + position.lat + ' <br/> longitude: ' + position.lng);


            var position = evt.latLng;


            circle.setCenter(position);
            setMarkers(position);

            //window.setTimeout(function(){
                //map.setCenter(position);
            //},1000);
            

        });

        $('#current_location').click(function() {

            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(function(position) {

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

})(t);