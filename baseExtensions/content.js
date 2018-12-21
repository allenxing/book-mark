/* var button = document.getElementById("gc-pagecontent");
button.addEventListener("click", function() {
    console.log(1);
}, false); */
console.log('I am coming form content.js');
//when open page,send message to bg
chrome.runtime.sendMessage({action:'init'},function(response){
    console.log(response);
})