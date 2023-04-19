const API = 'api.radardao.xyz';
const DomainREGEX = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/i;

if (getAccessToken() && getExpiresIn() > Date.now()) {
    const profileName = document.getElementById('profilename');
    getUser().then(user => {
        profileName.textContent = user.username;
    });
} else {
    document.location.pathname = 'login-page';
}

function createTop5Div(name, amount) {
    const div = document.getElementsByClassName('small-copy caps showing-tags')[0].cloneNode();
    div.textContent = `${name} (${amount})`;
}

function removeFirstTop5() {
    document.getElementsByClassName('small-copy caps showing-tags')[0].remove();
}

function createLinkResource({ tldr, source, curator, smallCopy, url, discordURL, tags }) {
    const block = document.createElement('div');
    block.className = 'resource-block';
    // #region Icon Div
    const iconDiv = document.createElement('div');
    iconDiv.className = 'resource-icon-div';
    const urlIcon = document.createElement('div');
    urlIcon.className = 'url-icon';
    urlIcon.style.cursor = 'pointer';
    urlIcon.addEventListener('click', () => {
        document.location = url;
    });
    iconDiv.appendChild(urlIcon);
    const discordIcon = document.createElement('div');
    discordIcon.className = 'discord-icon';
    discordIcon.style.cursor = 'pointer';
    discordIcon.addEventListener('click', () => {
        document.location = discordURL;
    });
    iconDiv.appendChild(discordIcon);
    block.appendChild(iconDiv);
    // #endregion
    // #region tldr
    const tldrDiv = document.createElement('p');
    tldrDiv.className = 'resource-tldr';
    tldrDiv.textContent = tldr;
    block.appendChild(tldrDiv);
    // #endregion
    // #region source
    const sourceDiv = document.createElement('div');
    sourceDiv.className = 'resource-source';
    sourceDiv.textContent = source;
    block.appendChild(sourceDiv);
    // #endregion
    // #region curator
    const curatorDiv = document.createElement('div');
    curatorDiv.className = 'resource-curator';
    curatorDiv.textContent = `@${curator}`;
    block.appendChild(curatorDiv);
    // #endregion
    // #region expander
    const expanderDiv = document.getElementsByClassName('resource-expand')[0].cloneNode(true);
    const expandedContent = expanderDiv.lastChild;
    const smallCopyElm = expandedContent.firstChild.firstChild;
    smallCopyElm.textContent = smallCopy;
    const tagContainer = document.createElement('div');
    tagContainer.className = 'tag-container-js';
    tags.forEach(tag => {
        const tagButton = document.createElement('div');
        tagButton.className = 'tag-div-button w-button';
        tagButton.style.cursor = 'pointer';
        tagButton.textContent = tag;
    });
    expandedContent.appendChild(tagContainer);

    block.appendChild(expanderDiv);
    // #endregion
    document.getElementById('resource-stack').appendChild(block);
}

function clearLinkResources() {
    const nodes = [...document.getElementById('resource-stack').childNodes.values()];
    nodes.filter(n => n.style.display !== 'none').forEach(node => node.remove());
}

async function fetchProfileData() {
    const user = await getUser();
    document.getElementById('profilename').textContent = user.username;
    const data = await fetch(`https://${API}/user/${user.id}`).then(r => r.json());

    document.getElementById('signal-counter').textContent = data.total_shared;

    for (let i = 0; i < data.top_five.length; i++) {
        createTop5Div(data.top_five[i].name, data.top_five[i].count);
    }
    removeFirstTop5();

    data.signals.forEach(x => {
        createLinkResource({
            tldr: x.data.title,
            source: DomainREGEX.exec(x.data.url)?.values()[1],
            curator: x.message.data.author.username,
            smallCopy: x.data.description,
            url: x.data.url,
            discordURL: `https://discord.com/channels/913873017287884830/${x.channel_id}/${x.message_id}`,
            tags: x.tags
        });
    });
}

// Disable form submission
document.getElementById('disabled-form').addEventListener('submit', async ev => {
    console.log('a');
    ev.preventDefault();

    clearLinkResources();

    const user = await getUser();

    const data = await fetch(
        `https://${API}/user/${user.id}?q=${encodeURIComponent(
            document.getElementById('signal-search').value
        )}`
    ).then(r => r.json());

    if (data.signals.length > 0) {
        data.signals.forEach(x => {
            createLinkResource({
                tldr: x.data.title,
                source: DomainREGEX.exec(x.data.url)?.values()[1],
                curator: x.message.data.author.username,
                smallCopy: x.data.description,
                url: x.data.url,
                discordURL: `https://discord.com/channels/913873017287884830/${x.channel_id}/${x.message_id}`,
                tags: x.tags
            });
        });
    } else {
        for (let i = 0; i < 6; i++) createLinkResource({
            tldr: "No signals Found!",
            source: '',
            curator: "Curator",
            smallCopy: "The search parameters you have provided do not point to any signals!",
            url: '',
            discordURL: ``,
            tags: []
        });
    }
});

fetchProfileData();
