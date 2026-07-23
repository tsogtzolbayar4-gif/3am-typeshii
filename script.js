/* =========================================================
   1. QUESTIONS DATA
   -----------------------------------------------------------
   This is the ONLY place you need to edit to add/change/remove
   questions. Each question is one object in this array.

   Supported types:
   - "yesno"   -> shows Yes / No buttons
                  needs: popup.yes {image, message}, popup.no {image, message}
   - "slider"  -> shows a 0-100 range slider + Continue button
                  needs: popup {image, message}  (message can use {value})
   - "date"    -> shows a native date picker + Continue button
                  needs: min, max (yyyy-mm-dd strings), popup {image, message}
                  (message can use {value}, filled with a nicely formatted date)
   - "message" -> a picture-only slide with a Continue button
                  (no answer is recorded, just shown as a moment)
                  needs: image, text

   BRANCHING:
   By default, after a question is answered the app moves to the
   next item in this array. To skip around, add a "next" field:
     - "next": "q4"                      -> always go to q4 next
     - "next": { yes: "q2", no: "q4" }   -> depends on the yes/no answer
   ========================================================= */
const questions = [
  {
    id: "q1",
    type: "yesno",
    text: "Is temi still pissed off?",
    next: { yes: "q2", no: "q4" },
    popup: {
      yes: { image: "images/popup-q1-yes.png", message: "awww man😔" },
      no:  { image: "images/popup-q1-no.png",  message: "YESSSS *happy zolo*😊" }
    }
  },
  {
    id: "q2",
    type: "yesno",
    text: "Is zolo holduu tolgoi? toms preferably?",
    popup: {
      yes: { image: "images/popup-q2-yes.png", message: "medsiiimaaaaaa🙂‍↕️" },
      no:  { image: "images/popup-q2-no.png",  message: "WOAHHHHH FRR???😁" }
    }
  },
  {
    id: "q3",
    type: "slider",
    text: "How did zolo do on temi's shalgalt?",
    popup: {
      image: "images/popup-q3.png",
      message: "u gave zolo {value}%. dangggg 😅"
    }
  },
  {
    id: "q4",
    type: "yesno",
    text: "Will temi meet zolo again someday?",
    // "no" loops back to this same question — it will keep asking
    // until she answers "yes", instead of moving on.
    next: { yes: "q5", no: "q4" },
    popup: {
      yes: { image: "images/popup-q4-yes.png", message: "omg letsgo?? SURESKIIIIIII🎉" },
      no:  { image: "images/popup-q4-no.png",  message: "ooooooooooooooooosad but try again mueheheh" }
    }
  },
  {
    id: "q5",
    type: "date",
    text: "When is temi free?",
    min: "2026-07-01",
    max: "2026-08-31",
    popup: {
      image: "images/popup-q5.png",
      message: "got it oilgtsn2 sonstsn2: {value} 🗓️"
    }
  },
  {
    id: "q5info",
    type: "info",
    // She doesn't answer these — they're just shown as facts already
    // known, then a plain Continue button moves on.
    text: "before we go on, heres what zolos already telling on himself:",
    lines: [
      "Is the best episode of ST S5 still unwatched, waiting for someone who recommended the series? — yes",
      "Does zolo like watching movies? — yes",
      "Did he watch any movie that came out recently? — no"
    ]
  },
  {
    id: "q7",
    type: "chaseyes",
    text: "Are u willing to watch epi8 with zolo?",
    // "No" runs away around the screen and can't actually be pressed;
    // "Yes" grows a little bigger with every dodge. There is no "no"
    // outcome for this one on purpose.
    popup: {
      yes: {
        image: "images/popup-q7-yes.png",
        message: "okaaaaaaa so this day ->{date} watch epi8 with zolo 🥳✌️"
      }
    }
  },
  {
    id: "q6",
    type: "message",
    text: "So... let's tsaaazar avah, zolo? Shall we?",
    image: "images/q6-picture.png"
  }
];

/* Final heartfelt message shown at the very end.
   Feel free to rewrite this completely. */
