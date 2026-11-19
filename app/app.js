// HEISTBOARD — GTA 6 trophy guide and tracker.
// Static, offline, no network at run time: the only fetches are the app's
// own data files (data/trophies.json, data/roadmap.json). Progress lives in
// localStorage and can be exported to a file and imported back.
const STORE_KEY = "heistboard-gta6-v1";
const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];
const GRADE_LABEL = { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" };
const KIND_LABEL = { story: "Story", collectibles: "Collectibles", activities: "Activities", online: "Online" };

let trophies = [];
let roadmap = null;
let earned = new Set();
let spoilersOn = false;
let selectedId = null;
let demoActive = false;

const $ = (id) => document.getElementById(id);
const byId = (id) => trophies.find((t) => t.id === id);
const params = new URLSearchParams(location.search);

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { earned: [], spoilers: false };
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.earned)) return { earned: [], spoilers: false };
    return { earned: data.earned.filter((n) => Number.isInteger(n)), spoilers: !!data.spoilers };
  } catch (e) { return { earned: [], spoilers: false }; }
}

function saveProgress() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      app: "heistboard-gta6-trophy-guide-01", version: 1,
      earned: [...earned].sort((a, b) => a - b), spoilers: spoilersOn, savedAt: new Date().toISOString(),
    }));
  } catch (e) { /* storage full or blocked: the board still works in memory */ }
}

function roadmapOrder() {
  const order = [];
  if (!roadmap) return trophies.map((t) => t.id);
  for (const stage of roadmap.stages) for (const id of stage.trophies) if (!order.includes(id)) order.push(id);
  for (const t of trophies) if (!order.includes(t.id)) order.push(t.id);
  return order;
}

// ?demo=all earns everything; ?demo=37 earns the first 37 in roadmap
// order. It is a demo switch for screenshots, and the page says so.
function seedDemoFromQuery() {
  const demo = params.get("demo");
  if (!demo) return;
  demoActive = true;
  if (demo === "all") { earned = new Set(trophies.map((t) => t.id)); return; }
  const n = parseInt(demo, 10);
  if (Number.isFinite(n) && n > 0) earned = new Set(roadmapOrder().slice(0, Math.min(n, 55)));
}

function isHidden(t) { return spoilersOn && t.kind === "story" && !earned.has(t.id); }
function displayName(t) { return isHidden(t) ? "CASE FILE #" + String(t.id).padStart(2, "0") : t.name; }
function displayDesc(t) { return isHidden(t) ? "CLASSIFIED — earn it to reveal." : t.description; }
function countLabel(t) { return t.count ? "PSN target: " + t.count.toLocaleString("en-US") : ""; }

function connectedEvidence(t) {
  const storyChain = [2, 3, 4, 5, 6, 7];
  const finales = [22, 23, 24, 26, 27];
  const money = [40, 52, 53, 54];
  const collect = [30, 31, 35, 42, 54, 55];
  let pool = [];
  if (storyChain.includes(t.id)) pool = storyChain;
  else if (finales.includes(t.id)) pool = finales;
  else if (money.includes(t.id)) pool = money;
  else if (collect.includes(t.id)) pool = collect;
  else if (t.id === 1) pool = [14, 7];
  else if (t.id === 14) pool = [1, 7, 48];
  else if (t.id === 33) pool = [34];
  else if (t.id === 34) pool = [33];
  else pool = trophies.filter((x) => x.kind === t.kind && x.id !== t.id).slice(0, 3).map((x) => x.id);
  return pool.filter((id) => id !== t.id).map(byId).filter(Boolean);
}

function updateProgress() {
  const n = earned.size;
  $("earnedCount").textContent = String(n);
  $("progressFill").style.width = (n / 55 * 100) + "%";
  $("progressBarWrap").setAttribute("aria-valuenow", String(n));
  $("progressNote").textContent = n === 55
    ? "CASE CLOSED — platinum earned. Every trophy on the wall is solved."
    : n === 0
      ? "Case open. 55 trophies still at large."
      : n + " solved, " + (55 - n) + " still at large. The string is tightening.";
  $("gradeCounts").innerHTML = GRADE_ORDER.map((g) => {
    const total = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return "<li><b>" + got + "/" + total + "</b> " + GRADE_LABEL[g] + "</li>";
  }).join("");
  $("demoLine").hidden = !demoActive;
}

