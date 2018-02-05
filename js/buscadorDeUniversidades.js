// geolocalizacao -- início
function enviarLocalizacao(position) {
  inserirMapa({lat: position.coords.latitude, lng: position.coords.longitude});
  inserirMarcadorDeLocal({lat: position.coords.latitude, lng: position.coords.longitude});
  inserirUniversidadesProximas({lat: position.coords.latitude, lng: position.coords.longitude}, 5000);
  habilitarCampoRaioDeBusca({lat: position.coords.latitude, lng: position.coords.longitude});
  return position.coords;
}

function recebeErrosDaGeolocalizacao(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            $('.msgErro').text("Para utilizar o servi\u00E7o, voc\u00EA precisa compartilhar sua localiza\u00E7\u00E3o").show();
            break;
        case 'default':
            $('.msgErro').text("Não conseguimos encontrar sua localização... tente novamente mais tarde.").show();
            break;
    }
}

function recuperarGeolocalizacao() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(enviarLocalizacao, recebeErrosDaGeolocalizacao);
    } else {
        console.log("Geolocalização não suportada :(");
    }
}

function armazenarLocalizacaoDaUniversidade(nome, latitude, longitude){
  $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/buscador-de-universidades/universidades',
      crossDomain: true,
      data:  { nome,latitude, longitude},
      dataType: 'json',
      success: function(responseData, textStatus, jqXHR) {
          var value = responseData.someKey;
      },
      error: function (responseData, textStatus, errorThrown) {
          alert('POST failed.');
      }
  });

}

recuperarGeolocalizacao()

// geolocalizacao -- fim

// mapa - start
let map;
let markersArray = [];

function inserirMapa(coordenadas){
  map = new google.maps.Map(document.getElementById('mapa'), {
    zoom: 15,
    center: coordenadas
  });

  return map;
}

function inserirMarcadorDeLocal(coordenadas){
  let marker = new google.maps.Marker({
    position: coordenadas,
    map: map,
    title: 'seu local'
  });

  let localizacaoDoUsuario = new google.maps.LatLng(coordenadas.lat, coordenadas.lng);
}

function inserirUniversidadesProximas(localizacaoDoUsuario, raio){

  let request = {
    query: 'faculdade',
    location: localizacaoDoUsuario,
    radius: raio,
    types: ['university']
  };

  let service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        let place = results[i];

        let contentString =
        '<div id="infobox-content">'+
        '<h3>'+place.name+'</h3>'+
        '<p><stron>Endere\u00E7o:</strong> '+place.vicinity+'</p>'+
        '</div>';

        let infowindow = new google.maps.InfoWindow({
          content: contentString
        });

        let marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          icon: 'img/university-icon.png',
          title: place.name
        });

        markersArray.push(marker);

        marker.addListener('mouseover', function() {
          infowindow.open(map, this);
        });

        marker.addListener('mouseout', function() {
          infowindow.close(map, this);
        });

        marker.addListener('click', function() {
          armazenarLocalizacaoDaUniversidade(this.title, this.position.lat(),  this.position.lng())
        });
      }
    }
  });
}

function limparPontos() {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}

function habilitarCampoRaioDeBusca(localizacaoDoUsuario){
  $('.btn').click(function(){
    limparPontos();
    inserirUniversidadesProximas(localizacaoDoUsuario, $('#raio').val());

    return false;
  });
}

function initMap() {
  recuperarGeolocalizacao();
}
//mapa - fim
