/**
 * MLIP Hub v2.0 - Community Knowledge Base & Uncertainty Quantification Toolkit
 * Full-stack implementation supporting:
 * - 4 Workspace Views: Catalog & Benchmarks, Uncertainty Hub, MACE Knowledge Graph, Contribute
 * - Omni-search Bar with Real-time Filtering & "Ask MLIP Agent" Query Assistant
 * - 6-Pillar Taxonomy Inspector Drawer
 * - Ammonia Out-of-Distribution UQ Benchmark Showcase
 * - Interactive MACE Mind Map Canvas
 * - Community Contribution Form with Live Preview & JSON Schema Export
 * - Shortlist Tray & Side-by-Side Comparison Modal
 */

document.addEventListener("DOMContentLoaded", () => {
  // Access global catalog loaded via data/catalog.js
  const catalog = window.MLIP_CATALOG;
  if (!catalog) {
    console.error("MLIP_CATALOG not loaded. Ensure data/catalog.js is present.");
    return;
  }

  // Application State
  const state = {
    currentWorkspace: "catalog", // "catalog" | "uq" | "knowledge" | "contribute"
    selectedDomainId: catalog.taxonomy.domains[0].id,
    selectedTaskId: catalog.taxonomy.domains[0].tasks[0].id,
    kgDomainId: catalog.taxonomy.domains[0].id,
    kgTaskId: catalog.taxonomy.domains[0].tasks[0].id,
    viewMode: "map", // "map" | "list"
    selectedCheckpointId: null,
    expandedNodes: new Set(),
    kgExpandedNodes: new Set(),
    shortlist: [], // Array of checkpoint IDs (max 3)
    searchFilter: ""
  };

  // DOM Elements Cache
  const dom = {
    // Navigation Tabs
    navCatalog: document.getElementById("navCatalog"),
    navUQ: document.getElementById("navUQ"),
    navKnowledge: document.getElementById("navKnowledge"),
    navContribute: document.getElementById("navContribute"),

    // Workspace View Panels
    catalogView: document.getElementById("catalogView"),
    uqView: document.getElementById("uqView"),
    knowledgeView: document.getElementById("knowledgeView"),
    contributeView: document.getElementById("contributeView"),

    // Omni-Search Bar & Agent
    globalSearch: document.getElementById("globalSearch"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    agentSearchBtn: document.getElementById("agentSearchBtn"),
    searchChips: document.getElementById("searchChips"),
    agentModal: document.getElementById("agentModal"),
    closeAgentModal: document.getElementById("closeAgentModal"),
    agentQueryText: document.getElementById("agentQueryText"),
    agentResponseBody: document.getElementById("agentResponseBody"),

    // Catalog View Controls
    domainSelect: document.getElementById("domainSelect"),
    taskSelect: document.getElementById("taskSelect"),
    viewMapBtn: document.getElementById("viewMapBtn"),
    viewListBtn: document.getElementById("viewListBtn"),
    mapViewContainer: document.getElementById("mapViewContainer"),
    listViewContainer: document.getElementById("listViewContainer"),
    graphSvg: document.getElementById("graphSvg"),
    tableBody: document.getElementById("tableBody"),
    currentDomainBadge: document.getElementById("currentDomainBadge"),
    currentTaskTitle: document.getElementById("currentTaskTitle"),
    currentTaskAnalogue: document.getElementById("currentTaskAnalogue"),
    candidateCount: document.getElementById("candidateCount"),
    resetZoomBtn: document.getElementById("resetZoomBtn"),
    expandAllBtn: document.getElementById("expandAllBtn"),

    // MACE Knowledge Graph Controls
    kgDomainSelect: document.getElementById("kgDomainSelect"),
    kgTaskSelect: document.getElementById("kgTaskSelect"),
    kgGraphSvg: document.getElementById("kgGraphSvg"),
    kgResetBtn: document.getElementById("kgResetBtn"),
    kgExpandAllBtn: document.getElementById("kgExpandAllBtn"),

    // Inspector Drawer Elements
    inspectorDrawer: document.getElementById("inspectorDrawer"),
    closeDrawerBtn: document.getElementById("closeDrawerBtn"),
    inspectName: document.getElementById("inspectName"),
    inspectFamily: document.getElementById("inspectFamily"),
    inspectStateBadge: document.getElementById("inspectStateBadge"),
    inspectStateText: document.getElementById("inspectStateText"),
    inspectShortlistBtn: document.getElementById("inspectShortlistBtn"),
    inspectShortlistBtnText: document.getElementById("inspectShortlistBtnText"),
    inspectDetailsContent: document.getElementById("inspectDetailsContent"),
    benchmarkVisualsContainer: document.getElementById("benchmarkVisualsContainer"),
    guidanceContainer: document.getElementById("guidanceContainer"),
    inspectCliCmd: document.getElementById("inspectCliCmd"),
    copyCliBtn: document.getElementById("copyCliBtn"),
    sourceLinksList: document.getElementById("sourceLinksList"),

    // Shortlist & Comparison
    shortlistToggleBtn: document.getElementById("shortlistToggleBtn"),
    shortlistBadge: document.getElementById("shortlistBadge"),
    shortlistTray: document.getElementById("shortlistTray"),
    closeShortlistBtn: document.getElementById("closeShortlistBtn"),
    shortlistCardsContainer: document.getElementById("shortlistCardsContainer"),
    compareShortlistBtn: document.getElementById("compareShortlistBtn"),
    exportShortlistBtn: document.getElementById("exportShortlistBtn"),
    comparisonModal: document.getElementById("comparisonModal"),
    closeCompModalBtn: document.getElementById("closeCompModalBtn"),
    comparisonTableWrapper: document.getElementById("comparisonTableWrapper"),

    // Terminology Guide Modal
    helpModal: document.getElementById("helpModal"),
    helpModalBtn: document.getElementById("helpModalBtn"),
    closeHelpModal: document.getElementById("closeHelpModal"),
    helpModalBody: document.getElementById("helpModalBody"),

    // Lightbox
    imageLightboxModal: document.getElementById("imageLightboxModal"),
    closeLightboxBtn: document.getElementById("closeLightboxBtn"),
    lightboxImg: document.getElementById("lightboxImg"),
    lightboxTitle: document.getElementById("lightboxTitle"),

    // Contribute View Elements
    exportJsonBtn: document.getElementById("exportJsonBtn"),
    previewCardBtn: document.getElementById("previewCardBtn"),
    resetFormBtn: document.getElementById("resetFormBtn"),
    previewCardContainer: document.getElementById("previewCardContainer"),
    jsonPreview: document.getElementById("jsonPreview"),
    jsonPreviewCode: document.getElementById("jsonPreviewCode"),
    copyJsonBtn: document.getElementById("copyJsonBtn"),
    cfSystemClass: document.getElementById("cfSystemClass"),
    cfFormula: document.getElementById("cfFormula"),
    cfNumAtoms: document.getElementById("cfNumAtoms"),
    cfPeriodicity: document.getElementById("cfPeriodicity"),
    cfSource: document.getElementById("cfSource"),
    cfElements: document.getElementById("cfElements"),
    cfRefCode: document.getElementById("cfRefCode"),
    cfFunctional: document.getElementById("cfFunctional"),
    cfSpaceGroupRow: document.getElementById("cfSpaceGroupRow"),
    cfSpaceGroup: document.getElementById("cfSpaceGroup"),
    cfChargeRow: document.getElementById("cfChargeRow"),
    cfCharge: document.getElementById("cfCharge"),
    cfModelFamily: document.getElementById("cfModelFamily"),
    cfCheckpointVersion: document.getElementById("cfCheckpointVersion"),
    cfReleaseTag: document.getElementById("cfReleaseTag"),
    cfRepoURL: document.getElementById("cfRepoURL"),
    cfLicense: document.getElementById("cfLicense"),
    cfOrigin: document.getElementById("cfOrigin"),
    cfEquivariance: document.getElementById("cfEquivariance"),
    cfForceConstruction: document.getElementById("cfForceConstruction"),
    cfCutoff: document.getElementById("cfCutoff"),
    cfParamCount: document.getElementById("cfParamCount"),
    cfTrainCount: document.getElementById("cfTrainCount"),
    cfTestCount: document.getElementById("cfTestCount"),
    cfSplitStrategy: document.getElementById("cfSplitStrategy"),
    cfDistRelation: document.getElementById("cfDistRelation"),
    cfTrainERange: document.getElementById("cfTrainERange"),
    cfTestERange: document.getElementById("cfTestERange"),
    cfDataDOI: document.getElementById("cfDataDOI"),
    cfEngine: document.getElementById("cfEngine"),
    cfWorkflow: document.getElementById("cfWorkflow"),
    cfHardware: document.getElementById("cfHardware"),
    cfLibVersions: document.getElementById("cfLibVersions"),
    cfTrainTime: document.getElementById("cfTrainTime"),
    cfInferTime: document.getElementById("cfInferTime"),
    cfEpochs: document.getElementById("cfEpochs"),
    cfSeeds: document.getElementById("cfSeeds"),
    cfPropertyLevel: document.getElementById("cfPropertyLevel"),
    cfTaskType: document.getElementById("cfTaskType"),
    cfPropertyDesc: document.getElementById("cfPropertyDesc"),
    cfCompTarget: document.getElementById("cfCompTarget"),
    cfRefMatch: document.getElementById("cfRefMatch"),
    cfEnergyMAE: document.getElementById("cfEnergyMAE"),
    cfForceMAE: document.getElementById("cfForceMAE"),
    cfUQMethod: document.getElementById("cfUQMethod"),
    cfForceECE: document.getElementById("cfForceECE"),
    cfSpearmanRho: document.getElementById("cfSpearmanRho"),
    cfEvidenceStatus: document.getElementById("cfEvidenceStatus"),
    cfContribName: document.getElementById("cfContribName"),
    cfGithub: document.getElementById("cfGithub"),
    cfAffiliation: document.getElementById("cfAffiliation"),
    cfContribRole: document.getElementById("cfContribRole")
  };

  // Helper Lookups
  function getCheckpoint(id) {
    return catalog.checkpoints.find((c) => c.id === id);
  }

  function getDomain(domainId) {
    return catalog.taxonomy.domains.find((d) => d.id === domainId);
  }

  function getTask(domainId, taskId) {
    const domain = getDomain(domainId);
    if (!domain) return null;
    return domain.tasks.find((t) => t.id === taskId);
  }

  function getRecommendationState(checkpoint, taskId) {
    if (checkpoint.id === "mace-mdp" && taskId !== "dipole_and_polarizability") {
      return {
        state: "Check before use",
        className: "warning",
        text: "Specialized Dipole Model: Not suitable for energy or atomic forces."
      };
    }
    const hasBenchmark = checkpoint.benchmarks && checkpoint.benchmarks.some((b) => b.evidenceLabel === "Benchmarked on");
    if (hasBenchmark) {
      return {
        state: "Candidate (with benchmark)",
        className: "candidate-bench",
        text: "Empirically benchmarked on task-relevant test sets."
      };
    }
    return {
      state: "Candidate",
      className: "candidate",
      text: "Supported architecture and element coverage; benchmark data not yet indexed."
    };
  }

  function getBadgeColor(className) {
    switch (className) {
      case "candidate-bench": return "var(--status-candidate-bench)";
      case "candidate": return "var(--status-candidate)";
      case "warning": return "var(--status-warning)";
      case "danger": return "var(--status-danger)";
      default: return "var(--status-missing)";
    }
  }

  // ==========================================================================
  // Workspace View Switching
  // ==========================================================================
  function switchWorkspace(viewName) {
    state.currentWorkspace = viewName;

    // Update Tab States
    [dom.navCatalog, dom.navUQ, dom.navKnowledge, dom.navContribute].forEach((btn) => {
      if (btn) {
        const isActive = btn.dataset.view === viewName;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      }
    });

    // Update Panels
    [dom.catalogView, dom.uqView, dom.knowledgeView, dom.contributeView].forEach((panel) => {
      if (panel) panel.classList.remove("active");
    });

    if (viewName === "catalog" && dom.catalogView) {
      dom.catalogView.classList.add("active");
      renderActiveCatalogSubView();
    } else if (viewName === "uq" && dom.uqView) {
      dom.uqView.classList.add("active");
    } else if (viewName === "knowledge" && dom.knowledgeView) {
      dom.knowledgeView.classList.add("active");
      renderKnowledgeGraph();
    } else if (viewName === "contribute" && dom.contributeView) {
      dom.contributeView.classList.add("active");
    }
    // Sync hash
    const targetHash = (viewName === "catalog") ? "#catalog" : "#view-" + viewName;
    if (window.location.hash !== targetHash && !(viewName === "catalog" && !window.location.hash)) {
      history.replaceState(null, "", targetHash);
    }
  }

  // ==========================================================================
  // Catalog View: Selectors & Sub-Views
  // ==========================================================================
  function initSelectors() {
    dom.domainSelect.innerHTML = "";
    catalog.taxonomy.domains.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.label;
      dom.domainSelect.appendChild(opt);
    });
    dom.domainSelect.value = state.selectedDomainId;

    updateTaskSelector();

    dom.domainSelect.addEventListener("change", (e) => {
      state.selectedDomainId = e.target.value;
      const domain = getDomain(state.selectedDomainId);
      if (domain && domain.tasks.length > 0) {
        state.selectedTaskId = domain.tasks[0].id;
      }
      updateTaskSelector();
      renderActiveCatalogSubView();
    });

    dom.taskSelect.addEventListener("change", (e) => {
      state.selectedTaskId = e.target.value;
      renderActiveCatalogSubView();
    });

    // KG Selectors
    if (dom.kgDomainSelect) {
      dom.kgDomainSelect.innerHTML = dom.domainSelect.innerHTML;
      dom.kgDomainSelect.value = state.kgDomainId;
      updateKgTaskSelector();

      dom.kgDomainSelect.addEventListener("change", (e) => {
        state.kgDomainId = e.target.value;
        const d = getDomain(state.kgDomainId);
        if (d && d.tasks.length > 0) state.kgTaskId = d.tasks[0].id;
        updateKgTaskSelector();
        renderKnowledgeGraph();
      });

      dom.kgTaskSelect.addEventListener("change", (e) => {
        state.kgTaskId = e.target.value;
        renderKnowledgeGraph();
      });
    }
  }

  function updateTaskSelector() {
    dom.taskSelect.innerHTML = "";
    const domain = getDomain(state.selectedDomainId);
    if (!domain) return;

    domain.tasks.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.label} (${t.dftAnalogue})`;
      dom.taskSelect.appendChild(opt);
    });
    dom.taskSelect.value = state.selectedTaskId;
  }

  function updateKgTaskSelector() {
    if (!dom.kgTaskSelect) return;
    dom.kgTaskSelect.innerHTML = "";
    const domain = getDomain(state.kgDomainId);
    if (!domain) return;

    domain.tasks.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.label} (${t.dftAnalogue})`;
      dom.kgTaskSelect.appendChild(opt);
    });
    dom.kgTaskSelect.value = state.kgTaskId;
  }

  function renderActiveCatalogSubView() {
    const domain = getDomain(state.selectedDomainId);
    const task = getTask(state.selectedDomainId, state.selectedTaskId);
    if (!domain || !task) return;

    // Update Context Bar
    dom.currentDomainBadge.textContent = domain.label;
    dom.currentTaskTitle.textContent = task.label;
    dom.currentTaskAnalogue.textContent = `DFT Analogue: ${task.dftAnalogue}`;

    const candidateIds = task.recommendedCheckpointIds || [];
    let checkpoints = candidateIds.map(getCheckpoint).filter(Boolean);

    // Apply Real-time search filter if present
    if (state.searchFilter.trim()) {
      const q = state.searchFilter.toLowerCase().trim();
      checkpoints = checkpoints.filter((cp) => {
        const text = `${cp.name} ${cp.family} ${cp.releaseVersion} ${cp.trainingData.levelOfTheory} ${cp.trainingData.functional} ${cp.elementsCovered.summary} ${cp.license}`.toLowerCase();
        return text.includes(q);
      });
    }

    dom.candidateCount.textContent = `${checkpoints.length} Candidate${checkpoints.length === 1 ? "" : "s"}`;

    if (state.viewMode === "map") {
      dom.mapViewContainer.classList.add("active");
      dom.listViewContainer.classList.remove("active");
      renderMindMap();
    } else {
      dom.mapViewContainer.classList.remove("active");
      dom.listViewContainer.classList.add("active");
      renderListView();
    }
  }

  // ==========================================================================
  // Graph Canvas Renderer (The Rabbit-Hole Mind Map Engine)
  // ==========================================================================
  function renderGraphCanvas(svg, domainId, taskId, expandedSet) {
    if (!svg) return;
    svg.innerHTML = "";

    const domain = getDomain(domainId);
    const task = getTask(domainId, taskId);
    if (!domain || !task) return;

    const candidateIds = task.recommendedCheckpointIds || [];
    let checkpoints = candidateIds.map(getCheckpoint).filter(Boolean);

    if (state.searchFilter.trim()) {
      const q = state.searchFilter.toLowerCase().trim();
      checkpoints = checkpoints.filter((cp) => {
        const text = `${cp.name} ${cp.family} ${cp.releaseVersion} ${cp.trainingData.levelOfTheory} ${cp.elementsCovered.summary}`.toLowerCase();
        return text.includes(q);
      });
    }

    if (checkpoints.length === 0) {
      svg.setAttribute("viewBox", "0 0 800 300");
      const emptyText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      emptyText.setAttribute("x", "400");
      emptyText.setAttribute("y", "150");
      emptyText.setAttribute("text-anchor", "middle");
      emptyText.setAttribute("fill", "var(--text-muted)");
      emptyText.setAttribute("font-size", "16");
      emptyText.textContent = "No checkpoints match the active filter or task selection.";
      svg.appendChild(emptyText);
      return;
    }

    const startX = 60;
    const rootY = 160 + (checkpoints.length * 50);
    const col2X = startX + 340;
    const col3X = col2X + 380;

    let svgHeight = Math.max(600, checkpoints.length * 300);
    let svgWidth = Math.max(1200, col3X + 420);
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute("width", `${svgWidth}`);
    svg.setAttribute("height", `${svgHeight}`);

    const gLinks = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const gNodes = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(gLinks);
    svg.appendChild(gNodes);

    // 1. Root Task Node
    const rootNode = {
      id: "root-task",
      x: startX,
      y: rootY,
      width: 260,
      height: 94,
      title: task.label,
      sub: `${domain.label} • Target Task`,
      badge: "ACTIVE TASK",
      badgeColor: "var(--accent-blue)"
    };
    renderNodeCard(gNodes, rootNode, "root");

    // 2. Candidate Checkpoint Nodes
    const spacingY = 240;
    const totalHeight = checkpoints.length * spacingY;
    const cpStartY = Math.max(40, rootY - (totalHeight / 2) + 60);

    checkpoints.forEach((cp, idx) => {
      const cpY = cpStartY + (idx * spacingY);
      const stateInfo = getRecommendationState(cp, task.id);
      const isExpanded = expandedSet.has(cp.id);
      const isSelected = state.selectedCheckpointId === cp.id;

      const cpNode = {
        id: cp.id,
        x: col2X,
        y: cpY,
        width: 320,
        height: 116,
        title: cp.name,
        sub: `${cp.trainingData.functional} • ${cp.trainingData.structureCount.toLocaleString()} configs`,
        extra: `License: ${cp.license} • ${cp.elementsCovered.count} elements`,
        badge: stateInfo.state,
        badgeColor: getBadgeColor(stateInfo.className),
        checkpoint: cp,
        hasChildren: true,
        isExpanded: isExpanded,
        isSelected: isSelected
      };

      drawCurve(gLinks, rootNode.x + rootNode.width, rootNode.y + rootNode.height / 2,
                cpNode.x, cpNode.y + cpNode.height / 2, isSelected);

      renderNodeCard(gNodes, cpNode, "checkpoint", () => {
        if (expandedSet.has(cp.id)) {
          expandedSet.delete(cp.id);
        } else {
          expandedSet.add(cp.id);
        }
        renderGraphCanvas(svg, domainId, taskId, expandedSet);
      });

      // 3. Child Burrowing Nodes
      if (isExpanded) {
        let childY = cpY - 50;

        // Child A: Training Data
        const trainNode = {
          id: `${cp.id}-train`,
          x: col3X,
          y: childY,
          width: 320,
          height: 82,
          title: `Trained on: ${cp.trainingData.datasetId}`,
          sub: `${cp.trainingData.levelOfTheory} (${cp.trainingData.code})`,
          badge: "TRAINING DATA",
          badgeColor: "var(--accent-cyan)",
          checkpointId: cp.id
        };
        drawCurve(gLinks, cpNode.x + cpNode.width, cpNode.y + cpNode.height / 2,
                  trainNode.x, trainNode.y + trainNode.height / 2, false);
        renderNodeCard(gNodes, trainNode, "evidence");

        // Child B: Benchmark
        childY += 96;
        const bench = cp.benchmarks && cp.benchmarks[0];
        const benchText = bench && bench.evidenceLabel === "Benchmarked on"
          ? `${bench.suite}: ${bench.metric} = ${bench.displayValue}`
          : "Not documented locally in benchmarks";

        const benchNode = {
          id: `${cp.id}-bench`,
          x: col3X,
          y: childY,
          width: 320,
          height: 82,
          title: bench ? bench.task : "Benchmark Status",
          sub: benchText,
          badge: bench ? bench.evidenceLabel.toUpperCase() : "NOT DOCUMENTED",
          badgeColor: bench && bench.evidenceLabel === "Benchmarked on" ? "var(--status-candidate-bench)" : "var(--status-missing)",
          checkpointId: cp.id
        };
        drawCurve(gLinks, cpNode.x + cpNode.width, cpNode.y + cpNode.height / 2,
                  benchNode.x, benchNode.y + benchNode.height / 2, false);
        renderNodeCard(gNodes, benchNode, "evidence");

        // Child C: Operational Guardrail
        childY += 96;
        const firstGuidance = cp.guidance && cp.guidance[0];
        const guardNode = {
          id: `${cp.id}-guard`,
          x: col3X,
          y: childY,
          width: 320,
          height: 82,
          title: firstGuidance ? `${firstGuidance.type}: ${firstGuidance.title}` : "Guardrails",
          sub: firstGuidance ? firstGuidance.statement : "Standard verification rules apply.",
          badge: "OPERATIONAL RULE",
          badgeColor: firstGuidance && firstGuidance.type === "DO_NOT" ? "var(--status-danger)" : "var(--status-candidate-bench)",
          checkpointId: cp.id
        };
        drawCurve(gLinks, cpNode.x + cpNode.width, cpNode.y + cpNode.height / 2,
                  guardNode.x, guardNode.y + guardNode.height / 2, false);
        renderNodeCard(gNodes, guardNode, "evidence");
      }
    });
  }

  function renderMindMap() {
    renderGraphCanvas(dom.graphSvg, state.selectedDomainId, state.selectedTaskId, state.expandedNodes);
  }

  function renderKnowledgeGraph() {
    renderGraphCanvas(dom.kgGraphSvg, state.kgDomainId, state.kgTaskId, state.kgExpandedNodes);
  }

  function drawCurve(g, x1, y1, x2, y2, isActive) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const dx = (x2 - x1) * 0.5;
    const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    path.setAttribute("d", d);
    path.setAttribute("class", `graph-link ${isActive ? "active" : ""}`);
    g.appendChild(path);
  }

  function renderNodeCard(g, node, type, toggleExpand) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", `graph-node-group ${node.isSelected ? "selected" : ""}`);
    group.setAttribute("transform", `translate(${node.x}, ${node.y})`);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", node.width);
    rect.setAttribute("height", node.height);
    rect.setAttribute("class", "node-card-rect");
    group.appendChild(rect);

    if (node.badge) {
      const badgeG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      badgeG.setAttribute("transform", `translate(12, 10)`);
      const badgeRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      badgeRect.setAttribute("width", Math.min(220, node.badge.length * 7 + 16));
      badgeRect.setAttribute("height", 18);
      badgeRect.setAttribute("fill", node.badgeColor || "var(--accent-blue)");
      badgeRect.setAttribute("class", "node-badge-rect");

      const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badgeText.setAttribute("x", (node.badge.length * 7 + 16) / 2);
      badgeText.setAttribute("y", 13);
      badgeText.setAttribute("class", "node-badge-text");
      badgeText.textContent = node.badge.length > 30 ? node.badge.substring(0, 28) + "…" : node.badge;

      badgeG.appendChild(badgeRect);
      badgeG.appendChild(badgeText);
      group.appendChild(badgeG);
    }

    const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
    title.setAttribute("x", 14);
    title.setAttribute("y", 46);
    title.setAttribute("class", "node-title-text");
    title.textContent = node.title;
    group.appendChild(title);

    if (node.sub) {
      const sub = document.createElementNS("http://www.w3.org/2000/svg", "text");
      sub.setAttribute("x", 14);
      sub.setAttribute("y", 70);
      sub.setAttribute("class", "node-sub-text");
      sub.textContent = node.sub.length > 44 ? node.sub.substring(0, 42) + "…" : node.sub;
      group.appendChild(sub);
    }

    if (node.extra) {
      const extra = document.createElementNS("http://www.w3.org/2000/svg", "text");
      extra.setAttribute("x", 14);
      extra.setAttribute("y", 92);
      extra.setAttribute("class", "node-sub-text");
      extra.setAttribute("fill", "var(--text-muted)");
      extra.textContent = node.extra;
      group.appendChild(extra);
    }

    if (node.hasChildren && toggleExpand) {
      const expBtn = document.createElementNS("http://www.w3.org/2000/svg", "g");
      expBtn.setAttribute("class", "node-expand-btn");
      expBtn.setAttribute("transform", `translate(${node.width - 26}, ${node.height / 2})`);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", 14);
      expBtn.appendChild(circle);

      const sign = document.createElementNS("http://www.w3.org/2000/svg", "text");
      sign.setAttribute("text-anchor", "middle");
      sign.setAttribute("y", 5);
      sign.textContent = node.isExpanded ? "−" : "+";
      expBtn.appendChild(sign);

      expBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleExpand();
      });
      group.appendChild(expBtn);
    }

    group.addEventListener("click", () => {
      const targetId = node.checkpoint ? node.checkpoint.id : node.checkpointId;
      if (targetId) openInspector(targetId);
    });

    g.appendChild(group);
  }

  // ==========================================================================
  // Table View Renderer
  // ==========================================================================
  function renderListView() {
    dom.tableBody.innerHTML = "";
    const task = getTask(state.selectedDomainId, state.selectedTaskId);
    if (!task) return;

    let candidateIds = task.recommendedCheckpointIds || [];
    let checkpoints = candidateIds.map(getCheckpoint).filter(Boolean);

    if (state.searchFilter.trim()) {
      const q = state.searchFilter.toLowerCase().trim();
      checkpoints = checkpoints.filter((cp) => {
        const text = `${cp.name} ${cp.family} ${cp.releaseVersion} ${cp.trainingData.levelOfTheory} ${cp.elementsCovered.summary}`.toLowerCase();
        return text.includes(q);
      });
    }

    if (checkpoints.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted)">No checkpoints match the active criteria.</td>`;
      dom.tableBody.appendChild(tr);
      return;
    }

    checkpoints.forEach((cp) => {
      const stateInfo = getRecommendationState(cp, task.id);
      const bench = cp.benchmarks && cp.benchmarks[0];
      const isShortlisted = state.shortlist.includes(cp.id);

      const tr = document.createElement("tr");
      tr.className = `table-row ${state.selectedCheckpointId === cp.id ? "selected" : ""}`;
      tr.innerHTML = `
        <td><span class="tbl-badge ${stateInfo.className}">${stateInfo.state}</span></td>
        <td class="tbl-cell-name"><strong>${cp.name}</strong></td>
        <td>${cp.family}</td>
        <td>${cp.trainingData.levelOfTheory} (${cp.trainingData.code})</td>
        <td>${cp.trainingData.datasetId}</td>
        <td>${cp.elementsCovered.summary}</td>
        <td><span class="badge-license">${cp.license}</span></td>
        <td>${bench ? `${bench.suite}: <strong>${bench.displayValue}</strong>` : `<span class="text-muted">Not documented</span>`}</td>
        <td class="tbl-actions">
          <button class="tbl-btn inspect-btn" data-id="${cp.id}">Inspect</button>
          <button class="tbl-btn shortlist-action-btn ${isShortlisted ? 'active' : ''}" data-id="${cp.id}">
            ${isShortlisted ? '✓ Saved' : '+ Shortlist'}
          </button>
        </td>
      `;

      tr.querySelector(".inspect-btn").addEventListener("click", () => openInspector(cp.id));
      tr.querySelector(".shortlist-action-btn").addEventListener("click", () => toggleShortlist(cp.id));

      dom.tableBody.appendChild(tr);
    });
  }

  // ==========================================================================
  // Inspector Drawer: 6-Pillar Details Breakdown
  // ==========================================================================
  function openInspector(checkpointId) {
    const cp = getCheckpoint(checkpointId);
    if (!cp) return;

    state.selectedCheckpointId = checkpointId;
    renderMindMap();
    if (dom.kgGraphSvg) renderKnowledgeGraph();

    const task = getTask(state.selectedDomainId, state.selectedTaskId) || { id: "general", label: "General" };
    const stateInfo = getRecommendationState(cp, task.id);

    // Header & Badge
    dom.inspectName.textContent = cp.name;
    dom.inspectFamily.textContent = `${cp.family} Foundation Potentials`;
    dom.inspectStateBadge.className = `status-badge ${stateInfo.className}`;
    dom.inspectStateText.textContent = stateInfo.text;
    updateInspectShortlistBtnState(cp.id);

    // 6-Pillar Rendering
    const p = cp.pillars || {};
    dom.inspectDetailsContent.innerHTML = `
      <!-- Pillar A: System -->
      <div class="pillar-section-card">
        <div class="pillar-section-header">
          <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line></svg> Pillar A: System</h4>
          <span class="tbl-badge candidate">${p.system ? p.system.system_class : cp.targetDomain}</span>
        </div>
        <div class="pillar-section-body">
          <div class="pillar-kv-row"><span class="pillar-kv-key">Composition / Formula:</span><span class="pillar-kv-val">${p.system ? p.system.identity.formula : cp.name}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Periodicity:</span><span class="pillar-kv-val">${p.system ? p.system.identity.periodicity : '3d'}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Reference Code & Functional:</span><span class="pillar-kv-val">${p.system ? p.system.reference_method.code + ' (' + p.system.reference_method.functional + ')' : cp.trainingData.functional}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Element Coverage:</span><span class="pillar-kv-val">${cp.elementsCovered.summary} (${cp.elementsCovered.count} elements)</span></div>
          ${p.system && p.system.material_specific ? `<div class="pillar-kv-row"><span class="pillar-kv-key">Space Group / Crystal:</span><span class="pillar-kv-val">${p.system.material_specific.space_group} (${p.system.material_specific.crystal_system})</span></div>` : ''}
          ${p.system && p.system.molecule_specific ? `<div class="pillar-kv-row"><span class="pillar-kv-key">Geometry / State:</span><span class="pillar-kv-val">${p.system.molecule_specific.geometry_label}</span></div>` : ''}
        </div>
      </div>

      <!-- Pillar B: Model -->
      <div class="pillar-section-card">
        <div class="pillar-section-header">
          <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle></svg> Pillar B: Model Architecture</h4>
          <span class="tbl-badge candidate">${cp.family}</span>
        </div>
        <div class="pillar-section-body">
          <div class="pillar-kv-row"><span class="pillar-kv-key">Checkpoint Version:</span><span class="pillar-kv-val">${cp.releaseVersion}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Origin:</span><span class="pillar-kv-val">${p.model ? p.model.origin : 'pre-trained'}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Symmetry / Equivariance:</span><span class="pillar-kv-val">${p.model ? p.model.architecture.symmetry_equivariance : 'Equivariant'}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Force Construction:</span><span class="pillar-kv-val">${p.model ? p.model.architecture.force_construction : 'Energy-derived (conservative)'}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">License & Commercial:</span><span class="pillar-kv-val">${cp.license} (${cp.commercialUseAllowed ? 'Allowed' : 'Academic only'})</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Cutoff Radius:</span><span class="pillar-kv-val">${p.model ? p.model.hyperparameters.cutoff_radius + ' Å' : '5.0 Å'}</span></div>
          ${p.model && p.model.interpretability_artifacts ? `<div class="pillar-kv-row"><span class="pillar-kv-key">Mechanistic Findings:</span><span class="pillar-kv-val">${p.model.interpretability_artifacts.mechanistic_findings}</span></div>` : ''}
        </div>
      </div>

      <!-- Pillar C: Data -->
      <div class="pillar-section-card">
        <div class="pillar-section-header">
          <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg> Pillar C: Training & Test Data</h4>
          <span class="tbl-badge candidate">${cp.trainingData.structureCount.toLocaleString()} structures</span>
        </div>
        <div class="pillar-section-body">
          <div class="pillar-kv-row"><span class="pillar-kv-key">Dataset:</span><span class="pillar-kv-val">${cp.trainingData.datasetName}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Level of Theory:</span><span class="pillar-kv-val">${cp.trainingData.levelOfTheory}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Distribution Shift:</span><span class="pillar-kv-val">${p.data ? p.data.distribution_relationship : 'Standard distribution'}</span></div>
          ${p.data && p.data.energy_force_ranges ? `<div class="pillar-kv-row"><span class="pillar-kv-key">Energy Extrapolation:</span><span class="pillar-kv-val">${p.data.energy_force_ranges.train_energy_range}</span></div>` : ''}
        </div>
      </div>

      <!-- Pillar D: Calculation -->
      <div class="pillar-section-card">
        <div class="pillar-section-header">
          <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg> Pillar D: Calculation (Provenance)</h4>
          <span class="tbl-badge candidate">${p.calculation ? p.calculation.engine : 'ASE Wrapper'}</span>
        </div>
        <div class="pillar-section-body">
          <div class="pillar-kv-row"><span class="pillar-kv-key">Workflow:</span><span class="pillar-kv-val">${p.calculation ? p.calculation.workflow : 'Evaluation & Relaxation'}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Hardware:</span><span class="pillar-kv-val">${p.calculation ? p.calculation.execution_record.hardware : 'NVIDIA A100 GPU'}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Execution Libraries:</span><span class="pillar-kv-val">${p.calculation ? p.calculation.execution_record.library_versions : 'PyTorch, ASE'}</span></div>
          ${p.calculation && p.calculation.execution_record.train_time_sec ? `<div class="pillar-kv-row"><span class="pillar-kv-key">Training Time:</span><span class="pillar-kv-val">${p.calculation.execution_record.train_time_sec}s</span></div>` : ''}
          ${p.calculation && p.calculation.execution_record.test_inference_sec ? `<div class="pillar-kv-row"><span class="pillar-kv-key">Inference Time:</span><span class="pillar-kv-val">${p.calculation.execution_record.test_inference_sec}s</span></div>` : ''}
        </div>
      </div>

      <!-- Pillar E: Property -->
      <div class="pillar-section-card">
        <div class="pillar-section-header">
          <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> Pillar E: Property or Task</h4>
          <span class="tbl-badge candidate">${p.property ? p.property.level : 'Level 0 (Direct)'}</span>
        </div>
        <div class="pillar-section-body">
          <div class="pillar-kv-row"><span class="pillar-kv-key">Task Type:</span><span class="pillar-kv-val">${p.property ? p.property.task_type : 'Prediction accuracy'}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Target Properties:</span><span class="pillar-kv-val">${p.property ? p.property.property_name : 'Energy, forces, stress'}</span></div>
          <div class="pillar-kv-row"><span class="pillar-kv-key">Description:</span><span class="pillar-kv-val">${p.property ? p.property.description : cp.designedFor}</span></div>
        </div>
      </div>

      <!-- Pillar F: Comparison & UQ -->
      <div class="pillar-section-card">
        <div class="pillar-section-header">
          <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path><path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4"></path></svg> Pillar F: Comparison &amp; UQ</h4>
          <span class="tbl-badge ${p.comparison && p.comparison.evidence_status.includes('reproduced') ? 'candidate-bench' : 'candidate'}">
            ${p.comparison ? p.comparison.evidence_status : 'Reported by authors'}
          </span>
        </div>
        <div class="pillar-section-body">
          <div class="pillar-kv-row"><span class="pillar-kv-key">UQ Method:</span><span class="pillar-kv-val">${p.comparison ? p.comparison.uq_method : 'None'}</span></div>
          ${p.comparison && p.comparison.accuracy_metrics ? `
            <div class="pillar-kv-row"><span class="pillar-kv-key">Energy MAE:</span><span class="pillar-kv-val">${p.comparison.accuracy_metrics.energy_mae}</span></div>
            <div class="pillar-kv-row"><span class="pillar-kv-key">Force MAE:</span><span class="pillar-kv-val">${p.comparison.accuracy_metrics.force_mae}</span></div>
          ` : ''}
          ${p.comparison && p.comparison.uq_metrics && p.comparison.uq_metrics.force_ece ? `
            <div class="pillar-kv-row"><span class="pillar-kv-key">Force ECE:</span><span class="pillar-kv-val">${p.comparison.uq_metrics.force_ece}</span></div>
            <div class="pillar-kv-row"><span class="pillar-kv-key">Spearman &rho;:</span><span class="pillar-kv-val">${p.comparison.uq_metrics.spearman_rho}</span></div>
          ` : ''}
          ${p.comparison && p.comparison.uq_cost ? `
            <div class="pillar-kv-row"><span class="pillar-kv-key">UQ Cost Profile:</span><span class="pillar-kv-val">${p.comparison.uq_cost}</span></div>
          ` : ''}
        </div>
      </div>
    `;

    // Visual Benchmarks
    dom.benchmarkVisualsContainer.innerHTML = "";
    if (cp.benchmarks && cp.benchmarks.length > 0) {
      cp.benchmarks.forEach((b) => {
        const bCard = document.createElement("div");
        bCard.className = "bench-card";
        let visualHtml = "";

        if (typeof b.value === "number") {
          let maxRef = b.suite === "Matbench Discovery" && b.task.includes("F1") ? 1.0 : (b.value * 1.5 || 1.0);
          let pct = Math.min(100, Math.max(10, (b.value / maxRef) * 100));

          visualHtml = `
            <div class="bar-chart-container">
              <div class="bar-row">
                <span class="bar-label">${cp.name}</span>
                <div class="bar-track">
                  <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="bar-num">${b.displayValue}</span>
              </div>
          `;
          if (b.contextBaseline) {
            let basePct = Math.min(100, Math.max(10, (b.contextBaseline.value / maxRef) * 100));
            visualHtml += `
              <div class="bar-row">
                <span class="bar-label" title="${b.contextBaseline.note}">${b.contextBaseline.model}</span>
                <div class="bar-track">
                  <div class="bar-fill context-baseline" style="width: ${basePct}%"></div>
                </div>
                <span class="bar-num">${b.contextBaseline.value}</span>
              </div>
            `;
          }
          visualHtml += `</div>`;
        }

        if (b.plotAsset) {
          visualHtml += `
            <div class="plot-thumbnail-container">
              <img src="${b.plotAsset}" alt="Parity Plot" class="plot-thumb" data-full="${b.plotAsset}" data-title="${cp.name} • Benchmark Parity Plot">
              <span class="plot-caption">Click to enlarge parity plot</span>
            </div>
          `;
        }

        bCard.innerHTML = `
          <div class="bench-card-header">
            <span class="bench-suite-label">${b.suite}</span>
            <span class="tbl-badge ${b.evidenceLabel === 'Benchmarked on' ? 'candidate-bench' : 'missing'}">${b.evidenceLabel}</span>
          </div>
          <div class="bench-task-label">${b.task}</div>
          <div class="bench-dataset-label">Dataset: ${b.dataset}</div>
          <div class="bench-metric-row">
            <span>${b.metric}:</span>
            <span class="bench-val">${b.displayValue}</span>
          </div>
          ${visualHtml}
        `;
        dom.benchmarkVisualsContainer.appendChild(bCard);
      });

      dom.benchmarkVisualsContainer.querySelectorAll(".plot-thumb").forEach((img) => {
        img.addEventListener("click", () => openLightbox(img.getAttribute("data-full"), img.getAttribute("data-title")));
      });
    } else {
      dom.benchmarkVisualsContainer.innerHTML = `<div class="empty-shortlist-msg">No benchmarks documented in local repository files.</div>`;
    }

    // Guidance Cards
    dom.guidanceContainer.innerHTML = "";
    if (cp.guidance && cp.guidance.length > 0) {
      cp.guidance.forEach((g) => {
        const gCard = document.createElement("div");
        gCard.className = `guidance-card ${g.type.toLowerCase()}`;
        gCard.innerHTML = `
          <div class="guidance-badge">${g.type === 'DO' ? '[DO] Recommended Practice' : '[DO NOT] Boundary Restriction'}</div>
          <div class="guidance-statement">${g.statement}</div>
          <div class="guidance-rationale"><strong>DFT Rationale:</strong> ${g.dftRationale}</div>
          <div class="guidance-source">Source: <a href="${g.source.url}" target="_blank" rel="noopener">${g.source.label}</a></div>
        `;
        dom.guidanceContainer.appendChild(gCard);
      });
    }

    // CLI Recipe
    if (cp.fineTuningGuidance && cp.fineTuningGuidance.supported) {
      dom.inspectCliCmd.textContent = cp.fineTuningGuidance.command;
    } else {
      dom.inspectCliCmd.textContent = "# Fine-tuning not documented or recommended for this checkpoint.";
    }

    // Sources
    dom.sourceLinksList.innerHTML = "";
    if (cp.sources) {
      cp.sources.forEach((s) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${s.url}" target="_blank" rel="noopener">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          ${s.label}
        </a>`;
        dom.sourceLinksList.appendChild(li);
      });
    }

    // Open Drawer
    dom.inspectorDrawer.classList.add("open");
    dom.inspectorDrawer.setAttribute("aria-hidden", "false");
  }

  function closeInspector() {
    dom.inspectorDrawer.classList.remove("open");
    dom.inspectorDrawer.setAttribute("aria-hidden", "true");
    state.selectedCheckpointId = null;
    renderMindMap();
    if (dom.kgGraphSvg) renderKnowledgeGraph();
  }

  // ==========================================================================
  // Shortlist Tray & Side-by-Side Comparison
  // ==========================================================================
  function updateInspectShortlistBtnState(checkpointId) {
    const isShortlisted = state.shortlist.includes(checkpointId);
    dom.inspectShortlistBtn.classList.toggle("active", isShortlisted);
    dom.inspectShortlistBtnText.textContent = isShortlisted ? "✓ Shortlisted" : "+ Add to Shortlist";
  }

  function toggleShortlist(checkpointId) {
    const idx = state.shortlist.indexOf(checkpointId);
    if (idx >= 0) {
      state.shortlist.splice(idx, 1);
    } else {
      if (state.shortlist.length >= 3) {
        alert("Shortlist limit reached (maximum 3 checkpoints for side-by-side comparison).");
        return;
      }
      state.shortlist.push(checkpointId);
    }
    updateShortlistUI();
    updateInspectShortlistBtnState(checkpointId);
    if (state.viewMode === "list") renderListView();
  }

  function updateShortlistUI() {
    dom.shortlistBadge.textContent = `${state.shortlist.length}/3`;
    dom.shortlistCardsContainer.innerHTML = "";

    if (state.shortlist.length === 0) {
      dom.shortlistCardsContainer.innerHTML = `<div class="empty-shortlist-msg">No checkpoints shortlisted yet. Click "+ Add to Shortlist" on any card or inspector drawer.</div>`;
      return;
    }

    state.shortlist.forEach((cid) => {
      const cp = getCheckpoint(cid);
      if (!cp) return;

      const card = document.createElement("div");
      card.className = "shortlist-card";
      card.innerHTML = `
        <div class="shortlist-card-header">
          <span class="shortlist-name">${cp.name}</span>
          <button class="remove-shortlist-btn" data-id="${cp.id}">&times;</button>
        </div>
        <div class="shortlist-meta">${cp.family} • ${cp.trainingData.functional}</div>
      `;
      card.querySelector(".remove-shortlist-btn").addEventListener("click", () => toggleShortlist(cp.id));
      dom.shortlistCardsContainer.appendChild(card);
    });
  }

  function openComparisonModal() {
    if (state.shortlist.length < 2) {
      alert("Please shortlist at least 2 checkpoints to perform a side-by-side comparison.");
      return;
    }

    const cps = state.shortlist.map(getCheckpoint).filter(Boolean);
    let tableHtml = `
      <table class="accessible-table comparison-matrix">
        <thead>
          <tr>
            <th>Pillar / Attribute</th>
            ${cps.map((c) => `<th><strong>${c.name}</strong><br><small class="text-muted">${c.family}</small></th>`).join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>A. System Class & Reference</strong></td>
            ${cps.map((c) => `<td>${c.pillars ? c.pillars.system.system_class : c.targetDomain}<br><small>${c.trainingData.functional} (${c.trainingData.code})</small></td>`).join("")}
          </tr>
          <tr>
            <td><strong>B. Equivariance & Architecture</strong></td>
            ${cps.map((c) => `<td>${c.pillars ? c.pillars.model.architecture.symmetry_equivariance : 'Equivariant'}<br><small>Cutoff: ${c.pillars ? c.pillars.model.hyperparameters.cutoff_radius : 5.0} Å</small></td>`).join("")}
          </tr>
          <tr>
            <td><strong>C. Training Structures</strong></td>
            ${cps.map((c) => `<td>${c.trainingData.structureCount.toLocaleString()} configs<br><small>${c.trainingData.datasetName}</small></td>`).join("")}
          </tr>
          <tr>
            <td><strong>D. Execution Engine</strong></td>
            ${cps.map((c) => `<td>${c.pillars ? c.pillars.calculation.engine : 'ASE Wrapper'}<br><small>${c.pillars ? c.pillars.calculation.execution_record.hardware : 'GPU'}</small></td>`).join("")}
          </tr>
          <tr>
            <td><strong>E. Property Level</strong></td>
            ${cps.map((c) => `<td>${c.pillars ? c.pillars.property.level : 'Level 0'}<br><small>${c.pillars ? c.pillars.property.task_type : 'Accuracy'}</small></td>`).join("")}
          </tr>
          <tr>
            <td><strong>F. UQ Method & Calibration</strong></td>
            ${cps.map((c) => `<td>${c.pillars ? c.pillars.comparison.uq_method : 'None'}<br><small>ECE: ${c.pillars && c.pillars.comparison.uq_metrics ? c.pillars.comparison.uq_metrics.force_ece : 'N/A'}</small></td>`).join("")}
          </tr>
          <tr>
            <td><strong>License & Commercial</strong></td>
            ${cps.map((c) => `<td><span class="badge-license">${c.license}</span><br><small>${c.commercialUseAllowed ? 'Commercial Allowed' : 'Academic Only'}</small></td>`).join("")}
          </tr>
        </tbody>
      </table>
    `;

    dom.comparisonTableWrapper.innerHTML = tableHtml;
    dom.comparisonModal.classList.add("open");
    dom.comparisonModal.setAttribute("aria-hidden", "false");
  }

  function exportShortlistMarkdown() {
    if (state.shortlist.length === 0) {
      alert("Your shortlist is empty. Add checkpoints before exporting.");
      return;
    }

    const cps = state.shortlist.map(getCheckpoint).filter(Boolean);
    let md = `# MLIP Hub Shortlist Report\n`;
    md += `*Generated: ${new Date().toISOString().split("T")[0]} via MLIP Hub (v2.0)*\n\n`;

    cps.forEach((c) => {
      md += `## ${c.name} (${c.family})\n`;
      md += `- **Release Version:** ${c.releaseVersion}\n`;
      md += `- **License:** ${c.license} (${c.commercialUseAllowed ? "Commercial Allowed" : "Academic Only"})\n`;
      md += `- **Theory & Functional:** ${c.trainingData.levelOfTheory} (${c.trainingData.functional})\n`;
      md += `- **Training Data:** ${c.trainingData.datasetName} (${c.trainingData.structureCount.toLocaleString()} structures)\n`;
      md += `- **Element Coverage:** ${c.elementsCovered.summary} (${c.elementsCovered.count} elements)\n`;
      if (c.pillars) {
        md += `- **UQ Method:** ${c.pillars.comparison.uq_method}\n`;
        md += `- **Evidence Status:** ${c.pillars.comparison.evidence_status}\n`;
      }
      md += `\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mlip-hub-shortlist.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ==========================================================================
  // Agent Assistant & Omni-Search
  // ==========================================================================
  const agentAnswers = {
    bulk_metal: {
      title: "Bulk Cubic Metal Stress Calculations",
      html: `
        <div class="agent-answer-card">
          <p><strong>Recommendation:</strong> For bulk cubic metal stress and elastic tensor calculations, the strongly recommended candidate is <strong>MACE-MP-0</strong> (or <strong>MACE-MPA-0</strong> if unrelaxed prototype exploration is needed).</p>
          <p style="margin-top:8px"><strong>Mechanistic &amp; Theoretical Grounding:</strong> MACE employs higher-order four-body equivariant message passing in SO(3). Because forces and virial stresses are derived analytically as the negative gradient of the total potential energy (&minus;&part;E/&part;r and virial theorem &sigma;<sub>&alpha;&beta;</sub>), stress symmetry and energy conservation are strictly guaranteed.</p>
        </div>
        <div class="agent-grid-two-col">
          <div class="agent-box-do">
            <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Recommended Practices (DO)</h4>
            <ul>
              <li>Fit elastic tensors using 6 independent strain deformations (order &plusmn;1% to &plusmn;2%) using quadratic strain-energy fits.</li>
              <li>Verify equilibrium lattice parameters against experimental zero-point vibrational corrections.</li>
            </ul>
          </div>
          <div class="agent-box-dont">
            <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Boundary Restrictions (DO NOT)</h4>
            <ul>
              <li>DO NOT use <code>MACE-MDP</code> (molecular dipole/polarizability potential) for crystal stress.</li>
              <li>DO NOT rely on non-conservative direct force models where virial stress is not energy-conserving.</li>
            </ul>
          </div>
        </div>
        <div class="agent-box-validation">
          <h4>What Still Needs Validation</h4>
          <p>Anharmonic phonon dispersion and thermal expansion at extreme temperatures (&gt;1200 K) require explicit MD sampling or temperature-dependent effective potentials.</p>
        </div>
        <div class="agent-citations-box">
          <h4>Citations &amp; Evidence</h4>
          <ul class="citation-list">
            <li>Batatia et al. (2022) <em>MACE: Higher Order Equivariant Message Passing Neural Networks</em>, NeurIPS.</li>
            <li>Materials Project MP-trj-2022.9 PBE Training Corpus (158,000 structures).</li>
            <li>Matbench Discovery Leaderboard (Unique Prototypes F1 = 0.58).</li>
          </ul>
        </div>
      `
    },
    blip_uq: {
      title: "BLIP vs. Deep Ensembles UQ Comparison",
      html: `
        <div class="agent-answer-card">
          <p><strong>Direct Comparison:</strong> On out-of-distribution ammonia geometries along the pyramidal inversion coordinate (extrapolating from 4.8 kcal/mol training data to 70 kcal/mol barrier configurations), our empirical benchmark yields:</p>
          <ul style="margin: 8px 0 8px 20px;">
            <li><strong>Calibration Quality:</strong> <strong>BLIP PaiNN</strong> achieves the lowest Expected Calibration Error (<strong>ECE = 0.169</strong> local / <strong>0.091</strong> paper), outperforming <strong>Deep Ensembles</strong> (ECE = 0.245 local / 0.108 paper). BLIP's input-dependent stochastic noise in message/update functions produces well-behaved Gaussian quantiles.</li>
            <li><strong>Rank Correlation &amp; Error:</strong> <strong>PaiNN + GMM</strong> latent density achieves the highest Spearman rank correlation (<strong>&rho; = 0.593</strong> local / <strong>0.904</strong> paper) between predicted uncertainty and squared error, while <strong>Deep Ensembles</strong> offer slightly lower Energy MAE (<strong>28.53</strong> vs 29.47 kcal/mol).</li>
            <li><strong>Inference Overhead:</strong> BLIP requires 100 Monte Carlo forward passes (~70x latency penalty, 75.5s), whereas Deep Ensembles require 3 forward passes (2.42s) and GMM adds &lt;1% overhead (1.05s).</li>
          </ul>
        </div>
        <div class="agent-grid-two-col">
          <div class="agent-box-do">
            <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Recommended Practices (DO)</h4>
            <ul>
              <li>Use <strong>BLIP</strong> when strict probabilistic calibration (accurate error bars for active learning selection) is essential.</li>
              <li>Use <strong>GMM</strong> or <strong>Deep Ensembles</strong> when inference speed is paramount in production MD trajectories.</li>
            </ul>
          </div>
          <div class="agent-box-dont">
            <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Boundary Restrictions (DO NOT)</h4>
            <ul>
              <li>DO NOT assume calibration on ammonia transfers to solid-state crystals or heterogeneous catalysis without re-tuning.</li>
              <li>DO NOT assume one UQ method wins across all metrics (Tan et al. 2023).</li>
            </ul>
          </div>
        </div>
        <div class="agent-box-validation">
          <h4>What Still Needs Validation</h4>
          <p>Scaling variational BNN formulations (BLIP) to equivariant higher-order body architectures (MACE) remains an open challenge not yet supported in official releases.</p>
        </div>
        <div class="agent-citations-box">
          <h4>Citations &amp; Evidence</h4>
          <ul class="citation-list">
            <li>Coscia, Farris et al. (2025) <em>BLIP: Bayesian Machine Learning Interatomic Potentials from Scratch</em>, arXiv:2508.14022.</li>
            <li>Tan et al. (2023) <em>Single-Model Uncertainty Quantification in Neural Network Potentials</em>, J. Chem. Phys. 158, 204111.</li>
            <li>Local Reduced Budget Reproduction Benchmark (6 Epochs, Laptop CPU), MLIP Hub results repository.</li>
          </ul>
        </div>
      `
    },
    pbe_bias: {
      title: "PBE Lattice Constant Bias & Experimental Drift",
      html: `
        <div class="agent-answer-card">
          <p><strong>DFT-Inheritance Explanation:</strong> MLIPs do not learn the "true" universe; they learn the potential energy surface of the reference quantum chemistry calculation. Standard Generalized Gradient Approximation (GGA-PBE) functionals systematically underbind condensed systems, yielding equilibrium lattice constants that are typically <strong>+1% to +2% larger</strong> than experimental room-temperature measurements.</p>
        </div>
        <div class="agent-grid-two-col">
          <div class="agent-box-do">
            <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Recommended Practices (DO)</h4>
            <ul>
              <li>For applications demanding high structural fidelity to experiment, use <strong>MACE-MATPES-r2SCAN-0</strong> (trained on meta-GGA r2SCAN with significantly reduced lattice bias).</li>
              <li>When comparing against experiment, subtract empirical zero-point vibrational expansions (~0.5–1.0%).</li>
            </ul>
          </div>
          <div class="agent-box-dont">
            <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Boundary Restrictions (DO NOT)</h4>
            <ul>
              <li>DO NOT directly compare formation energies between PBE-trained checkpoints (e.g. MACE-MP-0) and r2SCAN-trained checkpoints without chemical potential re-referencing.</li>
              <li>DO NOT treat DFT-MLIP residual discrepancy as model error when it is functional error.</li>
            </ul>
          </div>
        </div>
        <div class="agent-box-validation">
          <h4>What Still Needs Validation</h4>
          <p>Cross-functional fine-tuning stability when initializing from PBE weights and fine-tuning with limited r2SCAN or hybrid functional datasets.</p>
        </div>
        <div class="agent-citations-box">
          <h4>Citations &amp; Evidence</h4>
          <ul class="citation-list">
            <li>Perdew, Burke &amp; Ernzerhof (1996) <em>Generalized Gradient Approximation Made Simple</em>, Phys. Rev. Lett. 77, 3865.</li>
            <li>Furness et al. (2020) <em>An Accurately Constrained and Scaled Meta-GGA: r2SCAN</em>, J. Phys. Chem. Lett. 11, 8208.</li>
            <li>MACE-MATPES-r2SCAN-0 Model Documentation &amp; Matbench Discovery Benchmark.</li>
          </ul>
        </div>
      `
    }
  };

  function askAgent(query) {
    dom.agentQueryText.textContent = query;
    const qLower = query.toLowerCase();

    let ansHtml = "";
    if (qLower.includes("stress") || qLower.includes("metal") || qLower.includes("bulk")) {
      ansHtml = agentAnswers.bulk_metal.html;
    } else if (qLower.includes("blip") || qLower.includes("ensemble") || qLower.includes("uncertainty") || qLower.includes("ood")) {
      ansHtml = agentAnswers.blip_uq.html;
    } else if (qLower.includes("pbe") || qLower.includes("lattice") || qLower.includes("bias") || qLower.includes("overestimate")) {
      ansHtml = agentAnswers.pbe_bias.html;
    } else {
      // Free-text fallback search across catalog checkpoints
      const matched = catalog.checkpoints.filter((c) => {
        const text = `${c.name} ${c.family} ${c.designedFor} ${c.trainingData.levelOfTheory} ${c.trainingData.functional}`.toLowerCase();
        return qLower.split(" ").some((term) => term.length > 2 && text.includes(term));
      });

      ansHtml = `
        <div class="agent-answer-card">
          <p>Based on your inquiry <em>"${query}"</em>, our local knowledge base identified <strong>${matched.length}</strong> potentially relevant potential checkpoints:</p>
          <ul style="margin: 8px 0 8px 20px;">
            ${matched.slice(0, 4).map((m) => `<li><strong>${m.name}</strong> (${m.family}): Designed for ${m.designedFor}. Trained on ${m.trainingData.datasetName}.</li>`).join("")}
          </ul>
        </div>
        <div class="agent-grid-two-col">
          <div class="agent-box-do">
            <h4>Recommended Practice (DO)</h4>
            <p>Verify whether your target task requires Level 0 (energy/forces), Level 1 (elastic/EOS), or Level 2 (MD dynamics) properties before selecting a model.</p>
          </div>
          <div class="agent-box-dont">
            <h4>Boundary Restriction (DO NOT)</h4>
            <p>Do not extrapolate potentials to chemical elements outside their documented training coverage without active learning fine-tuning.</p>
          </div>
        </div>
      `;
    }

    dom.agentResponseBody.innerHTML = ansHtml;
    dom.agentModal.classList.add("open");
    dom.agentModal.setAttribute("aria-hidden", "false");
  }

  // Bind Search Input & Buttons
  dom.globalSearch.addEventListener("input", (e) => {
    state.searchFilter = e.target.value;
    dom.clearSearchBtn.style.display = state.searchFilter ? "block" : "none";
    if (state.currentWorkspace === "catalog") renderActiveCatalogSubView();
    if (state.currentWorkspace === "knowledge") renderKnowledgeGraph();
  });

  dom.clearSearchBtn.addEventListener("click", () => {
    state.searchFilter = "";
    dom.globalSearch.value = "";
    dom.clearSearchBtn.style.display = "none";
    if (state.currentWorkspace === "catalog") renderActiveCatalogSubView();
    if (state.currentWorkspace === "knowledge") renderKnowledgeGraph();
  });

  dom.globalSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && dom.globalSearch.value.trim()) {
      askAgent(dom.globalSearch.value.trim());
    }
  });

  dom.agentSearchBtn.addEventListener("click", () => {
    const q = dom.globalSearch.value.trim() || "Which model is suitable for bulk cubic metal stress calculations?";
    askAgent(q);
  });

  // Prompt chips
  dom.searchChips.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const q = chip.dataset.query;
      dom.globalSearch.value = q;
      state.searchFilter = q;
      dom.clearSearchBtn.style.display = "block";
      askAgent(q);
    });
  });

  dom.closeAgentModal.addEventListener("click", () => {
    dom.agentModal.classList.remove("open");
    dom.agentModal.setAttribute("aria-hidden", "true");
  });

  // ==========================================================================
  // Contribute View Form Handling & Live Preview
  // ==========================================================================
  // Tab switching
  document.querySelectorAll(".pillar-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".pillar-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".pillar-content").forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      const targetPillar = tab.dataset.pillar;
      const targetContent = document.querySelector(`.pillar-content[data-pillar="${targetPillar}"]`);
      if (targetContent) targetContent.classList.add("active");
    });
  });

  // Dynamic system class visibility
  if (dom.cfSystemClass) {
    dom.cfSystemClass.addEventListener("change", (e) => {
      const val = e.target.value;
      if (dom.cfSpaceGroupRow) dom.cfSpaceGroupRow.style.display = (val === "periodic_crystal") ? "flex" : "none";
      if (dom.cfChargeRow) dom.cfChargeRow.style.display = (val === "molecule") ? "flex" : "none";
    });
  }

  function getContributeFormData() {
    return {
      pillarA_system: {
        system_class: dom.cfSystemClass.value,
        identity: {
          formula: dom.cfFormula.value || "Custom Composition",
          num_atoms: parseInt(dom.cfNumAtoms.value, 10) || 1,
          periodicity: dom.cfPeriodicity.value,
          source: dom.cfSource.value || "Contributor Provided"
        },
        elements: dom.cfElements.value.split(",").map((s) => s.trim()).filter(Boolean),
        reference_method: {
          code: dom.cfRefCode.value || "VASP",
          functional: dom.cfFunctional.value || "PBE"
        }
      },
      pillarB_model: {
        family: dom.cfModelFamily.value,
        checkpoint_version: dom.cfCheckpointVersion.value || "v1.0",
        release_tag: dom.cfReleaseTag.value || "v1.0.0",
        repo_url: dom.cfRepoURL.value || "",
        license: dom.cfLicense.value,
        origin: dom.cfOrigin.value,
        architecture: {
          symmetry_equivariance: dom.cfEquivariance.value,
          force_construction: dom.cfForceConstruction.value
        },
        hyperparameters: {
          cutoff_radius: parseFloat(dom.cfCutoff.value) || 5.0,
          parameter_count: dom.cfParamCount.value || "1.0M"
        }
      },
      pillarC_data: {
        split_definition: {
          train_count: parseInt(dom.cfTrainCount.value, 10) || 100,
          test_count: parseInt(dom.cfTestCount.value, 10) || 50,
          split_strategy: dom.cfSplitStrategy.value
        },
        distribution_relationship: dom.cfDistRelation.value,
        energy_ranges: {
          train: dom.cfTrainERange.value || "0.0 kcal/mol",
          test: dom.cfTestERange.value || "0.0 kcal/mol"
        },
        doi: dom.cfDataDOI.value || ""
      },
      pillarD_calculation: {
        engine: dom.cfEngine.value,
        workflow: dom.cfWorkflow.value,
        execution_record: {
          hardware: dom.cfHardware.value || "CPU",
          libraries: dom.cfLibVersions.value || "PyTorch",
          train_time: dom.cfTrainTime.value || "N/A",
          inference_latency: dom.cfInferTime.value || "N/A"
        }
      },
      pillarE_property: {
        level: dom.cfPropertyLevel.value,
        task_type: dom.cfTaskType.value,
        description: dom.cfPropertyDesc.value || "Model property evaluation."
      },
      pillarF_comparison: {
        target: dom.cfCompTarget.value,
        reference_match: dom.cfRefMatch.value,
        metrics: {
          energy_mae: dom.cfEnergyMAE.value || "N/A",
          force_mae: dom.cfForceMAE.value || "N/A"
        },
        uq: {
          method: dom.cfUQMethod.value,
          force_ece: dom.cfForceECE.value || "N/A",
          spearman_rho: dom.cfSpearmanRho.value || "N/A"
        },
        evidence_status: dom.cfEvidenceStatus.value
      },
      contributor_metadata: {
        name: dom.cfContribName.value || "Anonymous Researcher",
        github: dom.cfGithub.value || "",
        affiliation: dom.cfAffiliation.value || "",
        role: dom.cfContribRole.value
      }
    };
  }

  function updateLivePreview() {
    const data = getContributeFormData();
    dom.previewCardContainer.innerHTML = `
      <div class="preview-card-rendered">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span class="tbl-badge candidate">${data.pillarB_model.family}</span>
          <span class="badge-license">${data.pillarB_model.license}</span>
        </div>
        <h3 style="margin:0 0 6px 0;font-size:1.1rem;color:#ffffff">${data.pillarB_model.checkpoint_version}</h3>
        <p style="margin:0 0 10px 0;font-size:0.85rem;color:var(--text-secondary)">
          ${data.pillarA_system.identity.formula} • ${data.pillarA_system.system_class} • ${data.pillarA_system.reference_method.functional}
        </p>
        <div style="font-size:0.8rem;background:rgba(0,0,0,0.2);padding:10px;border-radius:6px;line-height:1.5">
          <div><strong>Task Level:</strong> ${data.pillarE_property.level} (${data.pillarE_property.task_type})</div>
          <div><strong>UQ Method:</strong> ${data.pillarF_comparison.uq.method} (ECE: ${data.pillarF_comparison.uq.force_ece})</div>
          <div><strong>Evidence Status:</strong> <span class="tbl-badge candidate-bench">${data.pillarF_comparison.evidence_status}</span></div>
          <div style="margin-top:6px;color:var(--accent-gold)"><strong>Contributor:</strong> ${data.contributor_metadata.name} (${data.contributor_metadata.role})</div>
        </div>
      </div>
    `;
  }

  if (dom.previewCardBtn) {
    dom.previewCardBtn.addEventListener("click", updateLivePreview);
  }

  if (dom.exportJsonBtn) {
    dom.exportJsonBtn.addEventListener("click", () => {
      const data = getContributeFormData();
      const jsonStr = JSON.stringify(data, null, 2);
      dom.jsonPreviewCode.textContent = jsonStr;
      dom.jsonPreview.style.display = "block";
      updateLivePreview();
    });
  }

  if (dom.copyJsonBtn) {
    dom.copyJsonBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(dom.jsonPreviewCode.textContent).then(() => {
        const orig = dom.copyJsonBtn.textContent;
        dom.copyJsonBtn.textContent = "✓ Copied!";
        setTimeout(() => { dom.copyJsonBtn.textContent = orig; }, 2000);
      });
    });
  }

  if (dom.resetFormBtn) {
    dom.resetFormBtn.addEventListener("click", () => {
      document.querySelectorAll(".form-input, .form-textarea").forEach((i) => { i.value = ""; });
      dom.previewCardContainer.innerHTML = `<p class="preview-empty">Fill out the form to see a live preview.</p>`;
      dom.jsonPreview.style.display = "none";
    });
  }

  // ==========================================================================
  // Lightbox & Terminology Guide Modals
  // ==========================================================================
  function openLightbox(src, title) {
    dom.lightboxImg.src = src;
    dom.lightboxTitle.textContent = title;
    dom.imageLightboxModal.classList.add("open");
    dom.imageLightboxModal.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    dom.imageLightboxModal.classList.remove("open");
    dom.imageLightboxModal.setAttribute("aria-hidden", "true");
    dom.lightboxImg.src = "";
  }

  dom.closeLightboxBtn.addEventListener("click", closeLightbox);
  dom.imageLightboxModal.addEventListener("click", (e) => {
    if (e.target === dom.imageLightboxModal) closeLightbox();
  });

  // Help Modal (Terminology Guide)
  dom.helpModalBtn.addEventListener("click", () => {
    dom.helpModalBody.innerHTML = `
      <div class="terminology-section">
        <h4>1. Property Levels (L0–L3)</h4>
        <p><strong>Level 0 (Direct):</strong> Quantities evaluated natively in a single forward pass: total potential energy E, atomic forces &minus;&part;E/&part;r, and virial stress &sigma;<sub>&alpha;&beta;</sub>.</p>
        <p><strong>Level 1 (Static Derived):</strong> Properties obtained by fitting energy or stress curves: elastic stiffness tensor C<sub>ij</sub>, bulk/shear modulus, formation energy, and equation of state (EOS).</p>
        <p><strong>Level 2 (Dynamic Sampling):</strong> Quantities requiring trajectory time integration: melting temperature, ionic conductivity, phonon lifetimes, and simulation stability.</p>
        <p><strong>Level 3 (Non-MLIP Native):</strong> Electronic properties outside standard PES: band structures, density of states (DOS), and charge density.</p>

        <h4 style="margin-top:16px">2. Uncertainty Quantification (UQ) Metrics</h4>
        <p><strong>Expected Calibration Error (ECE):</strong> Measures whether the model's confidence intervals match empirical reality. If a potential predicts a 95% confidence interval, exactly 95% of true DFT force components should fall inside it. Lower ECE is better.</p>
        <p><strong>Spearman Rank Correlation (&rho;):</strong> The rank correlation between predicted variance &sigma;&sup2; and true squared force error. High &rho; (&gt;0.5) ensures that when error spikes, the uncertainty signal reliably triggers active learning re-calculation.</p>

        <h4 style="margin-top:16px">3. Out-of-Distribution (OOD) Energy Extrapolation</h4>
        <p>Occurs when test structures inhabit high-energy, deformed states never seen during training (e.g. ammonia inversion transition states up to 70 kcal/mol when trained on 0–4.8 kcal/mol). Uncalibrated potentials silently fail in these regimes.</p>
      </div>
    `;
    dom.helpModal.classList.add("open");
    dom.helpModal.setAttribute("aria-hidden", "false");
  });

  dom.closeHelpModal.addEventListener("click", () => {
    dom.helpModal.classList.remove("open");
    dom.helpModal.setAttribute("aria-hidden", "true");
  });

  // Shortlist Tray Triggers
  dom.shortlistToggleBtn.addEventListener("click", () => {
    dom.shortlistTray.classList.toggle("open");
    dom.shortlistTray.setAttribute("aria-hidden", dom.shortlistTray.classList.contains("open") ? "false" : "true");
  });

  dom.closeShortlistBtn.addEventListener("click", () => {
    dom.shortlistTray.classList.remove("open");
    dom.shortlistTray.setAttribute("aria-hidden", "true");
  });

  dom.compareShortlistBtn.addEventListener("click", openComparisonModal);
  dom.closeCompModalBtn.addEventListener("click", () => {
    dom.comparisonModal.classList.remove("open");
    dom.comparisonModal.setAttribute("aria-hidden", "true");
  });

  dom.exportShortlistBtn.addEventListener("click", exportShortlistMarkdown);

  // Inspector Drawer Triggers
  dom.closeDrawerBtn.addEventListener("click", closeInspector);
  dom.inspectShortlistBtn.addEventListener("click", () => {
    if (state.selectedCheckpointId) toggleShortlist(state.selectedCheckpointId);
  });

  dom.copyCliBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(dom.inspectCliCmd.textContent).then(() => {
      const orig = dom.copyCliBtn.textContent;
      dom.copyCliBtn.textContent = "Copied!";
      setTimeout(() => { dom.copyCliBtn.textContent = orig; }, 1500);
    });
  });

  // Top Nav Tab Clicks
  dom.navCatalog.addEventListener("click", () => switchWorkspace("catalog"));
  dom.navUQ.addEventListener("click", () => switchWorkspace("uq"));
  dom.navKnowledge.addEventListener("click", () => switchWorkspace("knowledge"));
  dom.navContribute.addEventListener("click", () => switchWorkspace("contribute"));

  // View Mode Toggles (Map vs List)
  dom.viewMapBtn.addEventListener("click", () => {
    state.viewMode = "map";
    dom.viewMapBtn.classList.add("active");
    dom.viewMapBtn.setAttribute("aria-pressed", "true");
    dom.viewListBtn.classList.remove("active");
    dom.viewListBtn.setAttribute("aria-pressed", "false");
    renderActiveCatalogSubView();
  });

  dom.viewListBtn.addEventListener("click", () => {
    state.viewMode = "list";
    dom.viewListBtn.classList.add("active");
    dom.viewListBtn.setAttribute("aria-pressed", "true");
    dom.viewMapBtn.classList.remove("active");
    dom.viewMapBtn.setAttribute("aria-pressed", "false");
    renderActiveCatalogSubView();
  });

  // Zoom & Expand Buttons
  dom.resetZoomBtn.addEventListener("click", () => {
    state.expandedNodes.clear();
    renderMindMap();
  });

  dom.expandAllBtn.addEventListener("click", () => {
    const task = getTask(state.selectedDomainId, state.selectedTaskId);
    if (task && task.recommendedCheckpointIds) {
      task.recommendedCheckpointIds.forEach((id) => state.expandedNodes.add(id));
      renderMindMap();
    }
  });

  if (dom.kgResetBtn) {
    dom.kgResetBtn.addEventListener("click", () => {
      state.kgExpandedNodes.clear();
      renderKnowledgeGraph();
    });
  }

  if (dom.kgExpandAllBtn) {
    dom.kgExpandAllBtn.addEventListener("click", () => {
      const task = getTask(state.kgDomainId, state.kgTaskId);
      if (task && task.recommendedCheckpointIds) {
        task.recommendedCheckpointIds.forEach((id) => state.kgExpandedNodes.add(id));
        renderKnowledgeGraph();
      }
    });
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================
  initSelectors();
  renderActiveCatalogSubView();
  updateShortlistUI();
  updateLivePreview();

  // Real-time live preview as contributor types
  const formPanel = document.querySelector(".contribute-form-panel");
  if (formPanel) {
    formPanel.addEventListener("input", updateLivePreview);
    formPanel.addEventListener("change", updateLivePreview);
  }
  console.log("MLIP Hub v2.0 initialized successfully with 6-pillar taxonomy and UQ benchmark suite.");
});
