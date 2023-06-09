const API = 'https://api.radardao.xyz';

let submitted = false;
if (waitingForName) {
    $('#email-form').submit(async e => {
        e.preventDefault();
        if (submitted) return;

        if (!$('#email-textbox').val()) {
            return $('#submit-button').val('Email is required');
        }

        submitted = true;
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        const res = await fetch(`${API}/joinWaitlist`, {
            headers,
            method: 'POST',
            body: JSON.stringify({
                email: $('#email-textbox').val(),
                waitingFor: waitingForName
            })
        })
            .then(r => r.json())
            .catch(() => {});
        $('#email-form').hide();
        if (res?.waitlisted) {
            $('.w-form-done').show();
        } else {
            $('.w-form-fail').show();
        }
        console.log(res);
    });
}
