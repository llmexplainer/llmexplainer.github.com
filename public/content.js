

async function loadPage() {
  let currentLanguage = localStorage.getItem('language') || 'en';
  try {
    const response = await fetch("public/json/script.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const jsonData = await response.json();

    const langData = jsonData[currentLanguage];
    const UIData = langData.ui; 
    
    document.querySelector("#navbar-title a").textContent = UIData.navbar.title;
    document.querySelector("#navbar-resources a").textContent = UIData.navbar.resources;
    document.querySelector("#navbar-about a").textContent = UIData.navbar.about;
   const languageSelector = document.getElementById("language-selector"); 
   languageSelector.value = currentLanguage; 

   languageSelector.addEventListener("change", (e) => {
    currentLanguage = e.target.value; 
    localStorage.setItem('language', currentLanguage);
    location.reload();
   })
    
    // const introStep = langData.script[0];
    // const container = document.getElementById("intro-container");
    
    // const intro_header = document.createElement("p");

    // intro_header.textContent = introStep.body[0].text;
    // intro_header.className = introStep.body[0].class;
    // container.appendChild(intro_header);

    // const intro_body = document.createElement("div");
    // intro_body.className = "intro-body";

    // const intro_img = document.createElement("img");
    // intro_img.src = "../imgs/stage3.gif";
    // intro_img.alt = "Add alt text";
    // intro_img.className = "intro-img";

    // const intro_para = document.createElement("p");
    // intro_para.textContent = introStep.body[1].text;
    // intro_para.className = introStep.body[1].class;

    // intro_body.appendChild(intro_img);
    // intro_body.appendChild(intro_para);

    // container.appendChild(intro_body);


    // introStep.body.forEach(b => {
    //   const p = document.createElement("p");
    //   p.textContent = b.text;
    //   p.className = b.class;
    //   container.appendChild(p);
    // });
    
  //   const startBtn = document.createElement("button");
  //   startBtn.textContent = introStep.buttons[0].text;
  //   startBtn.id = "start-btn";
  //   startBtn.addEventListener("click", () => {
  //     window.location.href = "experience.html";
  //   });
  //   container.appendChild(startBtn);
  } catch (error) {
    console.error("Failed to load intro:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadPage);