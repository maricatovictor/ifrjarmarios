// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ionic.service.core', 'firebase'])

.controller('LockerCtrl', function($scope, $firebaseArray, $timeout, $ionicScrollDelegate, $ionicModal, $ionicPopup){
  var lockersRef = new Firebase('https://ifrjarmariosdb.firebaseio.com/armarios');
  var hoursRef = new Firebase('https://ifrjarmariosdb.firebaseio.com/horarios');
  hnow = new Date().getHours();
  heuteData = new Date();
  heuteData.setHours(hnow - 3);
  alertText = document.getElementById('alertText');
  $scope.setTimeCountControllers = function(){
    var searchButton = document.getElementById('search_button');
    if(hnow >= 9 || hnow <= 12 || hnow >= 14 || hnow <= 18 || hnow >= 20 || hnow >= 23){
      $timeout(function(){
      hoursRef.once('value', function(data){
          var manha1 = data.val().manha1;
          var manhafin = data.val().manhafin;
          var tarde1 = data.val().tarde1;
          var tardefin = data.val().tardefin;
          var noite1 = data.val().noite1;
          var noitefin = data.val().noitefin;
          var lastH1 = data.val().lastH1;
          var lastHfin = data.val().lastHfin;
          hcount = data.val().hcount;

          if(hnow >= manha1 && hnow < manhafin || hnow >= tarde1 && hnow < tardefin || hnow >= noite1 && hnow < noitefin){
            window.timecheck = true;

            if(hnow != lastH1 && hnow != lastHfin){
              hoursRef.update({hcount: 0});
            }

          thisHourI = hnow;
          thisHourFin = hnow + 1;
          hoursRef.update({lastH1: thisHourI, lastHfin:thisHourFin} );

            if(hcount < 125){
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
    });
    }  
    timecheck = 'timecheck' in window;
    countcheck = 'countcheck' in window;
  };

  function setSrc(attNum){
    if(attNum < 10 || attNum >= 15 && attNum <= 20){
      $scope.imgSrc = 'img/locker_test2.png';
    }
    else{
      $scope.imgSrc = 'img/locker_test.jpg';
    }
  };

  $scope.scrollToTop = function(){
    $ionicScrollDelegate.scrollTop();
  }
  $scope.preLoadLocker = function(locker){
    $scope.showingLocker = [];
        var query = lockersRef.orderByChild('number').equalTo(locker.number); 

        query.once('value', function(snapshot){
        $timeout(function(){   
          snapshot.forEach(function(data){
            var attNum = data.val().number;
            dataval = data.val();
              $scope.key = data.key();
              setSrc(attNum);
              $scope.showingLocker = [
              {
                number: dataval.number, 
                src:$scope.imgSrc, 
                owner: dataval.owner,
                ownerClass: dataval.ownerClass,
                ownerMat: dataval.ownerMat,
                available: dataval.available,
                status: dataval.status
              }];
              console.log($scope.showingLocker); 
            });
          });
        });
};


  $scope.getButtonClicked = function() {
    $scope.lockers = [];
    alertText.innerHTML = "";
      var lockernumber = document.getElementById('lockerNumberInput').value;
      if(lockernumber.length > 0){
        lockerInputedNumber = parseInt(lockernumber);
        var query = lockersRef.orderByChild('number').equalTo(lockerInputedNumber); 
        
        query.once('value', function(snapshot){
        $timeout(function(){   
          snapshot.forEach(function(data){
            var attNum = data.val().number;
            dataval = data.val();
              $scope.key = data.key(); 
              setSrc(attNum);
              $scope.lockers = [
              {
                number: dataval.number, 
                src:$scope.imgSrc, 
                owner: dataval.owner,
                ownerClass: dataval.ownerClass,
                ownerMat: dataval.ownerMat,
                available: dataval.available,
                status: dataval.status
              }];
              console.log($scope.lockers); 
            });
          });
        });
      }
 
      else{
        var reservadoQuery = lockersRef.orderByChild('status').equalTo("Reservado");
        reservadoQuery.once('value', function(snapshot){
           
          snapshot.forEach(function(data){
            var dataval = data.val();
            $scope.key = data.key();
            if(dataval.status == 'Reservado' && dataval.available == 'Não'){
              regData = new Date(data.val().regData);
              console.log(regData.getHours() + 1);
              timeoutCheck = regData;
              timeoutCheck.setDate(timeoutCheck.getDate() + 1);
              if(timeoutCheck.getDate() <= heuteData.getDate()){
                var attNum = dataval.number;
                console.log("abbbba");
                lockersRef.child($scope.key).update({
                  owner: '',
                  ownerClass: '',
                  ownerMat: '',
                  available: 'Sim',
                  ownerContact: '',
                  regData: '',
                  status: 'Expirado'
                });

            setSrc(attNum);
            $scope.lockers.push(
              {
                number: dataval.number, 
                src:$scope.imgSrc, 
                owner: dataval.owner,
                ownerClass: dataval.ownerClass,
                ownerMat: dataval.ownerMat,
                available: dataval.available,
                status: dataval.status
              }
              );
              }
            }
          });
        });
       
        var availableQuery = lockersRef.orderByChild('available').equalTo("Sim");

        availableQuery.once('value', function(snapshot){
          $timeout(function(){
          snapshot.forEach(function(data){
            dataval = data.val();
            var attNum = data.val().number;
            setSrc(attNum);
            $scope.lockers.push(
              {
                number: dataval.number, 
                src:$scope.imgSrc, 
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

$ionicModal.fromTemplateUrl('lockers-info.html', function(modal) {
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

  $scope.openLockerNewReg = function(showingLocker){
    //Executar if available
    hoursRef.once('value', function(snapshot){
      hcount = snapshot.val().hcount;
      if(hcount < 125){
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
            $scope.lockersNewRegModal.show();
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

  $scope.updateLockerInfo = function(showingLocker){
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
      .length > 0 && ownerInputMat.length > 0 && ownerInputContact.length > 0){

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
    console.log(matCheck);
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
          });
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
      else if(matCheck === false){
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
  $scope.setAvBadgeColor = function(showingLocker){
    var AvBadge = document.getElementById("av_badge");
    var statusp = document.getElementById("status_p");
    if(showingLocker.available == "Não" && showingLocker.status == "Alugado"){
      AvBadge.className = "badge badge-assertive";
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
   
});

 
/*   
$scope.addLocker = function(){
      var number = 400; //ultimo numero de armario
      for(i=0;i<5;i++){ //i<quantidade de armarios a serem adicionados
        number++;
      lockersRef.push().set({
          'number': number,
          'available': 'Sim',
           'status': "Disponível"
        });
    } 
    };*/

