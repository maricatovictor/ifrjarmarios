/* App para reserva de armários desenvolvido para a Chapa Grêmio of Thrones, do Grêmio Elisabetta Bonante do 
* Instituto Federal do Rio de Janeiro - Campus Rio de Janeiro
* Outras chapas estão autorizadas a utilizar o aplicativo, contanto que sejam autorizadas a tal
* A responsabilidade pela aplicação do aplicativo e manutenção do mesmo não é do desenvolvedor do aplicativo, 
* sendo a chapa que o utiliza responsável por divulgar o aplicativo e, em caso de erros, contatar o desenvolvedor ou 
* alguém competente para corrigir os mesmos. 
* O aplicativo foi desenvolvido utilizando o framework Ionic Framework, Ionic.io. 
* Quaisquer problemas, sugestões e etc., entre em contato com o desenvolvedor. 
* Plágio é crime, se for constatada tentativa de fraude, utilização ou apropriação indevida do aplicativo, ou outro tipo de ilegalidades, a responsabilidade
* é do usuário, que será autuado devidamente e o caso será passado para as autoridades competentes. 

* O aplicativo poderá ser modificado. Grandes modificações serão notificadas e deverão ser autorizadas pela Chapa que utilizar o
* app. Pequenas modificações não necessitam ser avisadas e poderão não ser publicadas no Github.com. 

* O aplicativo é livre para estudos e consultas. 

* Desenvolvido por: Victor Maricato Oliveira
* Turma (Abril de 2016, Semestre 2016.1): BM131. 
* Contato: maricatovictor@gmail.com
*/


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ionic.service.core', 'firebase'])

.run(function($ionicPlatform, $ionicPopup) { //Roda algumas verificações como checar se o usuário está conectado
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) { //Settings para ionic splashart
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
   if (navigator.splashscreen) {
     navigator.splashscreen.hide();
  } 
  if(window.Connection) { //Checa se o usuário está conectado
      if(navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
          title: 'Desconectado',
          content: 'Você está sem acesso à internet!'
        })
        .then(function(result) {
            ionic.Platform.exitApp(); //Sai do app após popup
        });
      }
    }
  });
})

