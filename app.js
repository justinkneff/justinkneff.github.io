(function(){
    'use strict';
    var repos = [];

    //not using jquery because ajax isn't a new technology.
    function getCall(full_url, fnToCall) {
        if (!full_url) {
            throw ("Empty URL");
        }
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = fnToCall;
        xhttp.open("GET", full_url, true);
        xhttp.send();
    }

    function getRepos(){
        if (this.readyState == 4 && this.status == 200) {
            repos = JSON.parse(this.response);
            document.getElementById("badge1").setAttribute("data-badge", repos.length);
            document.getElementById("badge2").setAttribute("data-badge", repos.length);
        }
    }

    getCall("https://api.github.com/users/justinkneff/repos", getRepos);
})();
