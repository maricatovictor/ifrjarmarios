// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase'])

.controller('LockerCtrl', function($scope, $firebaseArray, $timeout, $ionicScrollDelegate, $ionicModal, $ionicPopup){
  var lockersRef = new Firebase('https://ifrjarmariosdb.firebaseio.com/armarios');

  function setSrc(attNum){
    if(attNum == 101 || attNum == 102){
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
        lockersRef.once('value', function(snapshot){
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
            console.log($scope.lockers);
            
            });
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
    var checkLockerQuery = lockersRef.orderByChild('number').equalTo(showingLocker.number);
    $scope.lockerNum = showingLocker.number;
    checkLockerQuery.once('value', function(snapshot){
      $timeout(function(){
        snapshot.forEach(function(data){
          dataval = data.val();
          if(dataval.available == "Sim"){
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
        });
      });
    });
  };

  $scope.updateLockerInfo = function(){
    var ownerInputName = document.getElementById('ownerInputName').value;
    var ownerInputClass = document.getElementById('ownerInputClass').value;
    var ownerInputMat = document.getElementById('ownerInputMat').value;
    var ownerInputContact = document.getElementById('ownerInputContact').value;
    var lockerNum = parseInt($scope.lockerNum);
    var submitInfo = document.getElementById("submitInfo");
    if(ownerInputName.length > 0 && ownerInputClass.length > 0 && ownerInputMat.length > 0 && ownerInputContact.length > 0){
    updateInfoQuery = lockersRef.orderByChild('number').equalTo(lockerNum);
    updateInfoQuery.once('value', function(snapshot){
      snapshot.forEach(function(data){
        var key = data.key();
        lockersRef.child(key).update(
        {
          owner: ownerInputName,
          ownerClass: ownerInputClass,
          ownerMat: ownerInputMat,
          ownerContact: ownerInputContact,
          available: 'Não',
          status: 'Alugado'
        });
        $ionicPopup.alert({
        title: 'Sucesso',
        content: 'Cadastro realizado com sucesso, você tem até 1 (um) dia para realizar o pagamento da taxa'
      });
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
    if(showingLocker.available == "Não"){
      AvBadge.className = "badge badge-assertive";
    }
    else if(showingLocker.available == "Sim"){
      AvBadge.className = "badge badge-balanced";
    }
  }

  $scope.returnView = function(){
    $scope.lockersInfoModal.hide();
    $scope.lockersNewRegModal.hide();
  }

});

/*   $scope.preLoadLocker = function(locker){
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
}; */
  /*  
  $scope.getButtonClicked = function() {
      var lockernumber = document.getElementById('lockerNumberInput').value;
      if(lockernumber.length > 0){
      lockersItems = lockersRef.orderByChild('number').equalTo(parseInt(lockernumber));
      $scope.lockers = $firebaseArray(lockersItems);
      setSrc();
      }
      else{
      $scope.lockers = $firebaseArray(lockersRef);
      } 
  }; 

  */

  /*
    $scope.addLocker = function(){
      var number = 100;
      var src;
      for(i=0;i<125;i++){
        number++;
        if(number<125){
        src="img/locker_test.jpg";
      }
      else{
        src="img/locker_test2.png";
      }

      lockersRef.push().set({
          'number': number,
          'src': src
        });
    } 
    };
    */
    /*
    $scope.updateInfo = function(){
    lockersRef.once('value', function(snapshot){
      snapshot.forEach(function(data){
      var number = data.val().number;
      var key = data.key();
      lockersRef.child(key).update(
        {
          owner: 'Victor',
          ownerClass: 'MAM231',
          ownerMat: '102030120340',
          available: 'Não',
          status: 'Alugado'
        });
    });
    });
  };  
        
  }; */

