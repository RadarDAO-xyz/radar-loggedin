// const API = 'https://api.radardao.xyz';
const API = 'http://localhost:3000';

// var script = document.createElement('script');
// script.src = 'https://code.jquery.com/jquery-3.6.4.min.js';
// script.integrity = 'sha256-pvPw+upLPUjgMXY0G+8O0xUf+/Im1MZjXxxgOcBQBXU=';
// script.crossOrigin = 'anonymous';
// document.getElementsByTagName('head')[0].appendChild(script);

let submitted = false;
$('#email-form').submit(async e => {
    e.preventDefault();
    if (submitted) return;
    submitted = true;
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    const res = await fetch(`${API}/joinWaitlist`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            email: $('#email-textbox').val(),
            waitingFor: $('#waitingfor').text()
        })
    }).then(r => r.json());
    console.log(res);
});
