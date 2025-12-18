//TO DO:
//fix next button on stage 1
// implement personality functions
//implement chatbot functions

let scriptData = [];
let scriptByIndex = {};
let scriptByTrigger = {};
let UIData = {};
let userDataSelection = null;
let userPersonality = {
  // default
  randomness: 50,
  friendliness: 50,
  wordiness: 50,
};

const customRenderers = {
  // "stage-1": nextButtonForDataSelection,
  "training-step-1": renderTrainingStep1,
  "finetuning-step-2": renderFineTuningStep2,
  "finetuning-step-4": renderFineTuningStep4,
  "stage-3A-chatbot": renderStage3Chatbot,
};

let currentProgress = 0;
const PROGRESS_MILESTONES = {
  "stage-1": 0,
  "choice-data": 10,
  "training-step-1": 30,
  "finetuning-step-1": 60,
  "finetuning-step-3": 90,
  //add and edit as we go
};


const browserWindow = document.getElementsByClassName("browser-window")[0];

const STAGE_INFO = {
  "stage-1": { name: "Training", color: "#c9fdc4ff"},
  "finetuning-loader": { name: "Post-training", color: "#d1d7faff" },
  "stage-3A-chatbot": { name: "Deployment", color: "#fedaa0ff" },
};

async function loadScript() {
  await loadDataContent();
  try {
    const response = await fetch("public/json/script.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const jsonData = await response.json();
    //entire script raw json
    scriptData = jsonData.script;
    UIData = jsonData.ui;
    // populateUI(UIData);

    //sort into index and trigger steps
    for (let s of scriptData) {
      if (s.index != null) {
        scriptByIndex[parseInt(s.index)] = s;
      }
      if (s.trigger != null) {
        scriptByTrigger[s.trigger] = s;
      }
    }

    console.log("1.", scriptByIndex, "\n2.", scriptByTrigger); //all good

    document.querySelector(".browser-window").style.visibility = "visible";
    document.querySelector(".browser-window").style.display = "flex";

    const mainContainer = document.getElementById("main-container");
    mainContainer.style.visibility = "visible";
    mainContainer.style.display = "flex";

  document.body.classList.add("experience-started");

    renderStep(scriptByIndex[2]);
  } catch (error) {
    console.error("Failed to load script:", error);
  }
}


function updateProgressBar(trigger) {
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");

  if (PROGRESS_MILESTONES.hasOwnProperty(trigger)) {
    currentProgress = PROGRESS_MILESTONES[trigger];
    progressFill.style.width = `${currentProgress}%`;
    progressText.textContent = `${currentProgress}%`;
  }
}

function showProgressBar() {
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.display = "flex";
}

function hideProgressBar() {
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.display = "none";
}

function updateStageTag(trigger) {
  const stageTag = document.getElementById("stage-tag");

  if (STAGE_INFO.hasOwnProperty(trigger)) {
    const stage = STAGE_INFO[trigger];
    stageTag.textContent = stage.name;
    stageTag.style.backgroundColor = stage.color;
  }
}

function showStageTag() {
  const stageTag = document.getElementById("stage-tag");
  stageTag.style.display = "flex";
}
//display current step

function renderStep(step) {
  const mainContainer = document.getElementById("main-container");
  let genericContainer = document.getElementById("generic-container");
  currentContainer = genericContainer; 



  if (step.trigger && PROGRESS_MILESTONES.hasOwnProperty(step.trigger)) {
    showProgressBar();
    updateProgressBar(step.trigger);
  }

  if (step.trigger && STAGE_INFO.hasOwnProperty(step.trigger)) {
    showStageTag();
    updateStageTag(step.trigger);
  }

  currentContainer.innerHTML = "";
  currentContainer.className = "";
  currentContainer.classList.add("content-zone");

  //additional classes
  if (step.additionalClasses) {
    step.additionalClasses.forEach((c) => {
      currentContainer.classList.add(c);
    });
  }

  if (step.title) {
    const h2 = document.createElement("h2");
    h2.innerHTML = step.title;
    currentContainer.appendChild(h2);
  }

  //all content renderers are in a look up table. This solves the issue of being limited in layout.
  //In JSON, we can define an order and it puts things together accordingly. As opposed to having to do text > buttons all the time, for eg

  //if it is a timed step, it's handled here, and it reads from a "timer" key in the corresponding step. duration here is in ms.
  if (step.timer) {
    setTimeout(() => {
      handleTrigger(step.timer.trigger);
      console.log("hi");
    }, step.timer.duration);
  }


 const contentRenderers = {
    body: () => {
      if (step.body) {
        step.body.forEach((p) => {
          const para = document.createElement("p");
          if (p.id) para.id = p.id;
          //adding extra classes for styling, this is for classes that are specific to the element, such as the paragraph,
          // they exist in an array in the element key-value pair in the json. eg: {"text": "llms xyz", "class":["fade-in","another-class"]}
          if (p.class) {
            p.class.forEach((cls) => para.classList.add(cls));

            if(p.class.includes("stage-1-transition")) {
           browserWindow.style.backgroundImage = "url('../imgs/stage1.gif')";
           browserWindow.style.backgroundSize = "cover";
           browserWindow.style.backgroundPosition = "center";
           browserWindow.style.removeProperty("background-color");
        }

          else if(p.class.includes("stage-2-transition")) {
           browserWindow.style.backgroundImage = "url('../imgs/stage2.gif')";
        }

            else if(p.class.includes("stage-3-transition")) {
           browserWindow.style.backgroundImage = "url('../imgs/stage3.gif')";
        }

            else {
          browserWindow.style.backgroundImage = "none";
          }
          }

          if(!p.class) {
            browserWindow.style.backgroundImage = "none";
          }

          if (p.type) para.classList.add(`text-${p.type}`);


            if (step.trigger === "training-step-1") {
          para.classList.add("training-step-1-paragraph");
        }

          if (p.animation === "typewriter") {
            //delay was kind of a patchy addition, if i didnt want the typing to start immediately. this is also in ms.
            const delay = p.delay || 0;
            setTimeout(() => {
              typewriterEffect(para, p.text, p.speed || 50);
            }, delay);
          } else {
            para.innerHTML = p.text;
          }
          currentContainer.appendChild(para);
        });
      }
    },


    interactiveBody: () => {
      if (step.interactiveBody) {
        const interactiveBodyDiv = document.createElement("div");
        interactiveBodyDiv.classList.add("interactive-body");

        //again any additional classes for specific p elements or so
        if (step.interactiveBodyClass) {
          step.interactiveBodyClass.forEach((cls) =>
            interactiveBodyDiv.classList.add(cls)
          );
        }

        //this is to avoid rendering an empty div and making it visiblle before anything is populated it's looked at through this variable and a "has-content" class
        let hasImmediateContent = false;

        step.interactiveBody.forEach((i) => {
          const para = document.createElement("p");
          if (i.id) para.id = i.id;
          if (i.class) {
            i.class.forEach((cls) => i.classList.add(cls));
          }

          if (i.animation === "typewriter") {
            const delay = i.delay || 0;
            setTimeout(() => {
              interactiveBodyDiv.classList.add("has-content");
              typewriterEffect(para, i.text, i.speed || 50);
            }, delay);
          } else {
            para.innerHTML = i.text;
            hasImmediateContent = true;
          }

          interactiveBodyDiv.appendChild(para);
        });

        if (hasImmediateContent) {
          interactiveBodyDiv.classList.add("has-content");
        }
        currentContainer.appendChild(interactiveBodyDiv);
      }
    },

    buttons: () => {
      if (step.buttons) {
        const buttonDiv = document.createElement("div");
        buttonDiv.classList.add("button-group");

        step.buttons.forEach((b) => {
          const btn = document.createElement("button");
          btn.textContent = b.text;
          if (b.id) btn.id = b.id;
          if (b.class) {
            b.class.forEach((cls) => btn.classList.add(cls));
          }
          if (b.disabled) {
            btn.disabled = true;
            btn.style.opacity = "0.5"; // Visual indicator
          }

          if (b.delay) {
            console.log("yeahyeah");
            //a patchy fix for wanting buttons to delay even more thru css animations and the "delay" key in the json. For buttons, delay is in the button object and it's written as a STRING e.g: "7.0s", with the unit.
            btn.style.setProperty("--extra-delay", b.delay);
          }

          btn.addEventListener("click", () => {
            // If it's a data type selection step, pass the button text as extraData
            if (b.trigger === "choice-data") {
              userDataSelection = b.dataValue;
              const dataButtons =
                currentContainer.querySelectorAll(".button-choice");
              dataButtons.forEach((dataBtn) =>
                dataBtn.classList.remove("selected")
              );

              btn.classList.add("selected");
              const nextBtn = document.getElementById("data-next-btn");
              if (nextBtn) {
                nextBtn.disabled = false;
                nextBtn.style.opacity = "1";
              }
            } else {
              handleTrigger(b.trigger);
            }
          });

          buttonDiv.appendChild(btn);
        });

        currentContainer.appendChild(buttonDiv);
      }
    },
  };

  const renderOrder = step.order || ["body", "interactiveBody", "buttons"];

  renderOrder.forEach((contentType) => {
    // DISCUSS: so instead of dealing with each screens we have a default screen system and the possibility of custom elements? still not great, bc if i want to do generic -> custom -> generic,
    //  ill just have to hard code the generic elements within the custom function. as to not refer to the buttons outside.
    if (contentType === "custom" && customRenderers[step.trigger]) {
      customRenderers[step.trigger](step, currentContainer);
    } else if (contentRenderers[contentType]) {
      contentRenderers[contentType]();
    }
  });
}

function handleTrigger(trigger, extraData = null) {

  if(trigger==="restart"){
   window.location.href = "experience.html";
   return;
    };

    const step = scriptByTrigger[trigger] || scriptByIndex[parseInt(trigger)];

    if (!step){
      console.warn("no step found for trigger", trigger);
      return;
    }
   renderStep(step);
  }




function renderTrainingStep1(
  step,
  container = document.getElementById("main-container")
) {
  const customDiv = document.createElement("div");
  customDiv.classList.add("training-step-1");

  const selectDropDown = document.createElement("select");
  selectDropDown.id = "training-1-select";

  const dataType = DATA_TYPES[userDataSelection];
  const sentences = dataType.sentences;

  sentences.forEach((sentenceObj) => {
    const option = document.createElement("option");
    option.value = sentenceObj.id; //?
    option.textContent = sentenceObj.text;
    selectDropDown.appendChild(option);
  });

  customDiv.appendChild(selectDropDown);

  const likelihoodContainer = document.createElement("div");
  likelihoodContainer.id = "likelihood-container";
  customDiv.appendChild(likelihoodContainer);

  selectDropDown.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    likelihoodContainer.innerHTML = "";

    const likelihoods = dataType.sentenceLikelihoods[selectedId];

    for (const [word, prob] of Object.entries(likelihoods)) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("likelihood-bar-wrapper");

      const label = document.createElement("span");
      label.classList.add("word-label");
      label.textContent = word;

      const bar = document.createElement("div");
      bar.classList.add("likelihood-bar");

      const fill = document.createElement("div");
      fill.classList.add("likelihood-bar-fill");
      fill.style.width = `${prob * 100}%`;

      const number = document.createElement("span");
      number.classList.add("likelihood-number");
      number.textContent = `${Math.round(prob * 100)}%`;

      bar.appendChild(fill);
      bar.appendChild(number);
      wrapper.appendChild(label);
      wrapper.appendChild(bar);
      likelihoodContainer.appendChild(wrapper);
    }
  });

  selectDropDown.dispatchEvent(new Event("change"));
  container.appendChild(customDiv);
}