function renderBoard() {
  const lanes = $("lanes");
  const query = ($("searchInput").value || "").trim().toLowerCase();
  const kind = $("kindFilter").value;
  const grade = $("gradeFilter").value;
  const earnedOnly = $("earnedOnly").checked;
  let shown = 0;
  lanes.innerHTML = "";
  for (const g of GRADE_ORDER) {
    const laneTrophies = trophies.filter((t) => t.grade === g).filter((t) => {
      if (grade !== "all" && t.grade !== grade) return false;
      if (kind === "online") return false;
      if (kind === "missable" && !t.missable) return false;
      if (kind !== "all" && kind !== "missable" && t.kind !== kind) return false;
      if (earnedOnly && !earned.has(t.id)) return false;
      if (query && !(t.name + " " + t.description + " " + t.guide).toLowerCase().includes(query)) return false;
      return true;
    });
    shown += laneTrophies.length;
    const lane = document.createElement("div");
    lane.className = "lane";
    const thread = g === "platinum" ? "THREAD: THE PRIZE — earn the other 54"
      : g === "gold" ? "THREAD: THE FINALE + 100% — the two golds close the case"
      : g === "silver" ? "THREAD: THE GRINDS — 250 stunts, 42 range golds, 100 WAiNK spots"
      : "THREAD: THE WALL — 46 bronze, story to street";
    const got = laneTrophies.filter((t) => earned.has(t.id)).length;
    lane.innerHTML = "<div class='lanehead'><h3>" + GRADE_LABEL[g] + " lane</h3>"
      + "<span class='thread'>" + thread + "</span>"
      + "<span class='lanecount'>" + got + " / " + laneTrophies.length + " solved in view</span></div>";
    const grid = document.createElement("div");
    grid.className = "cards";
    for (const t of laneTrophies) grid.appendChild(renderCard(t));
    if (!laneTrophies.length) grid.innerHTML = "<p class='empty'>Nothing pinned in this lane under the current filters.</p>";
    lane.appendChild(grid);
    lanes.appendChild(lane);
  }
  if (kind === "online") {
    const note = document.createElement("p");
    note.className = "empty";
    note.textContent = "The official list holds no online trophy — every one of the 55 is earned in the single-player game. The Online filter is here because the brief asked for it, and it is empty by design.";
    lanes.appendChild(note);
  }
  $("filterLine").textContent = "Showing " + shown + " of 55 trophies"
    + (query ? " matching “" + query + "”" : "") + (kind !== "all" ? " · " + KIND_LABEL[kind] + (kind === "missable" ? " only" : "") : "")
    + (grade !== "all" ? " · " + GRADE_LABEL[grade] : "") + (earnedOnly ? " · earned only" : "") + ".";
}