const finalMessage =
`okay yes i acted pretty holduu the other day no action ai thhhhhhhh tegsnnn i regret it honestly there is so many things i couldve done better and had the full chance to turn that day around on the brighter side but i didnt, made it even worse 28celsius? huurai haluun🤢`;

/* =========================================================
   2. EMAILJS CONFIG
   -----------------------------------------------------------
   1. Create a free account at https://www.emailjs.com
   2. Add an email service (e.g. Gmail) -> copy the Service ID
   3. Create an email template -> copy the Template ID
      (in the template body, use {{answers}} to print all answers)
   4. Copy your Public Key from Account > API Keys
   5. Paste all three below.
   ========================================================= */
const EMAILJS_PUBLIC_KEY  = "fwt6YGt_2F1v743xA";
const EMAILJS_SERVICE_ID  = "service_74zhvpo";
const EMAILJS_TEMPLATE_ID = "template_6d58vit";

/* =========================================================
   3. STATE
   ========================================================= */
let currentId = questions[0].id;
let pendingNextId = null;
const answers = {};

function getQuestionById(id) {
  return questions.find(q => q.id === id);
}

function getCurrentQuestion() {
  return getQuestionById(currentId);
}

/* Works out where to go after a question is answered.
   - explicit "next" string -> always goes there
   - explicit "next" object -> looks up the answer value
   - no "next" field -> falls back to the next item in the array */
function getNextId(question, answerValue) {
  if (question.next) {
    if (typeof question.next === "string") return question.next;
    if (typeof question.next === "object") return question.next[answerValue] ?? null;
  }
  const idx = questions.findIndex(q => q.id === question.id);
  return questions[idx + 1] ? questions[idx + 1].id : null;
}

/* =========================================================
   4. DOM REFERENCES
   ========================================================= */
const questionCard     = document.getElementById("question-card");
const questionCounter   = document.getElementById("question-counter");
const questionText      = document.getElementById("question-text");

const yesnoControls     = document.getElementById("yesno-controls");
const btnYes            = document.getElementById("btn-yes");
const btnNo             = document.getElementById("btn-no");

const sliderControls    = document.getElementById("slider-controls");
const sliderInput       = document.getElementById("slider-input");
const sliderValue       = document.getElementById("slider-value");
const btnSliderSubmit   = document.getElementById("btn-slider-submit");

const dateControls      = document.getElementById("date-controls");
const dateInput         = document.getElementById("date-input");
const btnDateSubmit     = document.getElementById("btn-date-submit");

const infoControls      = document.getElementById("info-controls");
const infoList          = document.getElementById("info-list");
const btnInfoContinue   = document.getElementById("btn-info-continue");

const chaseControls     = document.getElementById("chase-controls");
const btnChaseYes       = document.getElementById("btn-chase-yes");
const btnChaseNo        = document.getElementById("btn-chase-no");

const messageControls   = document.getElementById("message-controls");
const messageImage      = document.getElementById("message-image");
const btnMessageContinue= document.getElementById("btn-message-continue");

const popupOverlay      = document.getElementById("popup-overlay");
const popupImage        = document.getElementById("popup-image");
const popupMessage      = document.getElementById("popup-message");
const popupContinue     = document.getElementById("popup-continue");

const finalScreen       = document.getElementById("final-screen");
const finalMessageEl    = document.getElementById("final-message");

const musicToggle       = document.getElementById("music-toggle");
const bgMusic           = document.getElementById("bg-music");

/* No numbered counter is shown since the path can branch and skip
   questions — a plain little label sits there instead. */
questionCounter.textContent = "no wrong answers 💭";

/* =========================================================
   5. RENDER CURRENT QUESTION
   ========================================================= */
function renderQuestion() {
  const q = getCurrentQuestion();

  // Reset all control panels
  yesnoControls.classList.add("hidden");
  sliderControls.classList.add("hidden");
  dateControls.classList.add("hidden");
  infoControls.classList.add("hidden");
  chaseControls.classList.add("hidden");
  messageControls.classList.add("hidden");
  clearChaseMode();

  questionText.textContent = q.text;

  if (q.type === "yesno") {
    yesnoControls.classList.remove("hidden");
  } else if (q.type === "slider") {
    sliderControls.classList.remove("hidden");
    sliderInput.value = 50;
    sliderValue.textContent = "50%";
  } else if (q.type === "date") {
    dateControls.classList.remove("hidden");
    if (q.min) dateInput.min = q.min;
    if (q.max) dateInput.max = q.max;
    dateInput.value = q.min || "";
  } else if (q.type === "info") {
    infoControls.classList.remove("hidden");
    infoList.innerHTML = "";
    (q.lines || []).forEach(line => {
      const li = document.createElement("li");
      li.textContent = line;
      infoList.appendChild(li);
    });
  } else if (q.type === "chaseyes") {
    questionCard.classList.add("chase-active");
    chaseControls.classList.remove("hidden");
    resetChaseButtons();
  } else if (q.type === "message") {
    messageControls.classList.remove("hidden");
    setImageWithFallback(messageImage, q.image, "💌");
  }
}

/* =========================================================
   6. HANDLE ANSWERS
   ========================================================= */
btnYes.addEventListener("click", () => handleYesNo("yes"));
btnNo.addEventListener("click", () => handleYesNo("no"));

function handleYesNo(choice) {
  const q = getCurrentQuestion();
  answers[q.id] = choice;
  const nextId = getNextId(q, choice);
  showPopup(q.popup[choice].image, q.popup[choice].message, nextId);
}

sliderInput.addEventListener("input", () => {
  sliderValue.textContent = `${sliderInput.value}%`;
});

btnSliderSubmit.addEventListener("click", () => {
  const q = getCurrentQuestion();
  const value = sliderInput.value;
  answers[q.id] = value;
  const message = q.popup.message.replace("{value}", value);
  const nextId = getNextId(q, value);
  showPopup(q.popup.image, message, nextId);
});

btnDateSubmit.addEventListener("click", () => {
  const q = getCurrentQuestion();
  const value = dateInput.value;
  if (!value) return; // require a date before continuing
  answers[q.id] = value;
  const formatted = new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });
  answers.q5_formatted = formatted; // saved so later questions (like q7) can reference the date she picked
  const message = q.popup.message.replace("{value}", formatted);
  const nextId = getNextId(q, value);
  showPopup(q.popup.image, message, nextId);
});

/* ---- "chaseyes" behavior: No dodges around the question card, Yes grows ----
   No is never actually clickable — pointerdown (tap/press) relocates it
   along the card edge before a click can land. Bounds follow the card on
   mobile and desktop. */
let chaseDodgeCount = 0;
const CHASE_MAX_DODGES = 8;

function resetChaseButtons() {
  chaseDodgeCount = 0;
  btnChaseNo.style.position = "";
  btnChaseNo.style.left = "";
  btnChaseNo.style.top = "";
  btnChaseNo.style.margin = "";
  btnChaseNo.style.zIndex = "";
  btnChaseNo.dataset.fixed = "false";
  btnChaseYes.style.transform = "";
}

function clearChaseMode() {
  questionCard.classList.remove("chase-active");
  resetChaseButtons();
}

function growChaseYesButton() {
  chaseDodgeCount = Math.min(chaseDodgeCount + 1, CHASE_MAX_DODGES);
  const scale = 1 + chaseDodgeCount * 0.12; // grows a little bigger each dodge
  btnChaseYes.style.transform = `scale(${scale})`;
}

/* Small zone inside the question card (card-local coords, not viewport). */
function getChaseArenaBounds(btnWidth, btnHeight) {
  const cardWidth = questionCard.clientWidth;
  const cardHeight = questionCard.clientHeight;
  const isMobile = window.innerWidth <= 480;
  const edgePad = isMobile ? 10 : 14;

  const rowTop = chaseControls.offsetTop;
  const rowHeight = chaseControls.offsetHeight;
  const rowPadY = isMobile ? 18 : 24;
  const rowPadX = isMobile ? 12 : 18;

  const minX = edgePad + rowPadX;
  const maxX = Math.max(minX, cardWidth - btnWidth - edgePad - rowPadX);
  const minY = Math.max(edgePad, rowTop - rowPadY);
  const maxY = Math.min(
    cardHeight - btnHeight - edgePad,
    rowTop + rowHeight + rowPadY
  );

  return { minX, minY, maxX, maxY };
}

