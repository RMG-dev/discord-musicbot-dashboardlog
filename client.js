var socket = io.connect('http://localhost:8080');

socket.on('logplay', (pseudoprint, msg, gid) => {
    var msgtext = document.createElement("H2");
    msgtext.innerText = "L'utilisateur " + pseudoprint + " a joué la musique : " + msg + " | sur le serveur : " + gid;
    document.getElementById("msgdiv").appendChild(msgtext);
});

socket.on('membercount', (membercount) => {
    document.getElementById("membercountdiv").innerHTML = "Nombre de membres : " + membercount;
});