function renderCard(t) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card" + (earned.has(t.id) ? " earned" : "") + (isHidden(t) ? " redacted" : "") + (selectedId === t.id ? " selected" : "");
  btn.setAttribute("aria-pressed", earned.has(t.id) ? "true" : "false");
  btn.setAttribute("aria-label", displayName(t) + ", " + GRADE_LABEL[t.grade] + (earned.has(t.id) ? ", earned" : ""));
  let html = "<span class='cardgrade " + t.grade + "'>" + t.grade + "</span>"
    + "<span class='cardnum'>#" + String(t.id).padStart(2, "0") + "</span>"
    + "<span class='cardname'>" + escapeHtml(displayName(t)) + "</span>"
    + "<span class='carddesc'>" + escapeHtml(displayDesc(t)) + "</span>"
    + "<span class='cardflags'>" + (t.missable ? "<span class='flag'>MISSABLE</span>" : "")
    + (t.count ? "<span class='count'>" + countLabel(t) + "</span>" : "") + "</span>";
  btn.innerHTML = html;
  btn.addEventListener("click", () => selectTrophy(t.id));
  return btn;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function selectTrophy(id) {
  selectedId = id;
  renderBoard();
  renderDetail();
  $("detailPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderDetail() {
  const body = $("detailBody");
  const t = selectedId ? byId(selectedId) : null;
  if (!t) {
    // No trophy picked yet: show the next job, not a manual.
    const next = roadmapOrder().map(byId).find((x) => x && !earned.has(x.id));
    const counts = GRADE_ORDER.map((g) => {
      const total = trophies.filter((x) => x.grade === g).length;
      const got = trophies.filter((x) => x.grade === g && earned.has(x.id)).length;
      return got + "/" + total + " " + GRADE_LABEL[g];
    }).join(" · ");
    body.innerHTML = "<p class='detailhint'><b>Next up on the case:</b></p>"
      + (next
        ? "<h3>" + escapeHtml(next.name) + "</h3>"
          + "<p class='official'><span class='lbl'>OFFICIAL DESCRIPTION</span>" + escapeHtml(next.description) + "</p>"
          + "<p class='meta'>Grade: <b>" + GRADE_LABEL[next.grade] + "</b> &nbsp;·&nbsp; Kind: <b>" + KIND_LABEL[next.kind] + "</b>"
          + (next.missable ? " &nbsp;·&nbsp; <span class='missflag'>MISSABLE</span>" : "") + "</p>"
          + "<div class='actions'><button type='button' class='btn' id='openNextBtn'>Open its case file →</button></div>"
        : "<h3>Case closed.</h3><p class='detailhint'>Every trophy is solved — the platinum is yours.</p>")
      + "<p class='detailhint' style='margin-top:12px'>Progress: " + earned.size + "/55 solved — " + counts + ". Pick any Polaroid on the board to open its full case file, guide and sources.</p>";
    const openBtn = $("openNextBtn");
    if (openBtn && next) openBtn.addEventListener("click", () => selectTrophy(next.id));
    return;
  }
  const hidden = isHidden(t);
  const links = connectedEvidence(t);
  body.innerHTML =
    "<p class='cardnum'>CASE FILE #" + String(t.id).padStart(2, "0") + " &nbsp;·&nbsp; " + GRADE_LABEL[t.grade].toUpperCase() + "</p>"
    + "<h3>" + escapeHtml(displayName(t)) + "</h3>"
    + (t.missable ? "<span class='missflag'>⚠ MISSABLE — DO IT BEFORE THE STORY MOVES ON</span>" : "")
    + "<p class='official'><span class='lbl'>OFFICIAL DESCRIPTION — AS PLAYSTATION PUBLISHES IT</span>" + escapeHtml(displayDesc(t)) + "</p>"
    + "<p class='meta'>Grade: <b>" + GRADE_LABEL[t.grade] + "</b> &nbsp;·&nbsp; Kind: <b>" + KIND_LABEL[t.kind] + "</b>"
    + (t.count ? " &nbsp;·&nbsp; " + countLabel(t) : "") + " &nbsp;·&nbsp; " + (earned.has(t.id) ? "<b>Solved ✓</b>" : "Not yet earned") + "</p>"
    + (hidden
      ? "<p class='guide'>Spoiler guard is on, so this story trophy's guide stays sealed until you earn it — the guide names the mission it belongs to.</p>"
      : "<p class='sources'><span class='sourceslbl'>SOURCES — WHERE EACH FACT COMES FROM</span>" + escapeHtml(t.sources) + "</p>"
      + "<p class='guide'><span class='guidelbl'>OUR GUIDE — IN OUR OWN WORDS</span>" + escapeHtml(t.guide) + "</p>")
    + (links.length ? "<div class='threads'><h4>RED STRING — CONNECTED EVIDENCE</h4>"
      + links.map((x) => "<button type='button' class='threadlink' data-id='" + x.id + "'>#" + String(x.id).padStart(2, "0") + " — " + escapeHtml(displayName(x)) + " (" + GRADE_LABEL[x.grade] + ")</button>").join("") + "</div>" : "")
    + "<div class='actions'><button type='button' class='btn' id='toggleEarnedBtn'>" + (earned.has(t.id) ? "Mark as not earned" : "Mark as earned ✓") + "</button>"
    + "<button type='button' class='btn' id='prevBtn'>← Prev</button>"
    + "<button type='button' class='btn' id='nextBtn'>Next →</button></div>";
  body.querySelectorAll(".threadlink").forEach((b) => b.addEventListener("click", () => selectTrophy(parseInt(b.dataset.id, 10))));
  $("toggleEarnedBtn").addEventListener("click", () => {
    if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
    saveProgress(); updateProgress(); renderBoard(); renderDetail();
  });
  $("prevBtn").addEventListener("click", () => selectTrophy(t.id > 1 ? t.id - 1 : 55));
  $("nextBtn").addEventListener("click", () => selectTrophy(t.id < 55 ? t.id + 1 : 1));
}

function renderRoadmap() {
  if (!roadmap) return;
  $("roadmapIntro").textContent = roadmap.builtFrom;
  const wrap = $("roadmapStages");
  wrap.innerHTML = "";
  for (const stage of roadmap.stages) {
    const div = document.createElement("div");
    div.className = "stage";
    const items = stage.trophies.map((id) => {
      const t = byId(id);
      if (!t) return "";
      return "<li data-id='" + t.id + "' tabindex='0' title='Open its case file'>" + escapeHtml(t.name) + " <span class='g'>" + t.grade + (t.missable ? " · missable" : "") + "</span>" + (earned.has(id) ? " ✓" : "") + "</li>";
    }).join("");
    div.innerHTML = "<h3>Stage " + stage.stage + " — " + escapeHtml(stage.name) + "</h3>"
      + "<p class='order'>" + escapeHtml(stage.order) + "</p>"
      + "<p class='warn'>" + escapeHtml(stage.warning) + "</p><ul>" + items + "</ul>";
    div.querySelectorAll("li[data-id]").forEach((li) => {
      li.addEventListener("click", () => { setView("board"); selectTrophy(parseInt(li.dataset.id, 10)); });
      li.addEventListener("keydown", (e) => { if (e.key === "Enter") { setView("board"); selectTrophy(parseInt(li.dataset.id, 10)); } });
    });
    wrap.appendChild(div);
  }
}

function renderMissables() {
  if (!roadmap) return;
  $("missableRule").textContent = roadmap.missableRule;
  const wrap = $("missableList");
  wrap.innerHTML = "";
  for (const t of trophies.filter((x) => x.missable)) {
    const div = document.createElement("div");
    div.className = "missitem";
    div.innerHTML = "<span class='num'>#" + String(t.id).padStart(2, "0") + "</span><div>"
      + "<h3>" + escapeHtml(displayName(t)) + " <span class='flag'>MISSABLE</span>" + (earned.has(t.id) ? " ✓ solved" : "") + "</h3>"
      + "<p><b>Official:</b> " + escapeHtml(displayDesc(t)) + "</p>"
      + "<p><b>Guide:</b> " + escapeHtml(isHidden(t) ? "Sealed by the spoiler guard until earned." : t.guide) + "</p></div>";
    div.addEventListener("click", () => selectTrophy(t.id));
    wrap.appendChild(div);
  }
}

function setView(name) {
  for (const v of ["board", "roadmap", "missables"]) $("view-" + v).hidden = v !== name;
  document.querySelectorAll(".tab").forEach((b) => {
    const active = b.dataset.view === name;
    b.classList.toggle("active", active);
    b.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function exportProgress() {
  const data = { app: "heistboard-gta6-trophy-guide-01", version: 1, earned: [...earned].sort((a, b) => a - b), spoilers: spoilersOn, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "heistboard-progress.json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!data || !Array.isArray(data.earned)) throw new Error("bad file");
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(data.earned.filter((n) => valid.has(n)));
      if (typeof data.spoilers === "boolean") { spoilersOn = data.spoilers; $("spoilerToggle").checked = spoilersOn; }
      saveProgress(); updateProgress(); renderBoard(); renderDetail(); renderRoadmap(); renderMissables();
      $("filterLine").textContent = "Imported " + earned.size + " earned trophies from " + file.name + ".";
    } catch (e) {
      $("filterLine").textContent = "That file could not be imported — it is not a HEISTBOARD progress export.";
    }
  };
  reader.readAsText(file);
}

async function boot() {
  const [tRes, rRes] = await Promise.all([fetch("data/trophies.json"), fetch("data/roadmap.json")]);
  const tData = await tRes.json();
  trophies = tData.trophies;
  roadmap = await rRes.json();
  const saved = loadSaved();
  earned = new Set(saved.earned);
  spoilersOn = saved.spoilers;
  if (params.get("spoilers") === "on") spoilersOn = true;
  seedDemoFromQuery();
  if (demoActive) saveProgress();
  $("spoilerToggle").checked = spoilersOn;
  const select = parseInt(params.get("select") || "", 10);
  if (Number.isFinite(select) && byId(select)) selectedId = select;
  const view = params.get("view");
  if (view === "roadmap" || view === "missables") setView(view);
  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  $("searchInput").addEventListener("input", renderBoard);
  $("kindFilter").addEventListener("change", renderBoard);
  $("gradeFilter").addEventListener("change", renderBoard);
  $("earnedOnly").addEventListener("change", renderBoard);
  $("spoilerToggle").addEventListener("change", (e) => { spoilersOn = e.target.checked; saveProgress(); renderBoard(); renderDetail(); renderMissables(); });
  $("exportBtn").addEventListener("click", exportProgress);
  $("importFile").addEventListener("change", (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); e.target.value = ""; });
  $("resetBtn").addEventListener("click", () => {
    if (!confirm("Clear all HEISTBOARD progress in this browser?")) return;
    earned = new Set(); demoActive = false; saveProgress();
    updateProgress(); renderBoard(); renderDetail(); renderRoadmap(); renderMissables();
  });
  updateProgress(); renderBoard(); renderDetail(); renderRoadmap(); renderMissables();
}

boot();
