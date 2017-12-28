/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {

    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(url);
  });

}

function getServerId(url, callback, errorCallback) {

  var serverUrl = url + 'rest/settings/all-server-status'

  var x = new XMLHttpRequest();
  x.open('GET', serverUrl);
  x.responseType = 'json';
  x.onload = function() {
    
    // Parse and process
    var response = x.response;
    if (!response) {
      console.log("Some kind of error");
      return;
    }

    var serverid = x.response[0].id

    callback(serverid);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function getServerData(url , serverId , callback, errorCallback) {
  var serverUrl = url + 'rest/feature/statistics/all/en_US?serverId=' + serverId

  var x = new XMLHttpRequest();
  x.open('GET', serverUrl);
  x.responseType = 'json';
  x.onload = function() {
    
    // Parse and process the response 
    var response = x.response;
    if (!response) {
      console.log("Some kind of error");
      return;
    }

    var serverdata = x.response

    callback(serverdata);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';    

    //CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var headers = "Element, Name , Type, Stability Group, Enabled";
        CSV += headers + '\r\n';
    }
    
    //1st loop is to extract each row
      for (var i = 0; i < arrData.length; i++) {
          var row = "";
          rowElement = '"' + arrData[i]['elementInstanceType'] + '",';
          //2nd loop will extract each column and convert it in string comma-seprated
          for (var index = 0; index < arrData[i]['featureStatisticsDataList'].length; index++) {
              //row += '"' + arrData[i][index] + '",';
              row += rowElement
              row += '"' + arrData[i]['featureStatisticsDataList'][index]['featureName'] + '",';
              row += '"' + arrData[i]['featureStatisticsDataList'][index]['featureType'] + '",';
              row += '"' + arrData[i]['featureStatisticsDataList'][index]['stabilityGroup'] + '",';
              row += '"' + arrData[i]['featureStatisticsDataList'][index]['enabled'] + '",';
              row += '\r\n';
              //add a line break after each row
              //CSV += row + '\r\n';
          }
          row.slice(0, row.length - 1);
          
          //CSV += row + '\r\n';
          CSV += row;
      }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "Server-Data"; 
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
        
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    var html = '<script>var link = document.createElement("a"); link.href = uri; link.download = fileName + ".csv"; document.body.appendChild(link);link.click();</script>'

    renderHTML(html)
    renderStatus("All set, check your downloads")

}

function renderHTML(statusText) {
  document.getElementById('status').innerhtml = statusText;
}

function renderStatus(statusText) {
  //document.getElementById('status').textContent = statusText;
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {

  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    renderStatus('Getting server data for ' + url);

    var split_url = url.split('#')

      
    getServerId(split_url[0] , function(serverId) {
      
      console.log(serverId)
      getServerData(split_url[0] , serverId, function(serverData) {
        console.log(serverData)

        JSONToCSVConvertor(serverData , split_url[0], true)
      
      });
    })


    }, function(errorMessage) {
       console.log("It's broken")
      renderStatus('Nothing for you. ' + errorMessage);

  });
});
