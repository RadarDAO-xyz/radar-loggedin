const DomainREGEX = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/i;

if (isLoggedIn()) {
    getUser().then(user => {
        $('#profilename').text(user.username);
        $('.profile-image')
            .first()
            .css(
                'background-image',
                `url("https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=1024")`
            )
            .css('background-size', 'cover')
            .css('background-repeat', 'no-repeat');
    });
    $('#logout').show();
} else {
    document.location.pathname = 'login-page';
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function createTop5Div(name, amount) {
    const div = document.getElementsByClassName('small-copy caps showing-tags')[0].cloneNode();
    div.setAttribute('id', '');
    div.textContent = `${name} (${amount})`;
    insertAfter(document.getElementsByClassName('most-active-channels-text')[0], div);
}

function removeOriginalTop5() {
    document.getElementById('originalTag').remove();
}

function createLinkResource(link) {
    const resourceBlock = $('.resource-block').first().clone();

    resourceBlock
        .find('.resource-tldr')
        .text('')
        .html(
            link.data.title ||
                truncate(link.data.description, 100, true) ||
                truncate(link.data.url.replace(/^https?:\/\//, '').replace(/^www\./, ''), 44)
        );

    resourceBlock
        .find('.resource-source')
        .text('')
        .text(
            link.data.provider?.name ||
                link.data.url
                    .replace(/^https?:\/\//, '')
                    .replace(/^www\./, '')
                    .split('/')[0]
        )
        .click(function () {
            window.open(link.data.url);
        })
        .css('cursor', 'pointer');
    resourceBlock
        .find('.resource-curator')
        .text('')
        .text(`@${link.message.data.author.username}`)
        .css('cursor', 'default')
        .css('margin-bottom', '10px');
    const posted_at = new Date(link.posted_at).toLocaleString();
    resourceBlock
        .find('.resource-curator')
        .clone()
        .text(`${posted_at}`)
        .insertAfter(resourceBlock.find('.resource-curator'));
    resourceBlock.find('.resource-expanded-content').text('');
    if (link.data.description) {
        resourceBlock
            .find('.resource-expanded-content')
            .html(`<p class="small-copy">${link.data.description}</p>`)
            .click(function () {
                window.open(link.data.url);
            })
            .css('cursor', 'pointer');
    }

    resourceBlock
        .find('.resource-icon-div .url-icon')
        .click(function () {
            window.open(link.data.url);
        })
        .css('cursor', 'pointer');
    resourceBlock
        .find('.resource-icon-div .discord-icon')
        .click(function () {
            window.open(
                `https://discord.com/channels/${GUILD_ID}/${link.message.data.channel_id}/${link.message.data.id}`
            );
        })
        .css('cursor', 'pointer');

    resourceBlock.find('.content-expander').css({ height: 'auto', opacity: 1 }).hide();
    resourceBlock
        .find('.open-arrow')
        .css('cursor', 'pointer')
        .click(function () {
            if (!resourceBlock.find('.content-expander').is(':visible')) {
                resourceBlock.find('.content-expander').slideDown();
                resourceBlock.find('.open-arrow').animate(
                    { rotation: 180 },
                    {
                        duration: 500,
                        step: function (now) {
                            resourceBlock
                                .find('.open-arrow')
                                .css({ transform: 'rotate(' + now + 'deg)' });
                        }
                    }
                );
            } else {
                resourceBlock.find('.content-expander').slideUp();
                resourceBlock.find('.open-arrow').animate(
                    { rotation: 0 },
                    {
                        duration: 500,
                        step: function (now) {
                            resourceBlock
                                .find('.open-arrow')
                                .css({ transform: 'rotate(' + now + 'deg)' });
                        }
                    }
                );
            }
        });
    resourceBlock
        .find('.resource-title')
        .click(function () {
            resourceBlock.find('.resource-drop').click();
        })
        .css('cursor', 'pointer');

    $('<div class="tag-container-js"></div>').insertAfter(
        resourceBlock.find('.resource-expanded-content')
    );
    $(link.tagships).each(function (i, tagship) {
        const tag = $('<div class="tag-div-button w-button"></div>');
        tag.text(tagship.tag.name);
        if (urlParams.getAll('tags[]').includes(tagship.tag.name)) {
            tag.click(function () {
                window.location.href = `/?${$.param({
                    channel: urlParams.get('channel'),
                    tags: $.grep(urlParams.getAll('tags[]'), function (value) {
                        return value != tagship.tag.name;
                    }),
                    q: urlParams.get('q')
                })}`;
            }).css('cursor', 'pointer');
            tag.addClass('js-selected-tag');
        } else {
            tag.click(function () {
                window.location.href = `/?${$.param({
                    channel: urlParams.get('channel'),
                    tags: urlParams.getAll('tags[]').concat([tagship.tag.name]),
                    q: urlParams.get('q')
                })}`;
            }).css('cursor', 'pointer');
        }
        tag.appendTo(resourceBlock.find('.tag-container-js')).show();
    });

    resourceBlock.appendTo($('.resource-stack').first()).show();
}

function createLinkResourceB({
    tldr,
    source = 'Source',
    curator = 'Curator',
    smallCopy = '',
    url = '',
    discordURL = '',
    tags = []
}) {
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

function noneFoundFill() {
    for (let i = 0; i < 6; i++)
        createLinkResourceB({
            tldr: 'No signals Found!',
            source: '',
            curator: 'Curator',
            smallCopy: 'The search parameters you have provided do not point to any signals!',
            url: '',
            discordURL: ``,
            tags: []
        });
}

function searchingFill() {
    for (let i = 0; i < 6; i++)
        createLinkResourceB({
            tldr: 'Searching for your signals...',
            source: '',
            curator: 'Curator',
            smallCopy: "We're lookin!",
            url: '',
            discordURL: ``,
            tags: []
        });
}

function discussionFill(discussions) {
    $('.discussions-title').first().text(`SEE DISCUSSIONS (${discussions.length})`);

    $('.discussion-thread-block').each((i, block) => $(block).hide());
    if (discussions.length > 0) {
        discussions.forEach(discussion => {
            const block = $('.discussion-thread-block').first().clone();

            block
                .find('.discussion-title')
                .first()
                .text(discussion.thread_name)
                .css('cursor', 'pointer')
                .click(() => {
                    window.open(discussion.link);
                });
            block.find('.discussion-channel').first().text(discussion.channel_name);
            block.appendTo($('.discussion-thread-wrapper').first()).show();
        });
    } else {
        const block = $('.discussion-thread-block').first().clone();

        block.find('.discussion-title').first().text('No discussions found!');
        block.find('.discussion-channel').first().text('');
        block.appendTo($('.discussion-thread-wrapper').first()).show();
    }
}

function clearLinkResources() {
    const nodes = [...document.getElementById('resource-stack').childNodes.values()];
    nodes.filter(n => n.style.display !== 'none').forEach(node => node.remove());
}

async function fetchProfileData() {
    searchingFill();
    const user = await getUser();
    document.getElementById('profilename').textContent = user.username;
    const data = await fetch(`${API}/user/${user.id}`).then(r => r.json());

    document.getElementById('signal-counter').textContent = data.total_shared;

    for (let i = data.top_five?.length - 1 || 0; i >= 0; i--) {
        createTop5Div(data.top_five[i].name, data.top_five[i].count);
    }
    removeOriginalTop5();

    discussionFill(data.discussions || []);

    clearLinkResources();
    if (data.signals.length > 0) {
        data.signals.forEach(x => {
            createLinkResource(x);
        });
    } else {
        noneFoundFill();
    }
}

// Disable form submission
document.getElementById('disabled-form').addEventListener('submit', async ev => {
    console.log('a');
    ev.preventDefault();

    clearLinkResources();
    searchingFill();

    const user = await getUser();

    const data = await fetch(
        `${API}/user/${user.id}?q=${encodeURIComponent(
            document.getElementById('signal-search').value
        )}`
    ).then(r => r.json());

    clearLinkResources();

    if (data.signals.length > 0) {
        data.signals.forEach(x => {
            createLinkResource(x);
        });
    } else {
        noneFoundFill();
    }
});

fetchProfileData();