.controller('LockerCtrl', function($scope, $firebaseArray, $timeout, $ionicScrollDelegate, $ionicModal, $ionicPopup){
  var lockersRef = new Firebase('https://ifrjarmarios.firebaseio.com/armarios'); //Referencia onde o banco está localizado e
  var hoursRef = new Firebase('https://ifrjarmarios.firebaseio.com/horarios'); // cria uma bar para se comunicar com o banco
  hnow = new Date().getHours(); //Usa o JS para pegar a hora do device para um check inicial de hora
  hoursRef.update({ timestamp: Firebase.ServerValue.TIMESTAMP}); //Faz um update da hora atual do server na REST
  alertText = document.getElementById('alertText'); //Pega o elemento com a id no index.html
  $scope.setTimeCountControllers = function(){ //Onde ocorrem os checks de hora
    var searchButton = document.getElementById('search_button');
    if(hnow >= 9 || hnow <= 12 || hnow >= 14 || hnow <= 18 || hnow >= 20 || hnow >= 23){ //check inicial
      hoursRef.once('value', function(data){ //check virtual; não usa o horário do device 
          var manha1 = data.val().manha1; //pega o valor dessa variável na REST
          var manhafin = data.val().manhafin;
          var tarde1 = data.val().tarde1;
          var tardefin = data.val().tardefin;
          var noite1 = data.val().noite1;
          var noitefin = data.val().noitefin;
          var lastH1 = data.val().lastH1;
          var lastHfin = data.val().lastHfin;
          hcount = data.val().hcount; //pega a variável que armazena a contagem de armários reservados no último turno
          timestamp = data.val().timestamp; //pega o horário atual no firebase
          timestampDate = new Date(timestamp * 1000).getTime(); //conversão para uma data legível
          heuteData = new Date(timestampDate);
          heuteData.setHours(hnow - 2); //GMT
          if(hnow >= manha1 && hnow < manhafin || hnow >= tarde1 && hnow < tardefin || hnow >= noite1 && hnow < noitefin){ //check de horário
            window.timecheck = true;
            if(hnow != lastH1 && hnow != lastHfin){
              hoursRef.update({hcount: 0});
            }

          thisHourI = hnow;
          thisHourFin = hnow + 1;
          hoursRef.update({lastH1: thisHourI, lastHfin:thisHourFin} );

            if(hcount < 125){ //check de armários registrados
            window.countcheck = true;
            }
            else{
            window.countcheck = false;
            searchButton.className = "button button-full button-assertive";
            alertText.innerHTML = "Já foram cadastrados 125 armários neste horário";
            alertText.style.color = "red";
            }
          }
          else{
            window.timecheck = false;
            searchButton.className = "button button-full button-assertive";
            alertText.innerHTML = "O horário de locação ainda não foi aberto ";
            alertText.style.color = "red";
          }
        });
    }  
    timecheck = 'timecheck' in window; //retorna como boolean se timecheck estiver true em window
    countcheck = 'countcheck' in window;
  };

  function setFilSrc(attFileira){ //define no app as imagens de coordenada de fileira
    if(attFileira == 1){
      $scope.imgFilSrc = 'img/Fileira_1.jpg';
    }
    else if(attFileira == 2){
      $scope.imgFilSrc = 'img/Fileira_2.jpg';
    }
    else if(attFileira == 3){
    	$scope.imgFilSrc = 'img/Fileira_3.jpg';

    }
    else if(attFileira == 4){
    	$scope.imgFilSrc = 'img/Fileira_4.jpg';
    }
    else{
    	$scope.imgFilSrc = '';
    }
  };

  $scope.scrollToTop = function(){
    $ionicScrollDelegate.scrollTop();
  }
  $scope.preLoadLocker = function(locker){ //baixa o armário que será mostrado na segunda activity e o prepara para ser mostrado
    $scope.showingLocker = [];
        var query = lockersRef.orderByChild('number').equalTo(locker.number); 
        query.once('value', function(snapshot){
        	 $timeout(function() {
          snapshot.forEach(function(data){
            var attFileira = data.val().fileira;
            dataval = data.val();
              $scope.key = data.key();
              setFilSrc(attFileira);
              $scope.showingLocker = [
              {
                number: dataval.number,
                fileira: dataval.fileira,
                filSrc: $scope.imgFilSrc, 
                src: dataval.MapImgSrc, 
                owner: dataval.owner,
                ownerClass: dataval.ownerClass,
                ownerMat: dataval.ownerMat,
                available: dataval.available,
                status: dataval.status
              }];
            });
          });
      });
      };


  $scope.getButtonClicked = function() { //Função executada no botão de 'Pesquisar'
    if(window.Connection) { //confirma novamente se a internet está OK
      if(navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
          title: 'Desconectado',
          content: 'Você está sem acesso à internet!'
        })
        .then(function(result) {
            ionic.Platform.exitApp();
        });
      }
    }
    $scope.lockers = [];
    alertText.innerHTML = "";
      var lockernumber = document.getElementById('lockerNumberInput').value;
      
      if(lockernumber.length > 0){ //vê se algum número específico foi escrito na barra de pesquisa
        lockerInputedNumber = parseInt(lockernumber);
        var query = lockersRef.orderByChild('number').equalTo(lockerInputedNumber); 
        query.once('value', function(snapshot){
        $timeout(function(){   
          snapshot.forEach(function(data){
            var attFileira = data.val().fileira;
            dataval = data.val();
              $scope.key = data.key(); 
              setFilSrc(attFileira);
              $scope.lockers = [
              {
                number: dataval.number,
                fileira: dataval.fileira,
                filSrc: $scope.imgFilSrc,  
                src: dataval.MapImgSrc, 
                owner: dataval.owner,
                ownerClass: dataval.ownerClass,
                ownerMat: dataval.ownerMat,
                available: dataval.available,
                status: dataval.status
              }];
            });
          });
        });
      }
 
      else{ //se não houver nenhum número na barra de pesquisa, busca todos os armários que estão reservados e verifica se já expiraram
        var reservadoQuery = lockersRef.orderByChild('status').equalTo("Reservado");
        $timeout(function() {
        reservadoQuery.once('value', function(snapshot){
          snapshot.forEach(function(data){
            var dataval = data.val();
            $scope.key = data.key();
            if(dataval.status == 'Reservado' && dataval.available == 'Não'){
              regData = new Date(data.val().regData);
              timeoutCheck = regData;
              timeoutCheck.setDate(timeoutCheck.getDate() + 1);
              $timeout(function() {
                if(timeoutCheck.getHours() <= heuteData.getHours() && timeoutCheck.getDate() <= heuteData.getDate()){
                var attNum = dataval.number;
                setTimeout(function() {
                lockersRef.child($scope.key).update({
                  owner: '',
                  ownerClass: '',
                  ownerMat: '',
                  available: 'Sim',
                  ownerContact: '',
                  regData: '',
                  status: 'Expirado'
                });
            setFilSrc(attFileira);
            $scope.lockers.push(
              {
                number: dataval.number,
                fileira: dataval.fileira,
                filSrc: $scope.imgFilSrc,  
                src: dataval.MapImgSrc, 
                owner: dataval.owner,
                ownerClass: dataval.ownerClass,
                ownerMat: dataval.ownerMat,
                available: dataval.available,
                status: dataval.status
              }
              );
          });
              }
            });
            }
          });
        });
      });
        var availableQuery = lockersRef.orderByChild('available').equalTo("Sim"); 
        availableQuery.once('value', function(snapshot){ //busca todos os armários disponíveis e armaneza num array enviado ao HTML
          $timeout(function(){ //Timeout para garantir que o app espera esse resultado chegar antes de ler a próxima função
          snapshot.forEach(function(data){
            dataval = data.val();
            var attFileira = data.val().fileira;
            setFilSrc(attFileira);
            $scope.lockers.push(
              {
                number: dataval.number,
                fileira: dataval.fileira,
                filSrc: $scope.imgFilSrc,  
                src: dataval.MapImgSrc, 
                owner: dataval.owner,
                ownerClass: dataval.ownerClass,
                ownerMat: dataval.ownerMat,
                available: dataval.available,
                status: dataval.status
              }
              );
            });
          window.availableLockersCount = $scope.lockers.length;
          if(window.availableLockersCount == 0){
            alertText.style.color = 'red';
          }
          else if(window.availableLockersCount > 0 && window.availableLockersCount < 30){
          alertText.style.color = 'gold';
        }
        else{
          alertText.style.color = 'green';
        }
        alertText.innerHTML = "<b>" + window.availableLockersCount + " armarios disponiveis" + "</b>";
          
        });
      });
      }  
  };

