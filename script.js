const pages=[...document.querySelectorAll(".page")],
dots=[...document.querySelectorAll(".step-dot")],
prevBtn=document.getElementById("prevBtn"),
nextBtn=document.getElementById("nextBtn"),
pageLabel=document.getElementById("pageLabel");
let currentPage=0;

function showPage(i){
  currentPage=Math.max(0,Math.min(i,pages.length-1));
  pages.forEach((p,n)=>p.classList.toggle("active",n===currentPage));
  dots.forEach((d,n)=>d.classList.toggle("active",n===currentPage));
  prevBtn.disabled=currentPage===0;
  nextBtn.textContent=currentPage===pages.length-1?"Restart ↺":"Next →";
  pageLabel.textContent=`${currentPage+1} of ${pages.length}`;
}
prevBtn.addEventListener("click",()=>showPage(currentPage-1));
nextBtn.addEventListener("click",()=>currentPage===pages.length-1?showPage(0):showPage(currentPage+1));

const rightPole=document.getElementById("rightPole"),
distance=document.getElementById("distance"),
leftMagnet=document.getElementById("leftMagnet"),
rightMagnet=document.getElementById("rightMagnet"),
fieldLines=document.getElementById("fieldLines"),
interactionStatus=document.getElementById("interactionStatus"),
statusExplanation=document.getElementById("statusExplanation"),
forceReadout=document.getElementById("forceReadout"),
leftArrow=document.getElementById("leftArrow"),
rightArrow=document.getElementById("rightArrow"),
attractArrows=document.getElementById("attractArrows"),
meterFill=document.getElementById("meterFill"),
forceZone=document.querySelector(".force-zone");

let sim = {
  leftX: 0,
  rightX: 0,
  leftV: 0,
  rightV: 0,
  targetLeft: 0,
  targetRight: 0,
  forceStrength: 0,
  repel: false,
  lastTime: performance.now()
};

function getForceState(){
  const pole=rightPole.value;
  const d=Number(distance.value);
  const repel=pole==="S"; // fixed inner pole of left magnet is S
  const normalized=1-(d-20)/160;
  const strength=Math.max(0,Math.min(1,normalized));
  return {pole,d,repel,strength};
}

function updateLabels(){
  const {pole,d,repel,strength}=getForceState();

  rightMagnet.src=pole==="S"?"assets/bar-magnet-sn.svg":"assets/bar-magnet-ns.svg";

  const word=strength>.66?"strong":strength>.33?"medium":"weak";
  const pct=Math.round(strength*100);
  meterFill.style.width=`${pct}%`;

  // The visual target displacement represents the tendency of each magnet to move.
  // Near magnets move much more strongly than distant ones.
  const maxTravel=34;
  const displacement=maxTravel*(0.12+0.88*strength*strength);

  if(repel){
    sim.targetLeft=-displacement;
    sim.targetRight=displacement;
    interactionStatus.textContent="REPULSION";
    interactionStatus.style.color="#b64242";
    statusExplanation.textContent="The facing poles are the same (S–S), so the magnets push away from each other.";
    leftArrow.style.display="block";
    rightArrow.style.display="block";
    attractArrows.style.display="none";
    forceReadout.innerHTML=`<b>Repulsive force:</b> ${word}. Notice the magnets spring apart more strongly when they are closer.`;
  }else{
    sim.targetLeft=displacement;
    sim.targetRight=-displacement;
    interactionStatus.textContent="ATTRACTION";
    interactionStatus.style.color="#25845d";
    statusExplanation.textContent="The facing poles are different (S–N), so the magnets pull toward each other.";
    leftArrow.style.display="none";
    rightArrow.style.display="none";
    attractArrows.style.display="flex";
    forceReadout.innerHTML=`<b>Attractive force:</b> ${word}. Notice the magnets spring toward each other more strongly when they are closer.`;
  }

  sim.forceStrength=strength;
  sim.repel=repel;

  const arrowScale=.72+strength*.78;
  leftArrow.style.transform=`scale(${arrowScale})`;
  rightArrow.style.transform=`scale(${arrowScale})`;
  attractArrows.style.transform=`scale(${arrowScale})`;

  fieldLines.style.opacity=String(.25+.55*strength);
  fieldLines.style.transform=`scale(${1+strength*.025})`;

  forceZone.classList.toggle("pulsing",strength>.45);

  // Give the spring a small impulse whenever the control changes.
  const kick=(0.35+strength*1.8)*(repel?1:-1);
  sim.leftV += -kick;
  sim.rightV += kick;
}