/* Small hops near the buttons — never a big leap to the far edge. */
function pickChaseNoPosition(btnWidth, btnHeight, currentX, currentY) {
  const { minX, minY, maxX, maxY } = getChaseArenaBounds(btnWidth, btnHeight);
  const isMobile = window.innerWidth <= 480;
  const minJump = isMobile ? 18 : 22;
  const maxJump = isMobile ? 48 : 64;

  for (let i = 0; i < 10; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    const dist = Math.hypot(x - currentX, y - currentY);
    if (dist >= minJump && dist <= maxJump) return { x, y };
  }

  // Fallback: short nudge in a random direction, still clamped to the zone.
  const angle = Math.random() * Math.PI * 2;
  const dist = minJump + Math.random() * (maxJump - minJump);
  let x = currentX + Math.cos(angle) * dist;
  let y = currentY + Math.sin(angle) * dist;
  x = Math.min(maxX, Math.max(minX, x));
  y = Math.min(maxY, Math.max(minY, y));
  return { x, y };
}

function dodgeChaseNoButton(event) {
  if (event) event.preventDefault();

  const cardRect = questionCard.getBoundingClientRect();
  const rect = btnChaseNo.getBoundingClientRect();

  // First dodge: pin inside the card (not fixed — the card has a transform
  // animation which breaks viewport-fixed positioning).
  if (btnChaseNo.dataset.fixed !== "true") {
    btnChaseNo.style.position = "absolute";
    btnChaseNo.style.left = `${rect.left - cardRect.left}px`;
    btnChaseNo.style.top = `${rect.top - cardRect.top}px`;
    btnChaseNo.style.margin = "0";
    btnChaseNo.style.zIndex = "5";
    btnChaseNo.dataset.fixed = "true";
  }

  const currentX = parseFloat(btnChaseNo.style.left) || 0;
  const currentY = parseFloat(btnChaseNo.style.top) || 0;

  const { x: newX, y: newY } = pickChaseNoPosition(
    rect.width,
    rect.height,
    currentX,
    currentY
  );

  btnChaseNo.style.left = `${newX}px`;
  btnChaseNo.style.top = `${newY}px`;

  growChaseYesButton();
}

// Dodges only when actually pressed/tapped — not on hover — and the
// CSS transition (see .chase-no-btn) makes the escape visibly slow
// rather than an instant teleport.
btnChaseNo.addEventListener("pointerdown", dodgeChaseNoButton);

btnChaseYes.addEventListener("click", () => {
  const q = getCurrentQuestion();
  if (q.type !== "chaseyes") return;
  answers[q.id] = "yes";
  const dateText = answers.q5_formatted || answers.q5 || "that day";
  const message = q.popup.yes.message.replace("{date}", dateText);
  const nextId = getNextId(q, "yes");
  showPopup(q.popup.yes.image, message, nextId);
});

btnInfoContinue.addEventListener("click", () => {
  const q = getCurrentQuestion();
  const nextId = getNextId(q, null);
  goToNext(nextId);
});

btnMessageContinue.addEventListener("click", () => {
  const q = getCurrentQuestion();
  const nextId = getNextId(q, null);
  goToNext(nextId);
});

/* =========================================================
   7. POPUP
   ========================================================= */
function showPopup(image, message, nextId) {
  pendingNextId = nextId;
  setImageWithFallback(popupImage, image, "💗");
  popupMessage.textContent = message;
  popupOverlay.classList.remove("hidden");
}

popupContinue.addEventListener("click", () => {
  popupOverlay.classList.add("hidden");
  goToNext(pendingNextId);
});

/* =========================================================
   8. ADVANCE TO NEXT QUESTION / FINAL SCREEN
   ========================================================= */
