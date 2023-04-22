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
    const data = await fetch(`${API}/channels/`).then(r => r.json());

    $('#Channels').empty();
    $('#Create-post-in-channel').empty();
    $('#Channels').append($('<option value="not">ALL CHANNELS</option>'));
    $('#Create-post-in-channel').append($('<option value="not">ALL CHANNELS</option>'));
    data.forEach(channel => {
        $('#Channels').append($(`<option value="${channel.name}" >#${channel.name}</option>`));
        $('#Create-post-in-channel').append($(`<option value="${channel.name}" >#${channel.name}</option>`));
    });
}
fillChannelList();

async function fetchDiscussions(q, channel) {
    const url = new URL(`${API}/discussions`);
    if ($('#Search-channels').val().length > 0) {
        url.searchParams.set('q', q);
    }
    if ($('#Channels').val() !== 'not') {
        url.searchParams.set('channelId', channel);
    }
    console.log(url.toString());
    const data = await fetch(url.toString()).then(r => r.json());
    console.log(data);
    return data;
}

let waiting = false;
let lastSearched = '';
function runIfSafe() {
    if (waiting) return;
    waiting = true;
    setTimeout(async () => {
        lastSearched = $('#Search-channels').val() + $('#Channels').val();
        await fetchDiscussions($('#Search-channels').val(), $('#Channels').val());
        waiting = false;
        if (lastSearched !== $('#Search-channels').val() + $('#Channels').val()) {
            runIfSafe();
        }
    }, 1000);
}
$('#Search-channels').keypress(() => runIfSafe());
$('#Search-channels').keydown(ev => {
    if (ev.key === 'Backspace' || ev.key === 'Delete') runIfSafe();
});
$('#Channels').change(() => runIfSafe());