$ionicModal.fromTemplateUrl('lockers-info.html', function(modal) { //modal para próxima activity
    $scope.lockersInfoModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });
  
  $ionicModal.fromTemplateUrl('lockers-newReg.html', function(modal){
    $scope.lockersNewRegModal = modal;
  },
  {
    scope: $scope,
    animation: 'slide-in-up'
  });

  $scope.openLockerNewReg = function(showingLocker){ //abre o modal para reservar um armário
    hoursRef.once('value', function(snapshot){
      hcount = snapshot.val().hcount;
      if(hcount < 125){ //faz um check pra ver se ainda é permitido reservar
            countcheck = true;
          }

      else{
            countcheck = false;
          }
    });
    
    var checkLockerQuery = lockersRef.orderByChild('number').equalTo(showingLocker.number);
    $scope.lockerNum = showingLocker.number;
    
    checkLockerQuery.once('value', function(snapshot){
     $timeout(function(){
        snapshot.forEach(function(data){
          dataval = data.val();
          
          if(dataval.available == "Sim" && timecheck === true && countcheck === true){
            $scope.lockersNewRegModal.show(); //se tudo estiver certo, exibe a activity de reserva de armário, se não, apresenta o erro
          }

          else if(dataval.available == "Não"){
            $ionicPopup.alert({
        title: 'Erro',
        content: 'O armário não está mais disponível'
      });
            $scope.lockersInfoModal.hide();
            $scope.lockersNewRegModal.hide();
          }
          
          else if(timecheck === false){
            $ionicPopup.alert({
              title: 'Não está na hora de alugar',
              template: 'Tente novamente mais tarde'
            });
            $scope.lockersInfoModal.hide();
            $scope.lockersNewRegModal.hide();
          }

          else if(countcheck === false){
            $ionicPopup.alert({
              title: 'Limite de Armários Registrados no Horário Atingido',
              template: 'Já foram mais de 125 armários registrados neste horário. Tente novamente mais tarde'
              });
            $scope.lockersInfoModal.hide();
            $scope.lockersNewRegModal.hide();
            }
          });
        });
      });
    };

  $scope.updateLockerInfo = function(showingLocker){ //Reserva o Armário com as informações inseridas na activity de reserva
    hoursRef.once('value', function(snapshot){
      hcount = snapshot.val().hcount;

      if(hcount < 125){
          countcheck = true;
        }
      else{
          countcheck = false;
        }
    });
    var ownerInputName = document.getElementById('ownerInputName').value;
    var ownerInputClass = document.getElementById('ownerInputClass').value;
    var ownerInputMat = document.getElementById('ownerInputMat').value;
    var ownerInputContact = document.getElementById('ownerInputContact').value;
    var lockerNum = parseInt($scope.lockerNum);
    var submitInfo = document.getElementById("submitInfo");

    if(ownerInputName.length > 0 && ownerInputClass 
      .length > 0 && ownerInputMat.length > 0 && ownerInputContact.length > 0){ //checa se está tudo preenchido

    updateInfoQuery = lockersRef.orderByChild('number').equalTo(lockerNum);
  $timeout(function(){
    window.matCheck = true;
    matCheckQuery = lockersRef.orderByChild('ownerMat').equalTo(ownerInputMat).on('value', function(snapshot){
      snapshot.forEach(function(data){
        if(data.val().ownerMat == ownerInputMat){
          window.matCheck = false;
        }
      });
    });
  });
    matCheck = 'matCheck' in window;
    updateInfoQuery.once('value', function(snapshot){
      snapshot.forEach(function(data){
        var key = data.key();
        var dataval = data.val();
        if(dataval.available == "Sim" && countcheck === true && matCheck === true){
        hcount++;
        hoursRef.update({hcount: hcount});
        lockersRef.child(key).update(
          {
          owner: ownerInputName,
          ownerClass: ownerInputClass,
          ownerMat: ownerInputMat,
          ownerContact: ownerInputContact,
          available: 'Não',
          status: 'Reservado',
          regData: heuteData
          }); //faz o push das informações inseridas na REST
        $ionicPopup.alert(
          {
        title: 'Sucesso',
        content: 'Cadastro realizado com sucesso, você tem até 1 (um) dia para realizar o pagamento da taxa'
          });
        $scope.lockersNewRegModal.hide();
        $scope.lockersInfoModal.hide();
        }

     else if(dataval.available == "Não"){
            $ionicPopup.alert({
        title: 'Erro',
        content: 'O armário não está mais disponível'
      });
            $scope.lockersInfoModal.hide();
            $scope.lockersNewRegModal.hide();
          }

      else if(countcheck === false){
            $ionicPopup.alert({
              title: 'Limite de Armários Registrados no Horário Atingido',
              template: 'Já foram mais de 125 armários registrados neste horário. Tente novamente mais tarde'
            });
          $scope.lockersInfoModal.hide();
          $scope.lockersNewRegModal.hide();
          }
      else if(matCheck === false){ //matrícula já cadastrada
        $ionicPopup.alert({
              title: 'Já há um armário registrado nesta matrícula',
              template: 'Permita que outras pessoas também possam alugar seus armários'
            });
          $scope.lockersInfoModal.hide();
          $scope.lockersNewRegModal.hide();
      }
      });
    });
  }

  else{
    $ionicPopup.alert({
        title: 'Erro',
        content: 'Você está tentando inserir valores nulos ou inválidos'
      });
    }
  };
  $scope.openLockerInfo = function(){
    $scope.lockersInfoModal.show();
  }
  $scope.setAvBadgeColor = function(showingLocker){ //função estética, altera as cores de acordo com o status do armário
    var AvBadge = document.getElementById("av_badge");
    var statusp = document.getElementById("status_p");
    if(showingLocker.available == "Não" && showingLocker.status == "Alugado"){
      AvBadge.className = "badge badge-assertive";
      }
    else if(showingLocker.available == "Não" && showingLocker.status == "Renovado"){
      AvBadge.className = "badge badge-assertive";
      statusp.style.color = "gold";
      }
    else if(showingLocker.available == "Sim"){
      AvBadge.className = "badge badge-balanced";
      }
    else if(showingLocker.status == "Reservado" && showingLocker.available == "Não"){
      AvBadge.className = "badge badge-energized";
      statusp.style.color = "gold";
      }
  }

  $scope.returnView = function(){
    $scope.lockersInfoModal.hide();
    $scope.lockersNewRegModal.hide();
  }

}); //acaba o app.js