function goToNext(nextId) {
  if (!nextId) {
    showFinalScreen();
    return;
  }

  // small transition
  questionCard.classList.add("card-leaving");
  setTimeout(() => {
    currentId = nextId;
    renderQuestion();
    questionCard.classList.remove("card-leaving");
  }, 300);
}

/* =========================================================
   9. FINAL SCREEN
   ========================================================= */
function showFinalScreen() {
  questionCard.classList.add("hidden");
  finalMessageEl.textContent = finalMessage;
  finalScreen.classList.remove("hidden");

  launchConfetti();
  sendAnswersByEmail();
}

/* =========================================================
   10. IMAGE FALLBACK HELPER
   -----------------------------------------------------------
   If an image hasn't been added yet, show a big emoji instead
   of a broken image icon, so the page always looks intentional.
   ========================================================= */
function setImageWithFallback(imgEl, src, fallbackEmoji) {
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.replaceWith(Object.assign(document.createElement("div"), {
      textContent: fallbackEmoji,
      style: "font-size:4rem; margin: 10px 0;"
    }));
  };
  imgEl.src = src;
}

/* =========================================================
   11. BACKGROUND IMAGE LOADER
   -----------------------------------------------------------
   Tries to load images/background.jpg. If it's not there yet,
   the soft navy gradient (already set in CSS) stays as-is.
   ========================================================= */
(function loadBackground() {
  const bgLayer = document.getElementById("bg-layer");
  const testImg = new Image();
  testImg.onload = () => {
    bgLayer.style.backgroundImage = `url("images/background.jpg")`;
  };
  testImg.src = "images/background.jpg";
})();

/* =========================================================
   12. FLOATING AMBIENT EMOJI
   -----------------------------------------------------------
   Change the emojiSymbols array to whatever set you like.
   ========================================================= */
(function spawnFloatingHearts() {
  const container = document.getElementById("floating-hearts");
  const emojiSymbols = ["🦦", "🦭", "🍌", "🫐"];
  const count = 64;

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = emojiSymbols[Math.floor(Math.random() * emojiSymbols.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${8 + Math.random() * 10}s`;
    heart.style.animationDelay = `${Math.random() * 10}s`;
    heart.style.fontSize = `${1 + Math.random() * 4}rem`;
    container.appendChild(heart);
  }
})();

/* =========================================================
   13. MUSIC TOGGLE
   -----------------------------------------------------------
   To enable: put an mp3 at images/music.mp3 (or anywhere you like),
   set bgMusic.src below, and remove the "hidden" class from the button.
   ========================================================= */
let musicPlaying = false;

// bgMusic.src = "music.mp3";      // <- uncomment and point to your file
// musicToggle.classList.remove("hidden");   // <- uncomment to show the button

musicToggle.addEventListener("click", () => {
  if (musicPlaying) {
    bgMusic.pause();
    musicToggle.textContent = "🔇";
  } else {
    bgMusic.play().catch(() => {});
    musicToggle.textContent = "🔊";
  }
  musicPlaying = !musicPlaying;
});

/* =========================================================
   14. CONFETTI (lightweight, no external library needed)
   ========================================================= */
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#7FB9B3", "#F3CE5C", "#7B87C2", "#FFFDF8", "#A9D6D1"];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    size: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: -1.5 + Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: -6 + Math.random() * 12
  }));

  let frame = 0;
  const maxFrames = 260;

  function draw() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (frame < maxFrames) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  draw();
}

/* =========================================================
   15. SEND ANSWERS BY EMAIL (EmailJS)
   ========================================================= */
function sendAnswersByEmail() {
  if (typeof emailjs === "undefined") return;
  if (EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
    console.warn("EmailJS is not configured yet — answers were not sent. See the config section at the top of script.js");
    return;
  }

  emailjs.init(EMAILJS_PUBLIC_KEY);

  const answersFormatted = questions
    .filter(q => answers[q.id] !== undefined)
    .map(q => `${q.text} -> ${answers[q.id]}`)
    .join("\n");

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    answers: answersFormatted
  }).catch(err => console.error("EmailJS error:", err));
}

/* =========================================================
   16. INIT
   ========================================================= */
renderQuestion();
