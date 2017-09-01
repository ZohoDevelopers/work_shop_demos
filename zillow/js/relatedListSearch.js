auth = { 
    zwsId : "X1-ZWz1fvdzns356z_8z2s9" 
}; 
prop = {}; 
$(document).ready(function() 
{
    ZOHO.embeddedApp.init() 
    .then(function() 
    {
        $("#loading").show(); 
        ZOHO.CRM.INTERACTION.getPageInfo() 
        .then(function(response) 
        { 

            
            var city = response.data["City"]; 
            var state = response.data["State"]; 
            
            var street1 = response.data["Street"].replace(/ /g, "+"); 
            var street2 = city + "," + state; 

            request = { 
                url: "http://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id=" + auth.zwsId + "&address=" + street1 + "&citystatezip=" + street2, 
            } 
            ZOHO.CRM.HTTP.get(request) 
            .then(function(data) { 
                console.log("*********Data in XML Format**********");
                console.log(data);
                var x2js = new X2JS(); 
                var jsonObj = x2js.xml_str2json(data); 

                console.log("*********Data in JSON Format**********");
                console.log(jsonObj);

                var homeDetails = jsonObj.searchresults.response.results.result; 
                
                    if (homeDetails.zpid) { 
                        prop.id = homeDetails.zpid;
                        console.log("********* ZPID from  response **********");
                        console.log(prop.id);
                    } 

            }).then(function(){ 
                request = { 
                    url: "http://www.zillow.com/webservice/GetUpdatedPropertyDetails.htm?zws-id=" + auth.zwsId + "&zpid=" + prop.id, 
                } 
                ZOHO.CRM.HTTP.get(request) 
                .then(function(data) { 
                    var x2js = new X2JS(); 
                    var json = x2js.xml_str2json(data); 
                    if (json.updatedPropertyDetails.message.code != 0) { 
                        return error(json.updatedPropertyDetails.message.text); 
                    } 
                    prop.details = json.updatedPropertyDetails.response; 
                    prop.details.info = []; 
                    if (prop.details.editedFacts) { 
                        if (prop.details.editedFacts.lotSizeSqFt) { 
                            prop.details.info.push({ 
                                label: "Lot : ", 
                                value: prop.details.editedFacts.lotSizeSqFt 
                            }) 
                        } 
                        if (prop.details.editedFacts.useCode) { 
                            prop.details.info.push({ 
                                label: "Type : ", 
                                value: prop.details.editedFacts.useCode 
                            }) 
                        } 
                        if (prop.details.editedFacts.yearBuilt) { 
                            prop.details.info.push({ 
                                label: "Year Built : ", 
                                value: prop.details.editedFacts.yearBuilt 
                            }) 
                        } 
                        if (prop.details.editedFacts.heatingSources) { 
                            prop.details.info.push({ 
                                label: "Heating Source : ", 
                                value: prop.details.editedFacts.heatingSources 
                            }) 
                            prop.details.htSrc = "Heating Source :" 
                        } 
                        if (prop.details.editedFacts.rooms) { 
                            rooms = prop.details.editedFacts.rooms.match(/[^,\s][\w- ]*/g); 
                            prop.details.rooms = rooms; 
                        } 

                    } 


                    if (prop.details.images) { 
                        if (!(prop.details.images.image.url.constructor === Array)) { 
                            var img = prop.details.images.image.url; 
                            prop.details.images.image.url = []; 
                            prop.details.images.image.url.push(img); 
                        } 
                    } 
                    renderTemplate("propertyScript", "propertyContentDiv", prop.details)
                    $("#loading").hide(); 
                }) 
            }) 

        }) 
    }) 
}); 
function error(msg) { 
    document.getElementById("errorDiv").innerHTML = msg; 
} 
function renderTemplate(scriptId, divId, data) { 
    var tempSrc = $('#' + scriptId).html(); 
    var tempTemplate = Handlebars.compile(tempSrc); 
    $("#" + divId).html(tempTemplate(data)); 
    $('.flexslider').flexslider({ 
        animation: "slide", 
        animationLoop: false, 
        itemWidth: 430, 
        itemMargin: 5, 
        pausePlay: true, 
        start: function(slider) { 
            $('body').removeClass('loading'); 
        } 
    }); 
} 