function renderFineTuningStep2(step) {
  const container = document.getElementById("finetuning-container");
  const finetuningQuestion = document.getElementById("finetuning-question");
  const finetuningPrompt = document.getElementById("finetuning-prompt");
  const resp1 = document.getElementById("finetuning-response-1");
  const resp2 = document.getElementById("finetuning-response-2");
  const nextBtn = document.getElementById("finetuning-next");
  const roundIndicator = document.getElementById("finetuning-round-indicator");
  const errorMsg = document.getElementById("finetuning-error");

  let currentRound = 0;
  let selectedResponse = null;
  const rounds = getFeedbackQuestions() || [];
  console.log("this is what rounds looks like:", rounds);

  container.style.display = "flex";

  function loadRound() {
    const round = rounds[currentRound];
    console.log("right now we are here round wise:", round, currentRound);
    console.log(round.question);

    finetuningQuestion.textContent = round.question;

    finetuningPrompt.textContent = step.finetuningRounds[currentRound].prompt;

    resp1.textContent = round.responses[0].text;
    resp2.textContent = round.responses[1].text;

    roundIndicator.textContent = `${currentRound + 1}/${rounds.length}`;

    selectedResponse = null;
    nextBtn.disabled = true;
    errorMsg.style.display = "none";
    [resp1, resp2].forEach((btn) => btn.classList.remove("selected"));
  }

  [resp1, resp2].forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedResponse = btn.textContent;
      [resp1, resp2].forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      nextBtn.disabled = false;
      errorMsg.style.display = "none";
    });
  });
  nextBtn.textContent = step.nextButton || "Next";

  nextBtn.addEventListener("click", () => {
    if (!selectedResponse) {
      errorMsg.style.display = "block";
      return;
    }

    currentRound++;

    if (currentRound < rounds.length) {
      loadRound();
    } else {
      // hide after last round
      container.style.display = "none";
      handleTrigger(step.finalTrigger);
    }
  });

  loadRound();
}