function animate(now){
  const dt=Math.min((now-sim.lastTime)/1000,0.033);
  sim.lastTime=now;

  // Damped spring: acceleration = stiffness * displacement error - damping * velocity
  // Slightly stronger spring at high magnetic force.
  const k=48+sim.forceStrength*52;
  const damping=8.5;

  const leftA=k*(sim.targetLeft-sim.leftX)-damping*sim.leftV;
  const rightA=k*(sim.targetRight-sim.rightX)-damping*sim.rightV;

  sim.leftV += leftA*dt;
  sim.rightV += rightA*dt;
  sim.leftX += sim.leftV*dt;
  sim.rightX += sim.rightV*dt;

  // Tiny rotation gives a more tactile, elastic feeling without becoming distracting.
  const leftTilt=Math.max(-2.2,Math.min(2.2,sim.leftV*.11));
  const rightTilt=Math.max(-2.2,Math.min(2.2,sim.rightV*.11));

  leftMagnet.style.transform=`translateX(${sim.leftX}px) rotate(${leftTilt}deg)`;
  rightMagnet.style.transform=`translateX(${sim.rightX}px) rotate(${rightTilt}deg)`;

  const active=Math.abs(sim.leftV)+Math.abs(sim.rightV)>.35;
  leftMagnet.classList.toggle("force-active",active);
  rightMagnet.classList.toggle("force-active",active);

  requestAnimationFrame(animate);
}

rightPole.addEventListener("change",updateLabels);
distance.addEventListener("input",updateLabels);
updateLabels();
requestAnimationFrame(animate);

/* Prediction questions */
let score=0;
document.querySelectorAll(".question-card").forEach(card=>{
  let answered=false;
  const answer=card.dataset.answer;
  const feedback=card.querySelector(".feedback");
  card.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{
    if(answered)return;
    answered=true;
    const choice=btn.dataset.choice;
    if(choice===answer){
      btn.classList.add("correct");
      feedback.textContent="Correct!";
      feedback.style.color="#25845d";
      document.getElementById("score").textContent=++score;
    }else{
      btn.classList.add("incorrect");
      feedback.textContent=`It will ${answer}.`;
      feedback.style.color="#b64242";
      card.querySelector(`[data-choice="${answer}"]`).classList.add("correct");
    }
  }));
});

/* Challenge page */
const challengeLeft=document.getElementById("challengeLeft"),
challengeRight=document.getElementById("challengeRight"),
challengeLeftInner=document.getElementById("challengeLeftInner"),
challengeLeftOuter=document.getElementById("challengeLeftOuter"),
challengeRightInner=document.getElementById("challengeRightInner"),
challengeRightOuter=document.getElementById("challengeRightOuter"),
interactionSymbol=document.getElementById("interactionSymbol"),
challengeFeedback=document.getElementById("challengeFeedback"),
challengeInstruction=document.getElementById("challengeInstruction"),
challengeMagnetLeft=document.getElementById("challengeMagnetLeft"),
challengeMagnetRight=document.getElementById("challengeMagnetRight");

let target="repel";

function setPole(el,p){
  el.textContent=p;
  el.className=`pole ${p==="N"?"north":"south"}`;
}

function updateChallengeVisual(){
  const l=challengeLeft.value,r=challengeRight.value;
  setPole(challengeLeftInner,l);
  setPole(challengeLeftOuter,l==="N"?"S":"N");
  setPole(challengeRightInner,r);
  setPole(challengeRightOuter,r==="N"?"S":"N");

  const repel=l===r;
  interactionSymbol.textContent=repel?"↔":"→←";

  // Small springy preview on the challenge magnets.
  challengeMagnetLeft.animate(
    repel
      ? [{transform:"translateX(0)"},{transform:"translateX(-12px)"},{transform:"translateX(-7px)"}]
      : [{transform:"translateX(0)"},{transform:"translateX(12px)"},{transform:"translateX(7px)"}],
    {duration:520,easing:"cubic-bezier(.22,1.4,.36,1)",fill:"forwards"}
  );
  challengeMagnetRight.animate(
    repel
      ? [{transform:"translateX(0)"},{transform:"translateX(12px)"},{transform:"translateX(7px)"}]
      : [{transform:"translateX(0)"},{transform:"translateX(-12px)"},{transform:"translateX(-7px)"}],
    {duration:520,easing:"cubic-bezier(.22,1.4,.36,1)",fill:"forwards"}
  );
}
challengeLeft.addEventListener("change",updateChallengeVisual);
challengeRight.addEventListener("change",updateChallengeVisual);

document.getElementById("checkChallenge").addEventListener("click",()=>{
  const actual=challengeLeft.value===challengeRight.value?"repel":"attract";
  if(actual===target){
    challengeFeedback.innerHTML=`<b>Correct.</b> ${challengeLeft.value} facing ${challengeRight.value} will ${actual}.`;
    challengeFeedback.style.borderColor="#7bc8a5";
  }else{
    challengeFeedback.innerHTML=`<b>Not yet.</b> Those poles will ${actual}. Change one or both poles and try again.`;
    challengeFeedback.style.borderColor="#e3a0a0";
  }
});

document.getElementById("newChallenge").addEventListener("click",()=>{
  target=target==="repel"?"attract":"repel";
  challengeInstruction.innerHTML=`Make the two magnets <b>${target}</b>.`;
  challengeFeedback.textContent="";
  challengeFeedback.style.borderColor="";
});

updateChallengeVisual();
showPage(0);
