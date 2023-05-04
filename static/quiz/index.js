const API = 'https://api.radardao.xyz/quiz';

const getEmail = () => localStorage.getItem('email');
const setEmail = x => localStorage.setItem('email', x);

const getQuizStatus = () => localStorage.get('quiz-status');
const setQuizStatus = x => localStorage.set('quiz-status', x);

const isReady = () => getEmail() && getQuizStatus() != null;

(async function () {
    if (!isReady()) {
        $('.trickster-pop-up-wrapper').show();
    } else {
        $('.trickster-pop-up-wrapper').hide();
    }

    loadAnswers(await getRequest('/answers', { email: getEmail() }));
})();

function getRequest(path, query) {
    const url = new URL(`${API}${path}`);
    for (let key in query) url.searchParams.set(key, query[key]);
    return fetch(url)
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
        .then(r => r.json())
        .catch(() => {});
}

//#region Popup buttons
async function handlePopupSelection(quizActivated) {
    // Check check if email was put in
    const emailInput = $('#email').val(); // TODO: Change input id
    if (!emailInput) return;

    setEmail(emailInput);
    setQuizStatus(quizActivated);

    $('.trickster-pop-up-wrapper').hide(); // Hide popup
    !quizActivated && $('.quiz').hide(); // Hide quiz

    // Post set status for this email
    await postRequest('/status', { email: getEmail(), quizStatus: quizActivated });
}

$('#play-quiz').click(() => handlePopupSelection(true)); // TODO: Change input id
$('#noplay-quiz').click(() => handlePopupSelection(false)); // TODO: Change input id

/**
 *
 * @param {number} amount
 */
const updateQsAnswered = amount => {
    $('.quiz-questions-counter:first-child').text(`${amount}/10 Q's Answered`);
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

async function loadAnswers(answers) {
    answers.forEach(row => {
        const { question, answer } = row;
        const choiceWrapper = $(`_${question}`).children('.quiz-choice-wrapper').first();
        choiceWrapper.children().removeClass('selected');
        choiceWrapper.children(answer).addClass('selected');
    });
    updateQsAnswered(answers.length);

    if (answers.length > 10) {
        loadArchetype(await fetchArchetype());
    }
}

function fetchArchetype() {
    return getRequest('/archetype', { email: getEmail() });
}

function loadArchetype() {}

$('.quiz-choice-wrapper')
    .children()
    .each(function () {
        const elem = $(this);
        elem.click(async () => {
            const answers = await postRequest('/answers', {
                email: getEmail(),
                question: resolveQuestionNumber(elem.parent().parent()),
                answer: resolveAnswerLetter(elem)
            });
            loadAnswers(answers);
        });
    });
