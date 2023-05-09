const API = 'https://api.radardao.xyz/quiz';

const getEmail = () => localStorage.getItem('email');
const setEmail = x => localStorage.setItem('email', x);

const getQuizStatus = () => localStorage.getItem('quiz-status');
const setQuizStatus = x => localStorage.setItem('quiz-status', x);

const isReady = () => getEmail() && getQuizStatus() != null;

function hideQuiz() {
    $('.quiz').hide();
    $('#see-results').hide();
    $('#quiz-counter').hide();
}

(async function () {
    $('#see-results').hide();
    if (!isReady()) {
        $('.trickster-pop-up-wrapper').show();
    } else {
        $('.trickster-pop-up-wrapper').hide();
        loadAnswers(await getRequest('/answers', { email: getEmail() }));
    }

    if (getQuizStatus() === 'false') {
        hideQuiz();
    }
})();

function getRequest(path, query) {
    const url = new URL(`${API}${path}`);
    for (let key in query) url.searchParams.set(key, query[key]);
    return fetch(url)
        .then(r => {
            if (r.ok) return r;
            else throw new Error('GET Fetch Request Failed');
        })
        .then(r => r.json())
        .catch(() => {});
}

function postRequest(path, body) {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    return fetch(`${API}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    })
        .then(r => {
            if (r.ok) return r;
            else throw new Error('POST Fetch Request Failed');
        })
        .then(r => r.json())
        .catch(() => {});
}

//#region Popup buttons
async function handlePopupSelection(quizActivated) {
    // Check check if email was put in
    const emailInput = $('#email').val();
    if (!emailInput) return;

    setEmail(emailInput);
    setQuizStatus(quizActivated ? 'true' : 'false');

    $('.trickster-pop-up-wrapper').hide(); // Hide popup
    !quizActivated && hideQuiz();

    // Post set status for this email
    await postRequest('/status', { email: getEmail(), quizStatus: quizActivated });
    loadAnswers(await getRequest('/answers', { email: getEmail() }));
}

$('#play-quiz').click(() => handlePopupSelection(true));
$('#noplay-quiz').click(() => handlePopupSelection(false));

//#endregion

/**
 *
 * @param {number} amount
 */
const updateQsAnswered = amount => {
    $('.quiz-questions-counter').children().first().text(`${amount}/10 Q's Answered`);
};

function resolveAnswerLetter(elem) {
    let answerClasses = ['a', 'b', 'c', 'd', 'e'];
    for (let i of answerClasses) {
        if (elem.hasClass(i)) return i;
    }
}

function resolveQuestionNumber(elem) {
    for (let i = 1; i <= 10; i++) {
        if (elem.hasClass(`_${i}`)) return i;
    }
}

let questionsAnswered = 0;
async function loadAnswers(answers) {
    answers.forEach(row => {
        const { question, answer } = row;
        const choiceWrapper = $(`._${question}`).children('.quiz-choice-wrapper').first();
        choiceWrapper.children().removeClass('selected');
        choiceWrapper.children(`.${answer}`).addClass('selected');
    });
    questionsAnswered = answers.length;
    updateQsAnswered(answers.length);

    if (questionsAnswered == 10) {
        $('#see-results').show();
        $('#quiz-counter').hide();
    }
}

function fetchArchetype() {
    return getRequest('/archetype', { email: getEmail() });
}

function loadArchetype(result) {
    if (questionsAnswered == 10) {
        $('#see-results').show();
        $('#quiz-counter').hide();
    }
    const url = new URL('https://twitter.com/intent/tweet');
    url.searchParams.set('url', 'https://www.play.radardao.xyz/');
    url.searchParams.set(
        'text',
        `I'm living a more play-full future with RADAR and I'm the ${result.archetype.name}\n\nRead the report to find your character and collect!`
    );
    $('#result-share-button').attr('href', url.toString());
    $('#result-collect-button').attr('href', result.archetype.url);
    $('.results-title').text(result.archetype.name);
    $('.results-description').text(result.archetype.description);
    $('.results-image').attr('src', result.archetype.image);
    $('.percentage.enchantress').text(`${result.resultPs.a}%`);
    $('.percentage.healer').text(`${result.resultPs.b}%`);
    $('.percentage.mediator').text(`${result.resultPs.c}%`);
    $('.percentage.teacher').text(`${result.resultPs.d}%`);
    $('.percentage.artist').text(`${result.resultPs.e}%`);
}

$('#see-results').click(async () => {
    if (questionsAnswered == 10) {
        $('.results-page').show();
        loadArchetype(await fetchArchetype());
    } else {
        $('.results-page').hide();
    }
});

$('.quiz-choice-wrapper')
    .children()
    .each(function () {
        const elem = $(this);
        elem.css('cursor', 'pointer');
        elem.click(async () => {
            elem.addClass('selected');
            updateQsAnswered(questionsAnswered + 1);
            const answers = await postRequest('/answers', {
                email: getEmail(),
                question: resolveQuestionNumber(elem.parent().parent()),
                answer: resolveAnswerLetter(elem)
            });
            loadAnswers(answers);
        });
    });