function renderFineTuningStep4(step) {
  const finetuningStep4 = document.getElementById("finetuning-step-4");
  finetuningStep4.style.display = "flex";

  const sliderLabels = step.sliderLabels;

  sliderLabels.forEach((label, i) => {
    const sliderLabel = document.getElementById(`slider-label-${i + 1}`);
    if (sliderLabel) {
      sliderLabel.textContent = label;
    }
  });

  //slider drag
  const sliders = document.querySelectorAll(".slider");
  const sliderValues = {};

  sliders.forEach((slider, i) => {
    const fill = slider.querySelector(".slider-fill");
    // const currentValue = fill.querySelector(".slider-value");

    let isDragging = false;

    const updateSlider = (e) => {
      const rect = slider.getBoundingClientRect();
      const x = e.clientX ?? e.touches[0].clientX;

      let percent = ((x - rect.left) / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      fill.style.width = `${percent}%`;
      // currentValue.textContent = `${Math.round(percent)}%`;
      sliderValues[`slider${i + 1}`] = Math.round(percent);
      console.log(sliderValues);
    };

    slider.addEventListener("mousedown", (e) => {
      isDragging = true;
      updateSlider(e);
    });

    slider.addEventListener("touchstart", (e) => {
      isDragging = true;
      updateSlider(e);
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) updateSlider(e);
    });

    document.addEventListener("touchmove", (e) => {
      if (isDragging) updateSlider(e);
    });

    document.addEventListener("mouseup", () => (isDragging = false));
    document.addEventListener("touchend", () => (isDragging = false));
  });

  const generateBtn = document.getElementById("generate-txt-btn");
  const outputContainer = document.getElementById(
    "finetuning-4-generated-text-container"
  );
  const output = document.getElementById("finetuning-4-generated-text");


  outputContainer.classList.add("visible");
  output.textContent = "Your generated text will appear here...";
  output.classList.add("placeholder-text");


  generateBtn.textContent = step.generateButtonText;
  let nextBtnExists = false;
  generateBtn.addEventListener("click", () => {
    const s1 = sliderValues.slider1 ?? 50;
    const s2 = sliderValues.slider2 ?? 50;
    const s3 = sliderValues.slider3 ?? 50;

    userPersonality = {
      randomness: s1,
      friendliness: s2,
      wordiness: s3,
    };

    const generatedText = getPersonalityText(userDataSelection, s1, s2, s3);
    output.classList.remove("placeholder-text");
    output.textContent = generatedText;

    if (!nextBtnExists) {
      const nextBtn = document.createElement("button");
      nextBtn.innerText = step.nextButton[0]["text"];
      nextBtn.classList.add(step.nextButton[0]["class"]);
      nextBtn.classList.add("finetuning-stage-btn"); 
      finetuningStep4.appendChild(nextBtn);
      nextBtnExists = true;
      nextBtn.addEventListener("click", () => {
        finetuningStep4.style.display = "none";
        handleTrigger(step.nextButton[0]["trigger"]);
      });
    }
  });
}

