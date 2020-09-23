
$('#wallpaper').change(function () {
    previewWallpaper(this);
});

//To inflate categories dropdown
var dbCategories = firebase.database().ref("categories");

dbCategories.once("value").then(function (categories) {
    categories.forEach(function (category) {
        $("#category").append("<option value='" + category.key + "'>" + category.key +"</option>");
    });
});

$('#btn-save').click(function () {

    $('#title').removeClass("is-invalid");
    $('#wallpaper').removeClass("is-invalid");

    var error = 0;
    var title = $("#title").val();
    var wallpaper = $('#wallpaper').prop("files")[0];
    var validImageTypes = ["image/gif", "image/jpeg", "image/png"];

    if (!title) {
        $('#title').addClass("is-invalid");
        error = 1;
    }

    if (!wallpaper) {
        $('#wallpaper').addClass("is-invalid");
    }

    if($.inArray(wallpaper["type"],validImageTypes)<0){
            $('#category-thumbnail').addClass("is-invalid");
            error = 1;
        }

    if (error == 1)
        return;

    var category = $("#category").val();
    var name = wallpaper["name"];
    var ext = name.substring(name.lastIndexOf("."),name.length);
    var imagename = new Date().getTime();

    var storageRef = firebase.storage().ref(category + "/" + imagename + ext);
    var uploadTask = storageRef.put(wallpaper);

    uploadTask.on("state_changed",
    	function progress(snapshot){
    		var percentage = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
    		$("#upload-progress").html(Math.round(percentage)+"%");
    		$("#upload-progress").attr("style","width:"+percentage+"%");
    	},
    	function error(err){

    	},
    	function complete(){
    		 var imageUrl;
    		 uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
		    	imageUrl = downloadURL;

    		 console.log(imageUrl);
    		 var database = firebase.database().ref("images").child(category);

    		 var imageid = database.push().key;
    		 var image = {
    		 	"url" : imageUrl,
    		 	"title" : title
    		 };

    		 database.child(imageid).set(image,function(err){
    		 	alert("Image saved..");
    		 	resetForm();
    		 });
		  	}); 
    	}
    );
});

function previewWallpaper(wallpaper) {
    if (wallpaper.files && wallpaper.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#wallpaper-preview').attr('src', e.target.result);
        }
        reader.readAsDataURL(wallpaper.files[0]);
    }
}

function resetForm() {
    $('#image-form').reset();
    $('#upload-progress').html("Completed");
    $('#wallpaper-preview').attr("src","");
}
