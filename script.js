const container = document.querySelector('.container')
const questionBox = document.querySelector('.question')
const choicesBox = document.querySelector('.choices')
// Correction 1: Utiliser les classes exactes du HTML (.btnNext et .btnStart)
const nextBtn = document.querySelector('.btnNext') 
const scoreCard = document.querySelector('.scoreTot') // Utilisation de .scoreTot de l'HTML
const alertDiv = document.querySelector('.alert')
const startBtn = document.querySelector('.btnStart') // Correction 1: Utiliser la classe exacte .btnStart
const timer = document.querySelector('.timer')

let currentQuestionIndex = 0;
let score = 0;
let quizOver = false;
let timeLeft = 15;
let timeID = null


startBtn.addEventListener('click', ()=>{
    startBtn.style.display = 'none';
    container.style.display = 'block'
    startQuiz()
})

const startQuiz = ()=>{
    timeLeft = 15;
    timer.style.display = 'flex'
    showQuestion()
}

const showQuestion = () =>{
    const questionDetails = quiz[currentQuestionIndex]
    questionBox.textContent = questionDetails.question

    choicesBox.textContent = ''
    
    for(let i = 0; i<questionDetails.choices.length; i++){
        const currentChoice = questionDetails.choices[i]
        const choiceDiv = document.createElement('div')
        choiceDiv.textContent = currentChoice
        choiceDiv.classList.add('choice')
        choicesBox.appendChild(choiceDiv)
        
        choiceDiv.addEventListener('click', ()=>{
            // Correction 2: Gérer la sélection unique (désélectionner les autres)
            const allChoices = document.querySelectorAll('.choice');
            allChoices.forEach(c => c.classList.remove('selected'));
            
            choiceDiv.classList.add('selected');
        })
    }

    // Correction 3: Démarrer le minuteur UNIQUEMENT après avoir affiché la question
    if(currentQuestionIndex < quiz.length){
        startTimer()
    }
}

function startTimer(){
    clearInterval(timeID)
    timer.textContent = timeLeft
    const countDown = ()=>{
        timeLeft--
        timer.textContent = timeLeft
        if(timeLeft === 0){
            clearInterval(timeID); // Arrêter l'intervalle avant la confirmation
            const confirmUser = confirm('Time is up! Would you like to continue?')
            if(confirmUser){
                // Si l'utilisateur confirme, passer à la question suivante ou recommencer
                // Ici, on va simplement passer à la question suivante pour maintenir le flux
                displayAlert('Time is up! No point awarded for this question.')
                currentQuestionIndex++;
                if (currentQuestionIndex < quiz.length) {
                    timeLeft = 15;
                    showQuestion();
                } else {
                    ShowScore();
                }

            }
            else{
                // Si l'utilisateur annule, revenir à l'écran de démarrage
                container.style.display = 'none'
                startBtn.style.display = 'block'
                timer.style.display = 'none'
            }
        }
    }
    timeID = setInterval(countDown, 1000)
}

nextBtn.addEventListener('click', ()=>{
    const selectedChoice = document.querySelector('.choice.selected')
    
    // Si le quiz est terminé et que l'utilisateur clique sur 'Play Again'
    if(quizOver){
        nextBtn.textContent = 'Next'
        scoreCard.textContent = '' // Correction 4: Utiliser scoreCard
        currentQuestionIndex = 0
        quizOver = false
        score = 0
        startQuiz()
        return;
    }
    
    // Correction 5: Vérifier si un choix a été sélectionné avant d'appeler checkAnswer
    if(!selectedChoice){
        displayAlert('Please select your choice before continuing.')
        return;
    }

    // Si un choix est sélectionné, vérifier la réponse
    checkAnswer()
})

const checkAnswer = ()=>{
    const choiceSelected = document.querySelector('.choice.selected')
    const selectedText = choiceSelected.textContent;
    const currentAnswer = quiz[currentQuestionIndex].answer;
    let isCorrect = false;

    // Correction 4: Gestion des réponses multiples (Array)
    if(Array.isArray(currentAnswer)){
        isCorrect = currentAnswer.includes(selectedText);
    } else {
        isCorrect = selectedText === currentAnswer;
    }
    
    // Mise à jour du score et de l'alerte
    if(isCorrect){
        score++
        displayAlert('Correct answer!!')
    } else {
        const correctAnswerText = Array.isArray(currentAnswer) ? currentAnswer.join(' or ') : currentAnswer;
        displayAlert('Wrong answer! ' + correctAnswerText + ' is the right answer.')
    }
    
    // Passer à la question suivante
    clearInterval(timeID); // Arrêter le minuteur pour passer à la question suivante
    currentQuestionIndex++
    if(currentQuestionIndex < quiz.length){
        showQuestion()
    }
    else{
        ShowScore()
    }
}

const ShowScore =()=>{
    questionBox.textContent = ''
    choicesBox.textContent = ''
    scoreCard.textContent = 'You scored '+ score + ' out of '+ quiz.length + ' !'
    displayAlert('You have completed this quiz!')
    nextBtn.textContent = 'Play Again'
    quizOver = true
    timer.style.display = 'none'
}

const displayAlert = (msg)=>{
    alertDiv.style.display='block'
    alertDiv.textContent = msg
    setTimeout(()=>{
        alertDiv.style.display = 'none'
    }, 2000)
}