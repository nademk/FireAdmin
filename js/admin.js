$('#btn-logout').click(function () {
    firebase.auth().signOut();
});

function switchView(view) {
    $.get({
        url: view,
        cache: false
    }).then(function (data) {
        $("#main-content").html(data);
    });
}