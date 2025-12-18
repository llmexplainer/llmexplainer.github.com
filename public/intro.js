async function loadIntro() {
  try {
    const response = await fetch("public/json/script.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const jsonData = await response.json();
    
    const UIData = jsonData.ui;
    document.querySelector("#navbar-title").textContent = UIData.navbar.title;
    document.querySelector("#navbar-resources a").textContent = UIData.navbar.resources;
    document.querySelector("#navbar-about a").textContent = UIData.navbar.about;
    document.querySelector("#navbar-lang a").textContent = UIData.navbar.language;
    
    const introStep = jsonData.script[0];
    const container = document.getElementById("intro-container");
    
    introStep.body.forEach(b => {
      const p = document.createElement("p");
      p.textContent = b.text;
      container.appendChild(p);
    });
    
    const startBtn = document.createElement("button");
    startBtn.textContent = introStep.buttons[0].text;
    startBtn.id = "start-btn";
    startBtn.addEventListener("click", () => {
      window.location.href = "experience.html";
    });
    container.appendChild(startBtn);
  } catch (error) {
    console.error("Failed to load intro:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadIntro);