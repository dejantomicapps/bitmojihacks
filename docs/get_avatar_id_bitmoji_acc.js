function SUBMIT() {

var cors_api_url = 'https://cors-anywhere.herokuapp.com/';

function doCORSRequest(options, callback) {
  var x = new XMLHttpRequest();
  x.open(options.method, cors_api_url + options.url);
  x.onload = x.onerror = function() {
    callback(x, options);
  };
  if (/^POST/i.test(options.method)) {
    x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  }
  if ((typeof options.token !== "undefined") && options.token) {
    x.setRequestHeader('bitmoji-token', options.token);
  }
  x.send(options.data);
}

var username = document.querySelector("#email").value;
var password = document.querySelector("#password").value;
var acccess_token = '';

document.querySelector("#status").innerText = "Logging in...";
document.querySelector("#response").innerText = "";

doCORSRequest({
  method: 'POST',
  url: 'https://api.bitmoji.com/user/login',
  data: 'client_id=imoji&username=' + username + '&password=' + password + '&grant_type=password&client_secret=secret'
}, function cb(result, opt) {
  if (result.status != 200) {
    document.querySelector("#status").innerText = "Login Failed! (" + result.status + " " + result.statusText + ")";
    document.querySelector("#response").textContent = (result.responseText || "");
    return;
	}
  var json = {};
  try {
    json = JSON.parse(result.responseText);
  } catch (E) {
    document.querySelector("#status").innerText = "Login Response invalid!";
    document.querySelector("#response").textContent = (result.responseText || "");
    return;
  }
  if ((typeof json.access_token === "undefined") || !(json.access_token)) {
    document.querySelector("#status").innerText = "Login Error (no access token found)";
    document.querySelector("#response").textContent = result.responseText;
    return;
  }
  access_token = json.access_token;
  console.log("Bitmoji Access Token: " + access_token);

  document.querySelector("#status").innerText = "Getting information...";

  doCORSRequest({
    method: 'GET',
    url: 'https://api.bitmoji.com/user/avatar',
    token: access_token
  }, function(result) {
    if (result.status != 200) {
      document.querySelector("#status").innerText = "Get Avatar Failed! (" + result.status + " " + result.statusText + ")";
      document.querySelector("#response").textContent = (result.responseText || "");
      return;
  	}
    var json = {};
    try {
      json = JSON.parse(result.responseText);
    } catch (E) {
      document.querySelector("#status").innerText = "Get Avatar Response invalid!";
      document.querySelector("#response").textContent = (result.responseText || "");
      return;
    }
    document.querySelector("#status").innerText = "";
/*
avatar_id: 99190715235
avatar_version: 1
avatar_version_uuid: "0f748283-7f6c-41bd-93b4-a9c72936b9ef"
bsauth: true
gender: 1
id: "99190715235_1-s5"
id_hash: "PJnPDXWe"
style: 5
*/
    var output = "";
    if ((typeof json.avatar_id !== "undefined") && json.avatar_id) {
      output += "Avatar ID: " + json.avatar_id + "  ";
    }
    if ((typeof json.id !== "undefined") && json.id) {
      output += "Full ID: " + json.id + "  ";
    }
    if ((typeof json.avatar_version_uuid !== "undefined") && json.avatar_version_uuid) {
      output += "Avatar UUID: " + json.avatar_version_uuid;
    }
    document.querySelector("#status").textContent = output;
    document.querySelector("#response").textContent = JSON.stringify(json, null, 2); //result.responseText

    doCORSRequest({
      method: 'POST',
      url: 'https://api.bitmoji.com/user/logout',
      token: access_token
    }, function(result) { console.log("Logout:", result); });
  });
});

}
