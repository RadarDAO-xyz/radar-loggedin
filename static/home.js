if (isLoggedIn()) {
    $('#profile').click(ev => {
        ev.preventDefault();
        document.location.pathname = 'profile-page';
    });
    getUser().then(user => {
        $('#profilename').text(user.username);
    });
    $('#profile').show();
    $('#logout').show();
    $('#w-tabs-0-data-w-tab-1').show();
} else {
    $('#profilename').text('Login');
    $('#profile').show();
    $('#logout').hide();
    $('#w-tabs-0-data-w-tab-1').hide();
}

async function fillChannelList() {
    const data = await fetch(`https://${API}/channels/`).then(r => r.json());

    $('#Channels').empty();
    $('#Channels').append($(`<option>ALL CHANNELS</option>`));
    data.forEach(channel => {
        $('#Channels').append($(`<option value="${channel.id}" >${channel.name}</option>`));
    });
}

let waiting = false;

$('#Search-channels').keypress(() => {
    if (waiting) return;
    waiting = true;
    setTimeout(async () => {
        const url = new URL(`https://${API}/discussions`);
        if ($('#Search-channels').val().length > 0) {
            url.searchParams.set('q', $('#Search-channels').val());
        }
        if (!isNaN($('#Channels').val())) {
            url.searchParams.set('channelId', $('#Channels').val());
        }
        const data = await fetch(url.toString()).then(r => r.json());
        console.log(data.map(x => x.name));
        waiting = false;
    }, 1000);
});

$('#Search-channels').keydown(ev => {
    const key = ev.key;
    if (key === 'Backspace' || key === 'Delete') {
        $('#Search-channels').trigger(jQuery.Event('keypress'));
    }
});

fillChannelList();
