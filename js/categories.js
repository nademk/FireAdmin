inflateSavedCategories();

$("#selected-thumbnail").hide();

$('#category-thumbnail').change(function(){
    previewThumbnail(this);
});

$('#save-category').click(function(){
	
    $('#category-name').removeClass("is-invalid");
    $('#category-desc').removeClass("is-invalid");
    $('#category-thumbnail').removeClass("is-invalid");

    var error = 0;
    var catname = $("#category-name").val();
    var desc = $("#category-desc").val();
    var thumbnail = $('#category-thumbnail').prop("files")[0];
    var validImageTypes = ["image/gif", "image/jpeg","image/png"];

    if(!catname){
        $("#category-name").addClass("is-invalid");
        error = 1;
    }

    if (!desc) {
        $('#category-desc').addClass("is-invalid");
        error = 1;
    }

    if(!thumbnail){
        $('#category-thumbnail').addClass("is-invalid");
        error = 1;
    }

    if($.inArray(thumbnail["type"],validImageTypes)<0){
        $('#category-thumbnail').addClass("is-invalid");
        error = 1;
    }

    if (error == 1)
        return;

    uploadDataToServer();

});

function previewThumbnail(thumbnail){
    if (thumbnail.files && thumbnail.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e){
            $("#selected-thumbnail").attr('src', e.target.result);
            $("#selected-thumbnail").fadeIn();
        }
        reader.readAsDataURL(thumbnail.files[0]);
    }
}

//Upload the data to sever
function uploadDataToServer(){
    
    var db = firebase.firestore();
    var database = firebase.database().ref("categories/" + catname);
    database.once("value").then(function (snapshot){

        if(snapshot.exists()){
            $('#result').attr("class","aler alert-danger");
            $('#result').html("Category already exists");
            resetForm();
        }else{
            //1.Uploading the selected image to firebase storage    
            var name = thumbnail["name"];
            var ext = name.substring(name.lastIndexOf("."),name.length);
            var thumbname = new Date().getTime();

            //Creating path/folder in firebase storage
            var storageRef = firebase.storage().ref(catname+"/"+thumbname);
            var uploadTask = storageRef.put(thumbnail);

            uploadTask.on("state_changed",
            function progress(snapshot){
                var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                $("#upload-progress").html(Math.round(percentage) + "%");
                $("#upload-progress").attr("style","width:"+percentage+"%");
            },
            function error(err){

            },

            function complete() {
                var thumbnailUrl;
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    thumbnailUrl = downloadURL;
                      
                    var cat = {
                        "thumbnail": thumbnailUrl,
                        "desc": desc
                    };
                    database.set(cat, function (err) {
                        if (err) {
                            $("#result").attr("class", "alert alert-danger");
                            $("#result").html(err.message);
                        } else {
                            $("#result").attr("class", "alert alert-success");
                            $("#result").html("Category added");
                            resetForm();
                        }
                    });
                });//close of uploadTask
            });//close of function complete
        }//close of else
    }); 
}//close of function uploadDataToServer

function inflateSavedCategories(){
    var dbCategories = firebase.database().ref("categories");
    dbCategories.on("value",function(categories){
    	if (categories.exists()) {
    		var categorieshtml = "";
    		categories.forEach(function(category){
    			categorieshtml += "<tr>";

    			//for category name
    			categorieshtml += "<td>";
    			categorieshtml += category.key;
    			categorieshtml += "</td>";

    			//for category desc
    			categorieshtml += "<td>";
    			categorieshtml += category.val().desc;
    			categorieshtml += "</td>";

    			//for category name
    			categorieshtml += "<td> <img width='200' height='150' src='";
    			categorieshtml += category.val().thumbnail;
    			categorieshtml += "'/></td>";

    			categorieshtml += "</tr>";
    		});//close of forEach
    		$("#categories").html(categorieshtml);
    	}//close of if(exists)
    });
}//close of function inflateSavedCategories

function resetForm() {
    $("#new-category").reset();
    $("#selected-thumbnail").fadeOut();
    $("#upload-progress").html("Completed");
}