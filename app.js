(function(globals){
    'use strict';
    //js prototypes
    function Repos(repos){
        this.list = repos;
    };
    globals.repos = {};
    globals.languages = {};
    globals.languagesCount = 0;

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

    //response from the server after getting the repositories. Allows setting
    //to a global so that the client can get a count
    function reposResponse(){
        if (this.readyState == 4 && this.status == 200) {
            var responseJSON = JSON.parse(this.response);
            globals.repos = new Repos(responseJSON);    
            var listLength = globals.repos.list.length;
            document.getElementById("badge1").setAttribute("data-badge", listLength);
            document.getElementById("badge2").setAttribute("data-badge", listLength);            
            getLanguages();
        }
    }

    //response from the server after getting the lanaguages to allow for parsing and collecting totals
    function languagesResponse(){
        if (this.readyState == 4 && this.status == 200) {
            var responseJSON = JSON.parse(this.response);
            for (var attributeName in responseJSON){
                if (globals.languages.hasOwnProperty(attributeName)){
                    globals.languages[attributeName] += responseJSON[attributeName];
                } else {
                    globals.languages[attributeName] = responseJSON[attributeName];
                }
            }
            //increment the global count knowing that all things have been added
            //we do this since this isn't using promises so async responses can come back in any order.
            globals.languagesCount += 1;
            if (globals.languagesCount === globals.repos.list.length){
                addPercentages();
            }
        }
    }

    //Languages consist of bytes of each language and repository used.
    function getLanguages(){
        var reposList = globals.repos.list;
        for(var index = 0; index < reposList.length; index++){            
            getCall(reposList[index].languages_url, languagesResponse)
        }
    }

    function addPercentages(){        
        var totals = 0;
        for (var attributeName in globals.languages){
            totals += globals.languages[attributeName];
        }
        //the joys of ECMA5!
        var startList =     "<div class=\"demo-list-action mdl-list\">"
        var startListItem =     "<div class=\"mdl-list__item\"> <span class=\"mdl-list__item-primary-content\"> <span>" //${string1}
        var endListPrimary =       "</span></span>"
        var startSvg =          "<a class=\"mdl-list__item-secondary-action\" > <div class=\"pie\"> " //${string2}
        var endSvg =            "</div></a>"
        var endListItem =       "</div>"
        var endList = "<div>"
        for (var attributeName in globals.languages){
            var attributeTotal = globals.languages[attributeName];
            var attributePercent = (attributeTotal / totals) * 100;
            var displayString = attributeName + " - " + attributePercent.toFixed(2) + "%";
            startList = startList + startListItem + displayString + endListPrimary + startSvg + attributePercent + endSvg + endListItem;
        }
        startList = startList + endList;
        document.getElementById("languageplaceholder").innerHTML = startList;
        displayPieCharts();
    }
    //display a chart in SVG to show how much the code is visually in percents
    function displayPieCharts(){
        var elementsForPie = document.getElementsByClassName('pie');
        for (var index = 0; index < elementsForPie.length; index++){
            var p = parseFloat(elementsForPie[index].textContent); 
            console.log(p);
            var NS = "http://www.w3.org/2000/svg";
            var svg = document.createElementNS(NS, "svg");
            var circle = document.createElementNS(NS, "circle");
            var title = document.createElementNS(NS, "title");
            circle.setAttribute("r", 16);
            circle.setAttribute("cx", 16);
            circle.setAttribute("cy", 16);
            circle.setAttribute("stroke-dasharray", p + " 100");
            svg.setAttribute("viewBox", "0 0 32 32");
            title.textContent = elementsForPie[index].textContent;
            elementsForPie[index].textContent = '';
            svg.appendChild(title);
            svg.appendChild(circle);
            elementsForPie[index].appendChild(svg);
        }
    }

    //call out to first server and start the chain of events.
    getCall("https://api.github.com/users/justinkneff/repos", reposResponse);

})({}); //in strict mode you need to put a variable into the constructor so it's globally available, adding 'this' keyword would be window
