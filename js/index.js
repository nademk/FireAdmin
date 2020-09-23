
firebase.auth.Auth.Persistence.LOCAL;		//maintains session for user

$("#btn-login").click(function(){
	var email = $('#l-email').val();
	var pass = $('#l-password').val();

	var result = firebase.auth().signInWithEmailAndPassword(email,pass)
        
	result.catch(function(error){

		alert("Invalid login credentials");
		
		var errorCode = error.code;
		var errorMessage = error.message;

		console.log(errorCode);
		console.log(errorMessage);

	});
});