// function renderStage3Chatbot(step) {

//   browserWindow.style.backgroundImage = "none";
//   const chatbotContainer = document.getElementById("stage3-chatbot");
//   const questionContainer = document.getElementById("stage3-chatbot-questions");
//   const chatWindow = document.getElementById("stage3-chatbot-window");

//   chatbotContainer.style.display = "flex";

//   const introMsg = document.getElementById("chatbot-intro-text");
//   chatWindow.appendChild(introMsg);

 

//   step.chatbotQuestions.forEach((qa, index) => {
//     if (buttons[index]) {
//       buttons[index].textContent = qa.question;

//       buttons[index].addEventListener("click", () => {

//         //disabling btn after click 
//         buttons[index].disabled = true;
//         buttons[index].style.opacity="0.5";
//         buttons[index].style.cursor ="not-allowed";
//         const userMsg = document.createElement("div");
//         userMsg.classList.add("stage3-chatbot-user-msg");
//         userMsg.classList.add("fade-in");
//         userMsg.textContent = qa.question;
//         chatWindow.appendChild(userMsg);

//         const botMsg = document.createElement("div");
//         botMsg.classList.add("stage3-chatbot-answer");
//         chatWindow.appendChild(botMsg);

//         const answer = getChatbotResponses(
//           userDataSelection,
//           userPersonality.randomness,
//           userPersonality.friendliness,
//           userPersonality.wordiness,
//           index
//         );

//         setTimeout(() => {
//           typewriterEffect(botMsg, answer, 40);
//           chatWindow.scrollTop = chatWindow.scrollHeight;
//         }, 500);
//       });
//     }
//   });

//   if (step.nextButton) {
//     const nextBtn = document.getElementById("stage3-chatbot-next");
//     nextBtn.textContent = step.nextButton[0]["text"];
//     nextBtn.addEventListener("click", () => {
//       chatbotContainer.style.display = "none";
//       handleTrigger(step.nextButton[0]["trigger"]);
//     });
//   }
// }



function renderStage3Chatbot(step) {
  browserWindow.style.backgroundImage = "none";
  const chatbotContainer = document.getElementById("stage3-chatbot");
  const chatWindow = document.getElementById("stage3-chatbot-window");

  chatbotContainer.style.display = "flex";

  const introMsg = document.getElementById("chatbot-intro-text");
  chatWindow.appendChild(introMsg);

  typewriterEffect(introMsg, step.chatbotIntro.text, step.chatbotIntro.speed);

  const buttons = document.querySelectorAll(".stage3-question");

  const usedQuestions = [0, 1, 2]; // track which questions are currently shown, fixed array - this is for grabbing and displaying the right qs 

  //a growing set which tracks all used questions to avoid duplicates 
  const allAskedQuestions = new Set([0,1,2]); 
  let isTyping = false;

  // load initial questions
  buttons.forEach((button, index) => {
    button.textContent = step.chatbotQuestions[index].question;
  });

  // add click handlers
  buttons.forEach((button, buttonIndex) => {
    button.addEventListener("click", () => {
      if (isTyping) return;

      const questionIndex = usedQuestions[buttonIndex];
      console.log(" this is the question index: ", questionIndex);
      console.log("this is the button index: ", buttonIndex);
      const qa = step.chatbotQuestions[questionIndex];
      console.log("this is what qa is: ", qa); 
  

      // disable all buttons while typing
      isTyping = true;
      buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
      });

      // add user message
      const userMsg = document.createElement("div");
      userMsg.classList.add("stage3-chatbot-user-msg");
      userMsg.classList.add("fade-in");
      userMsg.textContent = qa.question;
      chatWindow.appendChild(userMsg);

      // add bot message
      const botMsg = document.createElement("div");
      botMsg.classList.add("stage3-chatbot-answer");
      chatWindow.appendChild(botMsg);

      const answer = getChatbotResponses(
        userDataSelection,
        userPersonality.randomness,
        userPersonality.friendliness,
        userPersonality.wordiness,
        questionIndex
      );

      setTimeout(() => {
        typewriterEffect(botMsg, answer, 40, () => {
          isTyping = false;

          // find next unused question, we use findIndex here bc users might click out of ordr
          const nextQuestionIndex = step.chatbotQuestions.findIndex((_,i) => !allAskedQuestions.has(i));


          // If there's a new question, replace this button
          if (nextQuestionIndex !== -1) {
            usedQuestions[buttonIndex] = nextQuestionIndex;

            allAskedQuestions.add(nextQuestionIndex);
            
            // Fade out
            button.style.transition = "opacity 0.3s";
            button.style.opacity = "0";
            
            setTimeout(() => {
              // Update text
              button.textContent = step.chatbotQuestions[nextQuestionIndex].question;
              button.disabled = false;
              button.style.cursor = "pointer";
              
              // Fade in
              button.style.opacity = "1";
            }, 300);
          } else {
            // No more questions, hide this button
            button.style.transition = "opacity 0.3s";
            button.style.opacity = "0";
            setTimeout(() => {
              button.style.display = "none";
            }, 300);
          }

          // Re-enable other buttons
          buttons.forEach((btn, idx) => {
            if (idx !== buttonIndex && btn.style.display !== "none") {
              btn.disabled = false;
              btn.style.opacity = "1";
              btn.style.cursor = "pointer";
            }
          });
        });
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }, 500);
    });
  });

  if (step.nextButton) {
    const nextBtn = document.getElementById("stage3-chatbot-next");
    nextBtn.textContent = step.nextButton[0]["text"];
    nextBtn.addEventListener("click", () => {
      console.log("i'm detecting the next click");
      chatbotContainer.style.display = "none";
      handleTrigger(step.nextButton[0]["trigger"]);
    });
  }
}


function typewriterEffect(element, text, speed = 50, callback) {
  element.textContent = "";
  element.classList.add("typewriter");
  element.style.display = "inline";

  let i = 0;
  const timer = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(timer);
      element.classList.add("done");
      element.classList.remove("typewriter");
      if (callback) callback();
    }
  }, speed);
}

window.addEventListener("DOMContentLoaded", loadScript);
