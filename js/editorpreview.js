const htmlEditor = document.getElementById('html-editor');
const cssEditor = document.getElementById('css-editor');
const jsEditor = document.getElementById('js-editor');
const livePreview = document.getElementById('live-preview');
function buildSrcDoc() {
    const cacheBuster = Date.now();
    const css = cssEditor?.value ?? '';
    const html = htmlEditor?.value ?? '';
    const js = jsEditor?.value ?? '';
    const faLinkEl = window.parent?.document?.getElementById('fa-css');
    const faHref = faLinkEl?.href ? `<link id="fa-css" rel="stylesheet" href="${faLinkEl.href}">` : '';
    const jq = window.$jqlibraryURL ? `<script src="${window.$jqlibraryURL}?v=${cacheBuster}" defer></script>` : '';
    const INIT_CODE = `
            window.componentFunctionMap = window.componentFunctionMap || {
            '.vincuzslider': {
                func: 'CustomAppSlider',
                funccommon: 'attachResize',
                event:'$(".cuz__slider").each(function () { CustomAppSlider($(this)); });'
            }
            };

            function getPickerCode(selector) {
                const picker = window.componentFunctionMap[selector];
                if (!picker) return '';
                let code = '';
                if (picker.func1) code += "func1: '" + picker.func1 + "', ";
                if (picker.func)  code += "func: '" + picker.func + "', ";
                if (picker.event) code += "event: '" + picker.event + "'";
                return code;
            }
            function highlightCopiedState(openContainer, pre) {
                const activeTab = openContainer.querySelector('.tab-btn.active');
                if (!activeTab) return;
                const originalTabHTML = activeTab.innerHTML;
                const originalTabBg = activeTab.style.background;
                const originalTabColor = activeTab.style.color;
                const originalPreBg = pre.style.background;
                activeTab.innerHTML = '<i class="fa fa-check" style="color:#fff;"></i> Copied!';
                activeTab.style.background = '#28a745';
                activeTab.style.color = '#fff';
                setTimeout(() => {
                    activeTab.innerHTML = originalTabHTML;
                    activeTab.style.background = originalTabBg;
                    activeTab.style.color = originalTabColor;
                    pre.style.background = originalPreBg;
                }, 1500);
            }
            window.getFunctionText = window.getFunctionText || function(jsCode, funcName) {
                const start = jsCode.indexOf('function ' + funcName + '(');
                if (start === -1) return '';
                let i = start, braces = 0, inStr = false, chStr = '', esc = false;
                for (; i < jsCode.length; i++) {
                    const c = jsCode[i];
                    if (esc) { esc = false; continue; }
                    if (inStr) {
                    if (c === '\\\\') esc = true;
                    else if (c === chStr) inStr = false;
                    } else {
                    if (c === '"' || c === "'" || c === '\`') { inStr = true; chStr = c; }
                    else if (c === '{') braces++;
                    else if (c === '}') { braces--; if (braces === 0) return jsCode.substring(start, i + 1); }
                    }
                }
                return '';
            };
            document.addEventListener('click', function (e) {
                const target = e.target.closest('[data-target]');
                const allContainers = document.querySelectorAll('.view-code-container');
                const allViewCodeBtns = document.querySelectorAll('.view-code-btn');
                if (
                    !target &&
                    !e.target.closest('.view-code-container') &&
                    !e.target.closest('.editors') &&
                    !e.target.closest('#html-editor') &&
                    !e.target.closest('#css-editor') &&
                    !e.target.closest('#js-editor')
                ) {
                    allContainers.forEach(c => {
                        if (c.classList.contains('show')) {
                            c.classList.remove('show');
                            c.addEventListener('transitionend', function handler(ev) {
                                if (ev.propertyName === 'transform') {
                                    c.style.display = 'none';
                                    c.removeEventListener('transitionend', handler);
                                }
                            });
                        }
                    });
                    allViewCodeBtns.forEach(btn => btn.setAttribute('data-tooltip', 'Get Code'));
                    return;
                }
                if (target) {
                    const selector = target.getAttribute('data-target');
                    const container = target.closest('.input__col');
                    if (!container) return;
                    const codeDivClass = 'view-code-container';
                    let codeContainer = container.querySelector('.' + codeDivClass);
                    allContainers.forEach(c => {
                        if (c !== codeContainer && c.classList.contains('show')) {
                            c.classList.remove('show');
                            c.addEventListener('transitionend', function handler(ev) {
                                if (ev.propertyName === 'transform') {
                                    c.style.display = 'none';
                                    c.removeEventListener('transitionend', handler);
                                }
                            });
                        }
                    });
                    if (!codeContainer) {
                        codeContainer = document.createElement('div');
                        codeContainer.className = codeDivClass;
                        codeContainer.style.display = 'block';
                        const tabs = document.createElement('div');
                        tabs.className = 'code-tabs';
                        tabs.style.display = 'flex';
                        tabs.style.borderBottom = '1px solid #ccc';
                        tabs.style.marginBottom = '5px';
                        tabs.style.position = 'relative';
                        const htmlTab = document.createElement('button');
                        htmlTab.textContent = 'HTML';
                        htmlTab.className = 'tab-btn active';
                        const cssTab = document.createElement('button');
                        cssTab.textContent = 'CSS';
                        cssTab.className = 'tab-btn';
                        const jsTab = document.createElement('button');
                        jsTab.textContent = 'JS';
                        jsTab.className = 'tab-btn';
                        tabs.appendChild(htmlTab);
                        tabs.appendChild(cssTab);
                        tabs.appendChild(jsTab);
                        const indicator = document.createElement('div');
                        indicator.className = 'tab-indicator';
                        indicator.style.position = 'absolute';
                        indicator.style.bottom = '0';
                        indicator.style.transition = 'transform 0.3s ease, width 0.3s ease';
                        tabs.appendChild(indicator);
                        codeContainer.appendChild(tabs);
                        function formatHTML(htmlString) {
                            const textarea = document.createElement('textarea');
                            textarea.innerHTML = htmlString;
                            const decoded = textarea.value;
                            return decoded
                                .replace(/></g, '>\\n<')
                                .replace(/^\s+|\s+$/g, '');
                        }
                        function createTabWrapper(tabName, content, pickerSelector = '') {
                            const wrapper = document.createElement('div');
                            wrapper.style.display = tabName === 'HTML' ? 'block' : 'none';
                            wrapper.style.position = 'relative';
                            const pre = document.createElement('pre');
                            pre.style.whiteSpace = 'pre-wrap';
                            pre.style.fontFamily = 'monospace';
                            pre.style.padding = '10px';
                            pre.style.border = '1px solid #ccc';
                            if (tabName === 'JS' && pickerSelector) {
                                pre.textContent = getPickerCode(pickerSelector);
                            } else {
                                pre.textContent = formatHTML(content);
                            }
                            const copyBtn = document.createElement('button');
                            copyBtn.innerHTML = '<i class="fa fa-copy"></i> Copy Code';
                            Object.assign(copyBtn.style, {
                                position: 'absolute',
                                zIndex:'20',
                                top: '-13px',
                                right: '30px',
                                fontSize: '12px',
                                color: '#fff',
                                background: '#111',
                                border: 'none',
                                padding: '3px 15px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background 0.3s'
                            });
                        copyBtn.addEventListener('click', () => {
                            let codeToCopy = '';
                            if (tabName === 'HTML') codeToCopy = "\\x3C!-- HTML --\\x3E\\n" + pre.textContent;
                            if (tabName === 'CSS') codeToCopy = "/* CSS */\\n" + pre.textContent;
                            if (tabName === 'JS') codeToCopy = "// JS\\n" + pre.textContent;
                            navigator.clipboard.writeText(codeToCopy).then(() => {
                            const openContainer = copyBtn.closest('.view-code-container');
                            highlightCopiedState(openContainer, pre);
                            const originalHTML = copyBtn.innerHTML;
                            copyBtn.innerHTML = '<i class="fa fa-check" style="color:green;"></i> Copied!';
                            copyBtn.style.cursor = 'not-allowed';
                            copyBtn.style.pointerEvents = 'none';
                            setTimeout(() => {
                                copyBtn.innerHTML = originalHTML;
                                copyBtn.style.cursor = 'pointer';
                                copyBtn.style.pointerEvents = 'auto';
                                }, 2000);
                            });
                            });
                            wrapper.appendChild(pre);
                            wrapper.appendChild(copyBtn);
                            return wrapper;
                        }
                        const htmlContent = container.querySelector(selector)?.outerHTML || '';
                        const cssContent = window.parent.document.getElementById('css-editor')?.value || '';
                        const jsContent = '';
                        const htmlTabContent = createTabWrapper('HTML', htmlContent);
                        const cssTabContent = createTabWrapper('CSS', cssContent);
                        const jsTabContent = createTabWrapper('JS', jsContent, selector);
                        codeContainer.appendChild(htmlTabContent);
                        codeContainer.appendChild(cssTabContent);
                        codeContainer.appendChild(jsTabContent);
                        function moveIndicator(activeBtn) {
                            const rect = activeBtn.getBoundingClientRect();
                            const parentRect = tabs.getBoundingClientRect();
                            const left = rect.left - parentRect.left;
                            indicator.style.width = rect.width + 'px';
                            indicator.style.transform = 'translateX(' + left + 'px)';
                        }
                        setTimeout(() => moveIndicator(htmlTab), 50);
                        function activateTab(tab, targetWrapper, content) {
                            [htmlTab, cssTab, jsTab].forEach(btn => btn.classList.remove('active'));
                            tab.classList.add('active');
                            moveIndicator(tab);
                            [htmlTabContent, cssTabContent, jsTabContent].forEach(w => w.style.display = 'none');
                            targetWrapper.style.display = 'block';
                            targetWrapper.querySelector('pre').textContent = content;
                        }
                        window.removeSearchUI = function () {
                            const existingHighlightDiv = document.querySelector(".highlight-div");
                            if (existingHighlightDiv) existingHighlightDiv.remove();

                            const existingOverlay = document.querySelector(".panel-search-overlay");
                            if (existingOverlay) existingOverlay.remove();
                        };
                        htmlTab.addEventListener('click', () => {
                            removeSearchUI();
                            activateTab(htmlTab, htmlTabContent, formatHTML(htmlContent));
                        });
                        cssTab.addEventListener('click', () => {
                            removeSearchUI();
                            const cssEditorContent = window.parent.document.getElementById('css-editor')?.value || '';
                            activateTab(cssTab, cssTabContent, cssEditorContent);
                        });
                        jsTab.addEventListener('click', () => {
                            removeSearchUI();
                            const comp = window.componentFunctionMap[selector] || {};
                            const jsEditorContent = window.parent.document.getElementById('js-editor')?.value || '';
                            let finalCode = '';
                            if (comp.func) {
                                const funcText = getFunctionText(jsEditorContent, comp.func);
                                if (funcText) finalCode += funcText + "\\n";
                                else finalCode += comp.func + "\\n";
                            }
                                if (comp.funccommon) {
                                const funccommonText = getFunctionText(jsEditorContent, comp.funccommon);
                                if (funccommonText) finalCode += funccommonText + "\\n";
                                else finalCode += comp.funccommon + "\\n";
                                    finalCode += "$(document).ready(function() { " + comp.func + "(); });\\n\\n";
                            }
                            if (comp.event) finalCode += comp.event + "\\n";
                            activateTab(jsTab, jsTabContent, finalCode);
                        });
                        container.appendChild(codeContainer);
                        requestAnimationFrame(() => codeContainer.classList.add('show'));
                        allViewCodeBtns.forEach(btn => btn.setAttribute('data-tooltip', 'Get Code'));
                        target.setAttribute('data-tooltip', 'Hide Code');
                    } else {
                        if (codeContainer.classList.contains('show')) {
                            codeContainer.classList.remove('show');
                            allViewCodeBtns.forEach(btn => btn.setAttribute('data-tooltip', 'Get Code'));
                            codeContainer.addEventListener('transitionend', function handler(ev) {
                                if (ev.propertyName === 'transform') {
                                    codeContainer.style.display = 'none';
                                    codeContainer.removeEventListener('transitionend', handler);
                                }
                            });
                        } else {
                            document.querySelectorAll('.view-code-container.show').forEach(c => {
                                c.classList.remove('show');
                                c.style.display = 'none';
                            });
                            codeContainer.style.display = 'block';
                            function removeSearchUII() {
                            const existingHighlightDiv = document.querySelector(".highlight-div");
                            if (existingHighlightDiv) existingHighlightDiv.remove();

                            const existingOverlay = document.querySelector(".panel-search-overlay");
                            if (existingOverlay) existingOverlay.remove();
                        }
                            removeSearchUII();
                            requestAnimationFrame(() => codeContainer.classList.add('show'));
                            allViewCodeBtns.forEach(btn => btn.setAttribute('data-tooltip', 'Get Code'));
                            target.setAttribute('data-tooltip', 'Hide Code');
                        }
                    }
                }
            });
            document.addEventListener('keydown', function (e) {
                const openContainer = document.querySelector('.view-code-container.show');
                if (!openContainer) return;
                const activeTab = openContainer.querySelector('.tab-btn.active');
                if (!activeTab) return;
                const preBlocks = Array.from(openContainer.querySelectorAll('pre'));
                const activePre = preBlocks.find(p => p.offsetParent !== null);
                if (!activePre) return;
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                    const range = document.createRange();
                    range.selectNodeContents(activePre);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    e.preventDefault();
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                    let codeToCopy = window.getSelection().toString();
                    if (!codeToCopy.trim()) {
                        codeToCopy = activePre.textContent;
                    }
                    const tabName = activeTab.textContent.trim();
                    if (tabName === 'HTML') {
                        codeToCopy = "<!-- HTML -->\\n" + codeToCopy;
                    } else if (tabName === 'CSS') {
                        codeToCopy = "/* CSS */\\n" + codeToCopy;
                    } else if (tabName === 'JS') {
                        codeToCopy = "// JS\\n" + codeToCopy;
                    }
                    navigator.clipboard.writeText(codeToCopy).then(() => {
                        highlightCopiedState(openContainer, activePre);
                    });
                    if (window.parent?.closePanelSearch) {
                        window.parent.closePanelSearch(openContainer, activePre);
                    }
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
                    e.preventDefault();
                    if (window.parent?.openPanelSearchiframe) {
                        const existingOverlay = openContainer.querySelector(".panel-search-overlay");
                        if (existingOverlay) existingOverlay.remove();
                        const existingHighlightDiv = openContainer.querySelector(".highlight-div");
                        if (existingHighlightDiv) existingHighlightDiv.remove();
                        window.parent.openPanelSearchiframe(openContainer, activePre);
                    }
                }
             });
        `;

    return `<!DOCTYPE html>
<html>
<head>
  <base href="${location.origin}/">
  <meta charset="utf-8">
  ${faHref}
  <style>${css}</style>
</head>
<body>
  ${html}

  ${jq}
  <script defer src="https://vinoth-elito.github.io/vinoth-sliders/js/sliders.js?v=${cacheBuster}"></script>

  <script>
    try { ${js} } catch (e) { console.error(e); }
    try {
      ${INIT_CODE}
    } catch (e) { console.error(e); }
    if (typeof attachResize === 'function') { attachResize(); }
  </script>
</body>
</html>`;
}
function updatePreview() {
    livePreview.srcdoc = buildSrcDoc();
}
htmlEditor.addEventListener('input', updatePreview);
cssEditor.addEventListener('input', updatePreview);
jsEditor.addEventListener('input', updatePreview);
livePreview.addEventListener('load', () => {
    if (!livePreview.contentDocument?.body?.childElementCount) {
        livePreview.srcdoc = buildSrcDoc();
    }
});
updatePreview();

function setupViewSwitcher() {
    const container = document.querySelector(".editor-container");
    if (!container) return;
    const editors = container.querySelector(".editors");
    if (window.innerWidth >= 1025) {
        container.classList.add("desktop-mode");
        container.classList.remove("mobile-mode");
        setupSidebarResize(".editor-left");
        setupCenterResize(".editor-center");
        setupEditorRightResize();
        const viewSwitcherBtn = document.getElementById("view-switcher-button");
        const switchWrapper = document.querySelector(".editors--switch");
        let currentLayout = "editor-left";
        if (viewSwitcherBtn && !viewSwitcherBtn.dataset.listenerAdded) {
            viewSwitcherBtn.dataset.listenerAdded = "true";
            viewSwitcherBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                if (!switchWrapper) return;
                const existingDropdown = switchWrapper.querySelector(".view-switcher-dropdown");
                if (existingDropdown) {
                    existingDropdown.classList.remove("dropdown-show");
                    existingDropdown.classList.add("dropdown-hide");
                    setTimeout(() => existingDropdown.remove(), 300);
                    return;
                }
                const dropdown = document.createElement("div");
                dropdown.className = "view-switcher-dropdown dropdown-show";
                dropdown.style.position = "absolute";
                dropdown.style.top = "100%";
                dropdown.style.right = "0";
                dropdown.style.background = "#fff";
                dropdown.style.border = "1px solid #ccc";
                dropdown.style.borderRadius = "6px";
                dropdown.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                dropdown.style.padding = "5px 30px";
                dropdown.style.zIndex = 999;
                dropdown.style.minWidth = "160px";
                dropdown.style.transformOrigin = "top center";
                const options = [
                    {
                        id: "editor-left",
                        label: "Editor Left",
                        icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="EditorHeaderViewSwitcherLayoutButtons-module_newPenLeftLayout-PhHzQ" width="20" height="20"><path d="M0 9.002C0 8.45.455 8 .992 8h18.016c.548 0 .992.456.992 1.002v9.996c0 .553-.455 1.002-.992 1.002H.992C.444 20 0 19.544 0 18.998zm0-8C0 .45.451 0 .99 0h4.02A.99.99 0 0 1 6 1.003v4.994C6 6.551 5.549 7 5.01 7H.99A.99.99 0 0 1 0 5.997zm7 0C7 .45 7.451 0 7.99 0h4.02A.99.99 0 0 1 13 1.003v4.994C13 6.551 12.549 7 12.01 7H7.99A.99.99 0 0 1 7 5.997zm7 0C14 .45 14.451 0 14.99 0h4.02A.99.99 0 0 1 20 1.003v4.994C20 6.551 19.549 7 19.01 7h-4.02A.99.99 0 0 1 14 5.997z"></path></svg>'
                    },
                    {
                        id: "editor-center",
                        label: "Editor Center",
                        icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M0 9.002C0 8.45.455 8 .992 8h18.016c.548 0 .992.456.992 1.002v9.996c0 .553-.455 1.002-.992 1.002H.992C.444 20 0 19.544 0 18.998zm0-8C0 .45.451 0 .99 0h4.02A.99.99 0 0 1 6 1.003v4.994C6 6.551 5.549 7 5.01 7H.99A.99.99 0 0 1 0 5.997zm7 0C7 .45 7.451 0 7.99 0h4.02A.99.99 0 0 1 13 1.003v4.994C13 6.551 12.549 7 12.01 7H7.99A.99.99 0 0 1 7 5.997zm7 0C14 .45 14.451 0 14.99 0h4.02A.99.99 0 0 1 20 1.003v4.994C20 6.551 19.549 7 19.01 7h-4.02A.99.99 0 0 1 14 5.997z"></path></svg>'
                    },
                    {
                        id: "editor-right",
                        label: "Editor Right",
                        icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="EditorHeaderViewSwitcherLayoutButtons-module_newPenRightLayout-X2VCi" width="20" height="20"><path d="M0 9.002C0 8.45.455 8 .992 8h18.016c.548 0 .992.456.992 1.002v9.996c0 .553-.455 1.002-.992 1.002H.992C.444 20 0 19.544 0 18.998zm0-8C0 .45.451 0 .99 0h4.02A.99.99 0 0 1 6 1.003v4.994C6 6.551 5.549 7 5.01 7H.99A.99.99 0 0 1 0 5.997zm7 0C7 .45 7.451 0 7.99 0h4.02A.99.99 0 0 1 13 1.003v4.994C13 6.551 12.549 7 12.01 7H7.99A.99.99 0 0 1 7 5.997zm7 0C14 .45 14.451 0 14.99 0h4.02A.99.99 0 0 1 20 1.003v4.994C20 6.551 19.549 7 19.01 7h-4.02A.99.99 0 0 1 14 5.997z"></path></svg>'
                    }
                ];
                options.forEach((opt) => {
                    const btn = document.createElement("button");
                    btn.className = "dropdown-btn";
                    btn.style.width = "100%";
                    btn.style.padding = "8px 12px";
                    btn.style.cursor = "pointer";
                    btn.style.textAlign = "center";
                    btn.innerHTML = `${opt.icon} ${opt.label}`;
                    btn.id = opt.id;
                    if (opt.id === currentLayout) btn.classList.add("active");
                    let activeResizeCleanup = null;
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        dropdown.querySelectorAll(".dropdown-btn").forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                        currentLayout = opt.id;
                        applyEditorLayout(opt.id);
                        let editors = document.querySelector(".editor-container .editors");
                        editors.querySelectorAll(".resizer-horizontal, .panel-width-resizer, .resize-handle").forEach(r => r.remove());
                        if (activeResizeCleanup) activeResizeCleanup();
                        activeResizeCleanup = null;
                        const newEditors = editors.cloneNode(true);
                        editors.replaceWith(newEditors);
                        editors = newEditors;
                        initTextareaSearch();
                        editors.style.flex = "";
                        editors.style.height = "";
                        editors.style.width = "";
                        editors.style.flexDirection = "";
                        if (opt.id === "editor-center") {
                            editors.style.flex = "0 0 400px";
                            editors.style.height = "400px";
                            editors.style.width = "100%";
                            editors.style.flexDirection = 'row';
                            activeResizeCleanup = setupCenterResize('.editor-center', "100%", 50, 100, 800);
                        } else if (opt.id === "editor-right") {
                            editors.style.flex = "0 0 600px";
                            editors.style.height = "100%";
                            editors.style.flexDirection = 'column';
                            activeResizeCleanup = setupEditorRightResize({ defaultWidth: 600, minWidth: 200 });
                        } else if (opt.id === "editor-left") {
                            editors.style.flex = "0 0 600px";
                            editors.style.height = "100%";
                            editors.style.flexDirection = 'column';
                            activeResizeCleanup = setupSidebarResize('.editor-left', 600);
                        }
                        dropdown.classList.remove("dropdown-show");
                        dropdown.classList.add("dropdown-hide");
                        setTimeout(() => dropdown.remove(), 300);
                    });
                    dropdown.appendChild(btn);
                });
                switchWrapper.appendChild(dropdown);
                function handleOutsideClick(event) {
                    if (!dropdown.contains(event.target) && event.target !== viewSwitcherBtn) {
                        dropdown.classList.remove("dropdown-show");
                        dropdown.classList.add("dropdown-hide");
                        setTimeout(() => dropdown.remove(), 300);
                        document.removeEventListener("click", handleOutsideClick);
                    }
                }
                document.addEventListener("click", handleOutsideClick);
                const handleIframeClick = (event) => {
                    dropdown.classList.remove("dropdown-show");
                    dropdown.classList.add("dropdown-hide");
                    setTimeout(() => dropdown.remove(), 300);
                    removeIframeClickListeners();
                    document.removeEventListener("click", handleOutsideClick);
                };
                function removeIframeClickListeners() {
                    document.querySelectorAll("iframe").forEach((iframe) => {
                        try {
                            iframe.contentDocument.removeEventListener("mousedown", handleIframeClick);
                        } catch (err) {
                        }
                    });
                }
                document.querySelectorAll("iframe").forEach((iframe) => {
                    try {
                        iframe.contentDocument.addEventListener("mousedown", handleIframeClick);
                    } catch (err) {
                    }
                });
            });
        }
    } else {
        container.classList.add("mobile-mode");
        container.classList.remove("desktop-mode");
        if (editors) {
            editors.style.flex = "1";
            editors.style.padding = "10px";
            editors.style.display = "flex";
            editors.style.flexDirection = "column";
            editors.style.width = "100%";
            editors.style.height = "auto";
        }
        container.querySelectorAll(
            ".horizontalResizer, .panel-width-resizer, .resize-handle, #resizerHorizontal"
        ).forEach(el => el.remove());
        container.querySelectorAll(".editor-panel").forEach(panel => {
            panel.style.flex = "";
            panel.style.height = "";
            panel.style.width = "";
            editors.style.padding = "";
        });
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", null);
        document.removeEventListener("mouseup", null);
        document.removeEventListener("pointermove", null);
        document.removeEventListener("pointerup", null);
    }
}
setupViewSwitcher();
window.addEventListener("resize", setupViewSwitcher);
function setupSidebarResize(sidebarSelector, defaultWidth = 600, defaultPanelHeights = []) {
    const container = document.querySelector(sidebarSelector);
    if (!container) return;
    const editors = container.querySelector('.editors');
    if (!editors) return;
    function updateWidth() {
        if (window.innerWidth >= 1025) {
            editors.style.flex = `0 0 ${defaultWidth}px`;
            editors.style.width = `${defaultWidth}px`;
            const panels = editors.querySelectorAll('.editor-panel');
            panels.forEach((panel, index) => {
                panel.style.flex = `0 0 ${100 / panels.length}%`;
            });
        } else {
            editors.style.flex = `0 0 50%`;
            editors.style.width = `100%`;
            const panels = editors.querySelectorAll('.editor-panel');
            panels.forEach(panel => {
                panel.style.flex = `1`;
            });
        }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    const resizer = document.getElementById('resizer');
    if (resizer) {
        let activePointerId = null;
        let isMouseDown = false;
        Object.assign(resizer.style, {
            position: 'absolute',
            right: '0',
            width: '5px',
            height: '100%',
            cursor: 'col-resize',
            background: 'rgba(255,255,255,0.2)',
            zIndex: 10
        });
        function stopCurrentResize() {
            if (activePointerId === null && !isMouseDown) return;
            try { resizer.releasePointerCapture?.(activePointerId); } catch (e) { }
            activePointerId = null;
            isMouseDown = false;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointercancel', onPointerUp);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        function onPointerMove(e) {
            if (activePointerId !== null && e.pointerId !== activePointerId) return;
            const containerRect = container.getBoundingClientRect();
            let newWidth = e.clientX - containerRect.left;
            const maxWidth = window.innerWidth - containerRect.left;
            newWidth = Math.max(200, Math.min(maxWidth, newWidth));
            editors.style.flex = `0 0 ${newWidth}px`;
            editors.style.width = `${newWidth}px`;
        }
        function onPointerUp() { stopCurrentResize(); }
        function onPointerDown(e) {
            e.preventDefault();
            activePointerId = e.pointerId;
            try { e.target.setPointerCapture(activePointerId); } catch (e) { }
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
            document.addEventListener('pointercancel', onPointerUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }
        function onMouseMove(e) {
            if (!isMouseDown) return;
            const containerRect = container.getBoundingClientRect();
            let newWidth = e.clientX - containerRect.left;
            const maxWidth = window.innerWidth - containerRect.left;
            newWidth = Math.max(200, Math.min(maxWidth, newWidth));
            editors.style.flex = `0 0 ${newWidth}px`;
            editors.style.width = `${newWidth}px`;
        }
        function onMouseUp() { stopCurrentResize(); }
        if (window.PointerEvent) {
            resizer.addEventListener('pointerdown', onPointerDown);
            window.addEventListener('blur', stopCurrentResize);
            window.addEventListener('mouseout', (ev) => { if (!ev.relatedTarget) stopCurrentResize(); });
        } else {
            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isMouseDown = true;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                document.body.style.cursor = 'ew-resize';
                document.body.style.userSelect = 'none';
            });
            window.addEventListener('blur', stopCurrentResize);
        }
    }
    const panels = Array.from(editors.querySelectorAll('.editor-panel'));
    if (panels.length < 2) return;
    editors.style.display = 'flex';
    editors.style.flexDirection = 'column';
    editors.style.height = '100%';
    const panelCount = panels.length;
    panels.forEach((panel, index) => {
        const existingResizer = panel.querySelector('.panel-resizer');
        if (existingResizer) existingResizer.remove();
        function updateLayout() {
            if (window.innerWidth >= 1025) {
                let heightPercent = defaultPanelHeights[index] ?? (100 / panelCount);
                panel.style.flex = `0 0 ${heightPercent}%`;
                panel.style.position = 'relative';
            } else {
                panel.style.flex = `1`;
                panel.style.position = 'relative';
            }
        }
        updateLayout();
        window.addEventListener('resize', updateLayout);
        if (index === panelCount - 1) return;
        const resizer = document.createElement('div');
        resizer.className = 'panel-resizer';
        Object.assign(resizer.style, {
            position: 'absolute',
            bottom: '1px',
            left: '0',
            width: '100%',
            height: '6px',
            cursor: 'row-resize',
            background: 'rgba(255,255,255,0.2)',
            zIndex: 10
        });
        panel.appendChild(resizer);
        let startY = 0, prevStartHeight = 0, nextStartHeight = 0;
        const prevPanel = panel;
        const nextPanel = panels[index + 1];
        resizer.addEventListener('pointerdown', e => {
            e.preventDefault();
            startY = e.clientY;
            prevStartHeight = prevPanel.getBoundingClientRect().height;
            nextStartHeight = nextPanel.getBoundingClientRect().height;
            function moveHandler(e) {
                const dy = e.clientY - startY;
                const containerHeight = editors.getBoundingClientRect().height;
                let newPrevHeight = ((prevStartHeight + dy) / containerHeight) * 100;
                let newNextHeight = ((nextStartHeight - dy) / containerHeight) * 100;
                newPrevHeight = Math.max(10, newPrevHeight);
                newNextHeight = Math.max(10, newNextHeight);
                prevPanel.style.flex = `0 0 ${newPrevHeight}%`;
                nextPanel.style.flex = `0 0 ${newNextHeight}%`;
            }
            function stopHandler() {
                document.removeEventListener('pointermove', moveHandler);
                document.removeEventListener('pointerup', stopHandler);
                document.body.style.cursor = '';
            }
            document.addEventListener('pointermove', moveHandler);
            document.addEventListener('pointerup', stopHandler);
            document.body.style.cursor = 'row-resize';
        });
    });
}
function setupCenterResize(centerSelector, defaultWidth = "100%", minWidth = 50, minHeight = 100, maxHeight = 800) {
    const editorCenter = document.querySelector(centerSelector);
    if (!editorCenter) return;
    const editorsContainer = editorCenter.querySelector('.editors');
    if (!editorsContainer) return;
    const panels = Array.from(editorsContainer.querySelectorAll('.editor-panel'));
    if (!panels.length) return;
    editorsContainer.querySelectorAll('.panel-resizer').forEach(r => r.remove());
    function applyResponsiveLayout() {
        editorsContainer.style.width = defaultWidth;
        if (window.innerWidth >= 1025) {
            editorsContainer.style.height = '400px';
            editorsContainer.style.minHeight = `${minHeight}px`;
            editorsContainer.style.flex = `0 0 400px`;
            editorsContainer.style.flexDirection = 'row';
            panels.forEach(panel => panel.style.flex = `1 1 0%`);
        } else {
            editorsContainer.style.height = 'auto%';
            editorsContainer.style.minHeight = `${minHeight}px`;
            editorsContainer.style.flex = '1';
            editorsContainer.style.flexDirection = 'column';
            panels.forEach(panel => panel.style.flex = `1`);
        }
    }
    applyResponsiveLayout();
    window.addEventListener('resize', applyResponsiveLayout);
    let hResizer = editorsContainer.querySelector('.resizer-horizontal');
    if (!hResizer) {
        hResizer = document.createElement('div');
        hResizer.className = 'resizer-horizontal';
        Object.assign(hResizer.style, {
            height: '5px',
            background: 'rgba(255,255,255,0.2)',
            cursor: 'row-resize',
            userSelect: 'none',
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            zIndex: 100
        });
        editorsContainer.appendChild(hResizer);
    }
    let isResizingHeight = false, startY = 0, startHeight = 0;
    hResizer.addEventListener('mousedown', e => {
        e.preventDefault();
        isResizingHeight = true;
        startY = e.clientY;
        startHeight = editorsContainer.offsetHeight;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', e => {
        if (!isResizingHeight) return;
        const dy = e.clientY - startY;
        let newHeight = startHeight + dy;
        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
        editorsContainer.style.height = `${newHeight}px`;
        editorsContainer.style.flex = `0 0 ${newHeight}px`;
    });
    document.addEventListener('mouseup', () => {
        if (!isResizingHeight) return;
        isResizingHeight = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });
    panels.forEach((panel, idx) => {
        if (idx === panels.length - 1) return;
        panel.style.position = 'relative';
        const widthResizer = document.createElement('div');
        widthResizer.className = 'panel-width-resizer';
        Object.assign(widthResizer.style, {
            position: 'absolute',
            top: '0',
            right: '0',
            width: '5px',
            height: '100%',
            cursor: 'ew-resize',
            background: 'rgba(255,255,255,0.2)',
            zIndex: 100
        });
        panel.appendChild(widthResizer);
        const nextPanel = panels[idx + 1];
        widthResizer.addEventListener('mousedown', e => {
            e.preventDefault();
            const parentWidth = editorsContainer.getBoundingClientRect().width;
            const startX = e.clientX;
            const startCurrWidth = panel.getBoundingClientRect().width;
            const startNextWidth = nextPanel.getBoundingClientRect().width;
            function onMove(ev) {
                const dx = ev.clientX - startX;
                let newCurrWidth = startCurrWidth + dx;
                let newNextWidth = startNextWidth - dx;
                if (newCurrWidth < minWidth || newNextWidth < minWidth) return;
                panel.style.flex = `0 0 ${(newCurrWidth / parentWidth) * 100}%`;
                nextPanel.style.flex = `0 0 ${(newNextWidth / parentWidth) * 100}%`;
            }
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp, { once: true });
        });
    });
}
function setupEditorRightResize({ containerSelector = '.editor-right', defaultWidth = 600, minWidth = 200 } = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) return null;
    const editors = container.querySelector('.editors');
    if (!editors) return null;
    editors.querySelectorAll('.resize-handle, .panel-resizer').forEach(h => h.remove());
    editors.style.width = `${defaultWidth}px`;
    editors.style.flex = `0 0 ${defaultWidth}px`;
    editors.style.position = editors.style.position || 'relative';
    function createHandle(side) {
        const h = document.createElement('div');
        h.className = `resize-handle resize-handle-${side}`;
        Object.assign(h.style, {
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '0',
            width: '5px',
            cursor: 'ew-resize',
            zIndex: 9999,
            touchAction: 'none',
            background: 'rgba(255,255,255,0.2)'
        });
        if (side === 'left') h.style.left = '0';
        else h.style.right = '0';
        editors.appendChild(h);
        h.addEventListener('pointerdown', e => startResize(e, side));
        h.addEventListener('dblclick', () => {
            const curW = editors.getBoundingClientRect().width;
            if (Math.round(curW) < Math.round(window.innerWidth - 1)) {
                editors.style.width = `${window.innerWidth}px`;
                editors.style.flex = `0 0 ${window.innerWidth}px`;
            } else {
                editors.style.width = `${defaultWidth}px`;
                editors.style.flex = `0 0 ${defaultWidth}px`;
            }
        });
    }
    const containerRect = container.getBoundingClientRect();
    const containerCenter = (containerRect.left + containerRect.right) / 2;
    const viewportCenter = window.innerWidth / 2;
    const isVisuallyRight = containerCenter >= viewportCenter;
    createHandle(isVisuallyRight ? 'left' : 'right');
    function startResize(pointerEvent, side) {
        pointerEvent.preventDefault();
        const startPointerX = pointerEvent.clientX;
        const startWidth = editors.getBoundingClientRect().width;
        try { pointerEvent.target.setPointerCapture(pointerEvent.pointerId); } catch (e) { }

        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'ew-resize';
        function onMove(e) {
            let delta = e.clientX - startPointerX;
            if (side === 'right') delta = -delta;
            let newWidth = startWidth + delta;
            newWidth = Math.max(minWidth, Math.min(window.innerWidth, newWidth));
            editors.style.width = `${newWidth}px`;
            editors.style.flex = `0 0 ${newWidth}px`;
        }
        function onUp() {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp, { once: true });
    }
    const panels = Array.from(editors.querySelectorAll('.editor-panel'));
    if (panels.length > 1) {
        panels.forEach((panel, index) => {
            if (index === panels.length - 1) return;
            panel.style.position = 'relative';
            const resizer = document.createElement('div');
            resizer.className = 'panel-resizer';
            Object.assign(resizer.style, {
                position: 'absolute',
                bottom: '1px',
                left: '0',
                width: '100%',
                height: '6px',
                cursor: 'row-resize',
                background: 'rgba(255,255,255,0.2)',
                zIndex: 10
            });
            panel.appendChild(resizer);
            let startY = 0, prevHeight = 0, nextHeight = 0;
            const nextPanel = panels[index + 1];
            resizer.addEventListener('pointerdown', e => {
                e.preventDefault();
                startY = e.clientY;
                prevHeight = panel.getBoundingClientRect().height;
                nextHeight = nextPanel.getBoundingClientRect().height;
                function onMove(ev) {
                    const dy = ev.clientY - startY;
                    const containerHeight = editors.getBoundingClientRect().height;
                    let newPrevHeight = ((prevHeight + dy) / containerHeight) * 100;
                    let newNextHeight = ((nextHeight - dy) / containerHeight) * 100;
                    newPrevHeight = Math.max(10, newPrevHeight);
                    newNextHeight = Math.max(10, newNextHeight);
                    panel.style.flex = `0 0 ${newPrevHeight}%`;
                    nextPanel.style.flex = `0 0 ${newNextHeight}%`;
                }
                function onUp() {
                    document.removeEventListener('pointermove', onMove);
                    document.removeEventListener('pointerup', onUp);
                }
                document.addEventListener('pointermove', onMove);
                document.addEventListener('pointerup', onUp, { once: true });
            });
        });
    }
    return () => {
        editors.querySelectorAll('.resize-handle, .panel-resizer').forEach(r => r.remove());
    };
}
setupSidebarResize('.editor-left');
setupCenterResize('.editor-center');
setupEditorRightResize('.editor-right');
function applyEditorLayout(mode) {
    const editorContainer = document.querySelector(".editor-container");
    if (!editorContainer) return;
    editorContainer.classList.remove("editor-left", "editor-center", "editor-right");
    void editorContainer.offsetWidth;
    editorContainer.classList.add(mode);
    const overlay = document.createElement("div");
    overlay.className = "editor-overlay";
    const calendarAnimation = document.createElement("div");
    calendarAnimation.className = "calendar-animation";
    for (let i = 0; i < 9; i++) {
        const day = document.createElement("div");
        day.className = "day";
        calendarAnimation.appendChild(day);
    }
    overlay.appendChild(calendarAnimation);
    const typing = document.createElement("div");
    typing.className = "typing";
    overlay.appendChild(typing);
    editorContainer.style.position = "relative";
    editorContainer.appendChild(overlay);
    const text = "Applying layout...";
    let index = 0;
    const typeInterval = setInterval(() => {
        typing.textContent += text[index];
        index++;
        if (index >= text.length) clearInterval(typeInterval);
    }, 50);
    setTimeout(() => overlay.remove(), 800);
}
function showReloadAlert() {
    if (confirm("Do you want to reload the page?")) {
        reloadWithLoader();
    }
}
function hideAllPopups() {
    document.querySelectorAll('.panel-save-popup, .panel-copy-popup, .panel-search-overlay').forEach(el => el.remove());
    document.querySelectorAll('.highlight-div').forEach(el => el.remove());
    document.querySelectorAll('.editor-panel textarea').forEach(textarea => {
        textarea.style.background = '';
        textarea.style.position = '';
        textarea.style.zIndex = '';
    });
}

document.body.addEventListener("keydown", function (e) {
    const target = e.target.closest(".editor-panel textarea");
    if (!target) return;
    const isSaveShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
    if (isSaveShortcut) {
        e.preventDefault();
        hideAllPopups();
        const panel = target.closest(".editor-panel");
        if (!panel) return;
        let panelType = "Unknown";
        if (panel.id === "html-panel") panelType = "HTML";
        else if (panel.id === "css-panel") panelType = "CSS";
        else if (panel.id === "js-panel") panelType = "JS";
        showPanelSavePopup(panel, `${panelType} code has been saved`);
    }
});
document.body.addEventListener("copy", function (e) {
    const target = document.activeElement;
    if (!target || !target.matches(".editor-panel textarea")) return;
    e.preventDefault();
    hideAllPopups();
    const selectedText = window.getSelection().toString() || target.value.substring(target.selectionStart, target.selectionEnd);
    let panelType = "Unknown";
    const panel = target.closest(".editor-panel");
    if (!panel) return;
    if (panel.id === "html-panel") panelType = "HTML";
    else if (panel.id === "css-panel") panelType = "CSS";
    else if (panel.id === "js-panel") panelType = "JS";
    let codeToCopy = selectedText || target.value;
    if (panelType === "HTML") codeToCopy = "<!-- HTML -->\n" + codeToCopy;
    else if (panelType === "CSS") codeToCopy = "/* CSS */\n" + codeToCopy;
    else if (panelType === "JS") codeToCopy = "// JS\n" + codeToCopy;
    navigator.clipboard.writeText(codeToCopy).then(() => {
        showPanelCopyPopup(panel, `${panelType} code has been copied`);
    }).catch(() => {
        console.warn("Copy failed, fallback may be needed");
    });
});
function showPanelCopyPopup(panel, message) {
    let existingPopup = panel.querySelector(".panel-copy-popup");
    if (existingPopup) existingPopup.remove();
    const popup = document.createElement("div");
    popup.className = "panel-copy-popup";
    popup.textContent = message;
    Object.assign(popup.style, {
        position: "absolute",
        top: "0px",
        right: "10px",
        background: "#007bff",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: "500",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        opacity: "0",
        transform: "translateY(-20px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        zIndex: "50"
    });
    if (getComputedStyle(panel).position === "static") {
        panel.style.position = "relative";
    }
    panel.appendChild(popup);
    requestAnimationFrame(() => {
        popup.style.opacity = "1";
        popup.style.transform = "translateY(0)";
    });
    setTimeout(() => {
        popup.style.opacity = "0";
        popup.style.transform = "translateY(-20px)";
        setTimeout(() => popup.remove(), 300);
    }, 2000);
}
function showPanelSavePopup(panel, message) {
    const existingPopup = panel.querySelector(".save-popup");
    if (existingPopup) existingPopup.remove();
    const popup = document.createElement("div");
    popup.className = "save-popup";
    popup.textContent = message;
    Object.assign(popup.style, {
        position: "absolute",
        top: "0px",
        right: "10px",
        background: "#4caf50",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "13px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        zIndex: 1000,
        opacity: "0",
        transform: "translateY(-20px)",
        transition: "opacity 0.3s ease, transform 0.3s ease"
    });
    if (getComputedStyle(panel).position === "static") {
        panel.style.position = "relative";
    }
    panel.appendChild(popup);
    requestAnimationFrame(() => {
        popup.style.opacity = "1";
        popup.style.transform = "translateY(0)";
    });
    setTimeout(() => {
        popup.style.opacity = "0";
        popup.style.transform = "translateY(-20px)";
        setTimeout(() => popup.remove(), 300);
    }, 1500);
}
function initTextareaSearch() {
    document.querySelectorAll('.editor-panel textarea').forEach(textarea => {
        textarea.addEventListener('keydown', e => {
            const isSearchShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f';
            if (isSearchShortcut) {
                e.preventDefault();
                hideAllPopups();
                const panel = textarea.closest('.editor-panel');
                if (!panel) return;
                openPanelSearch(panel, textarea);
            }
        });
    });
}
initTextareaSearch();

window.openPanelSearch = function (panel, target) {
    document.querySelectorAll('.panel-search-overlay, .highlight-div').forEach(el => el.remove());
    const isTextarea = target.tagName.toLowerCase() === 'textarea';
    const getContent = () => isTextarea ? target.value : target.textContent;
    const setSelection = (start, end) => {
        if (isTextarea) {
            target.setSelectionRange(start, end);
        } else {
            const range = document.createRange();
            const sel = window.getSelection();
            sel.removeAllRanges();
            let remainingStart = start;
            let remainingEnd = end;
            const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const node = walker.currentNode;
                const nodeLength = node.textContent.length;
                if (remainingStart < nodeLength) {
                    const rangeStart = remainingStart;
                    const rangeEnd = Math.min(nodeLength, remainingEnd);
                    range.setStart(node, rangeStart);
                    range.setEnd(node, rangeEnd);
                    sel.addRange(range);
                    break;
                } else {
                    remainingStart -= nodeLength;
                    remainingEnd -= nodeLength;
                }
            }
        }
    };
    const highlightDiv = document.createElement('div');
    highlightDiv.className = 'highlight-div';
    highlightDiv.style.position = 'absolute';
    highlightDiv.style.pointerEvents = 'none';
    highlightDiv.style.whiteSpace = 'pre-wrap';
    highlightDiv.style.wordWrap = 'break-word';
    highlightDiv.style.color = 'transparent';
    highlightDiv.style.overflow = 'hidden';
    highlightDiv.style.zIndex = 1;
    highlightDiv.style.boxSizing = "border-box";
    const rect = target.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    highlightDiv.style.top = (rect.top - panelRect.top + panel.scrollTop) + 'px';
    highlightDiv.style.left = (rect.left - panelRect.left + panel.scrollLeft) + 'px';
    highlightDiv.style.width = '100%';
    highlightDiv.style.height = rect.height + 'px';
    panel.appendChild(highlightDiv);
    target.style.background = 'transparent';
    target.style.position = 'relative';
    target.style.zIndex = 2;
    const overlay = document.createElement('div');
    overlay.className = 'panel-search-overlay';
    Object.assign(overlay.style, {
        position: 'absolute',
        top: '5px',
        right: '0',
        background: 'rgba(255,255,255,0.95)',
        padding: '4px 6px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    });
    const searchMain = document.createElement('div');
    const form = document.createElement('form');
    form.id = 'search__popupmain';
    Object.assign(searchMain.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        opacity: '0',
        transition: 'transform 0.3s ease, opacity 0.3s ease'
    });
    form.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') {
            e.preventDefault();
        }
    });
    const label = document.createElement('label');
    label.setAttribute('for', 'search__poptxt');
    label.textContent = 'Search: ';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'search__poptxt';
    input.placeholder = 'Search text...';
    Object.assign(input.style, { width: '200px', padding: '4px 8px', fontSize: '14px' });
    const prevBtn = document.createElement('button'); prevBtn.innerHTML = '⬆';
    const nextBtn = document.createElement('button'); nextBtn.innerHTML = '⬇';
    const counter = document.createElement('span');
    Object.assign(counter.style, { fontSize: '13px', color: '#333', display: 'none' });
    const closeBtn = document.createElement('button');
    closeBtn.className = 'search-close-btn';
    closeBtn.innerHTML = '✖';
    Object.assign(closeBtn.style, { background: 'transparent', border: 'none', fontSize: '14px', cursor: 'pointer' });
    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        highlightDiv.style.display = 'none';
        target.style.background = '';
        target.style.position = '';
        target.style.zIndex = '';
    });
    panel.appendChild(overlay);
    const searchCountEnd = document.createElement('div');
    searchCountEnd.className = 'panel__search__countend';
    Object.assign(searchCountEnd.style, {
        fontSize: '13px',
        color: 'red',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: 'translateY(-1px)'
    });
    form.append(label, input, prevBtn, nextBtn, counter, closeBtn);
    searchMain.appendChild(form);
    overlay.appendChild(searchMain);
    overlay.append(searchMain, searchCountEnd);
    requestAnimationFrame(() => {
        searchMain.style.transform = 'translateX(0)';
        searchMain.style.opacity = '1';
    });
    const noResultsSpan = document.createElement('span');
    noResultsSpan.textContent = 'No results';
    noResultsSpan.style.display = 'none';
    const endResultsSpan = document.createElement('span');
    endResultsSpan.textContent = 'You are at the end of search results!';
    endResultsSpan.style.display = 'none';
    searchCountEnd.append(noResultsSpan, endResultsSpan);
    input.focus();
    let matches = [];
    let currentIndex = -1;
    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function updateHighlights() {
        const term = input.value;
        matches = [];
        currentIndex = -1;
        counter.style.display = 'none';
        const cs = window.getComputedStyle(target);
        Object.assign(highlightDiv.style, {
            font: cs.font,
            padding: cs.padding,
            lineHeight: cs.lineHeight,
            whiteSpace: cs.whiteSpace,
            textAlign: cs.textAlign
        });
        if (!term) {
            highlightDiv.textContent = getContent();
            return;
        }
        const regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), 'gi');
        let lastIndex = 0;
        let html = '';
        let match;
        while ((match = regex.exec(getContent())) !== null) {
            matches.push({ start: match.index, end: regex.lastIndex });
            html += escapeHtml(getContent().substring(lastIndex, match.index));
            html += `<span class="highlight-match">${escapeHtml(getContent().substring(match.index, regex.lastIndex))}</span>`;
            lastIndex = regex.lastIndex;
            if (match.index === regex.lastIndex) regex.lastIndex++;
        }
        html += escapeHtml(getContent().substring(lastIndex));
        highlightDiv.innerHTML = html;

        if (matches.length) {
            currentIndex = 0;
            highlightCurrentMatch();
            counter.style.display = 'inline-block';
            counter.textContent = `${currentIndex + 1} / ${matches.length}`;
        } else {
            counter.style.display = 'none';
            showMessage('no-results');
        }
    }
    function highlightCurrentMatch() {
        highlightDiv.querySelectorAll('.highlight-match.current-match')
            .forEach(el => el.classList.remove('current-match'));

        if (!matches.length) {
            counter.style.display = 'none';
            return;
        }

        counter.style.display = 'inline-block';
        const spans = highlightDiv.querySelectorAll('.highlight-match');
        const span = spans[currentIndex];
        if (!span) return;

        span.classList.add('current-match');
        const match = matches[currentIndex];

        if (isTextarea) {
            target.setSelectionRange(match.start, match.end);
            requestAnimationFrame(() => {
                const textareaStyle = window.getComputedStyle(target);
                const lineHeight = parseInt(textareaStyle.lineHeight) || 16;
                const paddingTop = parseInt(textareaStyle.paddingTop) || 0;
                const beforeMatch = target.value.substring(0, match.start);
                const linesBefore = beforeMatch.split("\n").length - 1;
                let scrollPos = linesBefore * lineHeight + paddingTop - target.clientHeight / 2 + lineHeight / 2;
                scrollPos = Math.max(0, Math.min(scrollPos, target.scrollHeight - target.clientHeight));
                target.scrollTop = scrollPos;
            });
        } else {
            setSelection(match.start, match.end);
            requestAnimationFrame(() => {
                span.scrollIntoView({ block: "center", behavior: "smooth" });
            });
        }

        counter.textContent = `${currentIndex + 1} / ${matches.length}`;
    }

    function nextMatch() {
        if (!matches.length) return;
        currentIndex = (currentIndex + 1) % matches.length;
        highlightCurrentMatch();
        input.focus({ preventScroll: true });
    }
    function prevMatch() {
        if (!matches.length) return;
        currentIndex = (currentIndex - 1 + matches.length) % matches.length;
        highlightCurrentMatch();
        input.focus({ preventScroll: true });
    }
    function showMessage(type) {
        noResultsSpan.style.display = 'none';
        endResultsSpan.style.display = 'none';
        let span = null;
        if (type === 'no-results') span = noResultsSpan;
        if (type === 'end-results') span = endResultsSpan;
        if (!span) return;
        span.style.display = 'inline';
        span.style.opacity = '1';
        span.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        span.style.transform = 'translateY(0)';
        clearTimeout(span._timeout);
        span._timeout = setTimeout(() => {
            span.style.opacity = '0';
            span.style.transform = 'translateY(-8px)';
            setTimeout(() => { span.style.display = 'none'; }, 300);
        }, 2000);
    }
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!matches.length) {
                showMessage('no-results');
                return;
            }
            if (currentIndex < matches.length - 1) {
                currentIndex++;
                highlightCurrentMatch();
            } else {
                currentIndex = matches.length - 1;
                highlightCurrentMatch();
                showMessage('end-results');
            }
            input.focus({ preventScroll: true });
        }
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            hideAllPopups();
        }
    });
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        document.addEventListener('click', () => {
            hideAllPopups();
        });
    }
    function setupIframePopupCloser() {
        const iframe = document.querySelector('iframe');
        if (!iframe) return;
        document.addEventListener('click', e => {
            const rect = iframe.getBoundingClientRect();
            if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            ) {
                hideAllPopups();
            }
        });
        function attachInsideListener() {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDoc) return;
                iframeDoc.removeEventListener('click', hideAllPopups);
                iframeDoc.addEventListener('click', hideAllPopups);
            } catch (err) {
                console.warn("Cross-origin iframe - cannot attach click listener inside.", err);
            }
        }
        iframe.addEventListener('load', attachInsideListener);
        if (iframe.contentDocument?.readyState === 'complete') {
            attachInsideListener();
        }
    }
    setupIframePopupCloser();
    input.addEventListener('input', updateHighlights);
    nextBtn.addEventListener('click', nextMatch);
    prevBtn.addEventListener('click', prevMatch);
    target.addEventListener('scroll', () => {
        highlightDiv.scrollTop = target.scrollTop;
    });
    updateHighlights();
};


window.openPanelSearchiframe = function (panel, target) {
    document.querySelectorAll('.panel-search-overlay, .highlight-div').forEach(el => el.remove());
    const isTextarea = target.tagName.toLowerCase() === 'textarea';
    const getContent = () => isTextarea ? target.value : target.textContent;
    const setSelection = (start, end) => {
        if (isTextarea) {
            target.setSelectionRange(start, end);
        } else {
            const range = document.createRange();
            const sel = window.getSelection();
            sel.removeAllRanges();
            let remainingStart = start;
            let remainingEnd = end;
            const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const node = walker.currentNode;
                const nodeLength = node.textContent.length;
                if (remainingStart < nodeLength) {
                    const rangeStart = remainingStart;
                    const rangeEnd = Math.min(nodeLength, remainingEnd);
                    range.setStart(node, rangeStart);
                    range.setEnd(node, rangeEnd);
                    sel.addRange(range);
                    break;
                } else {
                    remainingStart -= nodeLength;
                    remainingEnd -= nodeLength;
                }
            }
        }
    };
    const highlightDiv = document.createElement('div');
    highlightDiv.className = 'highlight-div';
    highlightDiv.style.position = 'absolute';
    highlightDiv.style.pointerEvents = 'none';
    highlightDiv.style.whiteSpace = 'pre-wrap';
    highlightDiv.style.wordWrap = 'break-word';
    highlightDiv.style.color = 'transparent';
    highlightDiv.style.overflow = 'hidden';
    highlightDiv.style.zIndex = 1;
    highlightDiv.style.boxSizing = "border-box";
    const rect = target.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    highlightDiv.style.top = (rect.top - panelRect.top + panel.scrollTop) + 'px';
    highlightDiv.style.left = (rect.left - panelRect.left + panel.scrollLeft) + 'px';
    highlightDiv.style.width = '100%';
    highlightDiv.style.height = rect.height + 'px';
    panel.appendChild(highlightDiv);
    target.style.background = 'transparent';
    target.style.position = 'relative';
    target.style.zIndex = 2;
    const overlay = document.createElement('div');
    overlay.className = 'panel-search-overlay';
    Object.assign(overlay.style, {
        position: 'absolute',
        top: '5px',
        right: '0',
        background: 'rgba(255,255,255,0.95)',
        padding: '4px 6px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    });
    const searchMain = document.createElement('div');
    const form = document.createElement('form');
    form.id = 'search__popupmain';
    Object.assign(searchMain.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        opacity: '0',
        transition: 'transform 0.3s ease, opacity 0.3s ease'
    });
    form.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') {
            e.preventDefault();
        }
    });
    const label = document.createElement('label');
    label.setAttribute('for', 'search__poptxt');
    label.textContent = 'Search: ';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'search__poptxt';
    input.placeholder = 'Search text...';
    Object.assign(input.style, { width: '200px', padding: '4px 8px', fontSize: '14px' });
    const prevBtn = document.createElement('button'); prevBtn.innerHTML = '⬆';
    const nextBtn = document.createElement('button'); nextBtn.innerHTML = '⬇';
    const counter = document.createElement('span');
    Object.assign(counter.style, { fontSize: '13px', color: '#333', display: 'none' });
    const closeBtn = document.createElement('button');
    closeBtn.className = 'search-close-btn';
    closeBtn.innerHTML = '✖';
    Object.assign(closeBtn.style, { background: 'transparent', border: 'none', fontSize: '14px', cursor: 'pointer' });
    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        highlightDiv.style.display = 'none';
        target.style.background = '';
        target.style.position = '';
        target.style.zIndex = '';
    });
    panel.appendChild(overlay);
    const searchCountEnd = document.createElement('div');
    searchCountEnd.className = 'panel__search__countend';
    Object.assign(searchCountEnd.style, {
        fontSize: '13px',
        color: 'red',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: 'translateY(-1px)'
    });
    form.append(label, input, prevBtn, nextBtn, counter, closeBtn);
    searchMain.appendChild(form);
    overlay.appendChild(searchMain);
    overlay.append(searchMain, searchCountEnd);
    requestAnimationFrame(() => {
        searchMain.style.transform = 'translateX(0)';
        searchMain.style.opacity = '1';
    });
    const noResultsSpan = document.createElement('span');
    noResultsSpan.textContent = 'No results';
    noResultsSpan.style.display = 'none';
    const endResultsSpan = document.createElement('span');
    endResultsSpan.textContent = 'You are at the end of search results!';
    endResultsSpan.style.display = 'none';
    searchCountEnd.append(noResultsSpan, endResultsSpan);
    input.focus();
    let matches = [];
    let currentIndex = -1;
    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function updateHighlightsiframe() {
        const term = input.value;
        matches = [];
        currentIndex = -1;
        counter.style.display = 'none';

        const rawText = getContent();

        if (!term) {
            if (!isTextarea) {
                target.innerHTML = escapeHtml(rawText);
            }
            return;
        }

        const regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi");
        let matchIndex = 0;
        let html = rawText.replace(regex, (m) => {
            matches.push({ index: matchIndex });
            const cls = (matchIndex === 0) ? "highlight-match current-match" : "highlight-match";
            matchIndex++;
            return `<span class="${cls}">${escapeHtml(m)}</span>`;
        });

        if (!isTextarea) {
            target.innerHTML = html;
        } else {
            let overlayHtml = "";
            let lastIndex = 0, match;
            regex.lastIndex = 0;
            while ((match = regex.exec(rawText)) !== null) {
                matches.push({ start: match.index, end: regex.lastIndex });
                overlayHtml += escapeHtml(rawText.substring(lastIndex, match.index));
                overlayHtml += `<span class="highlight-match">${escapeHtml(match[0])}</span>`;
                lastIndex = regex.lastIndex;
            }
            overlayHtml += escapeHtml(rawText.substring(lastIndex));
            highlightDiv.innerHTML = overlayHtml;
        }

        if (matches.length) {
            currentIndex = 0;
            highlightCurrentMatchiframe();
            counter.style.display = 'inline-block';
            counter.textContent = `${currentIndex + 1} / ${matches.length}`;
        } else {
            counter.style.display = 'none';
            showMessage('no-results');
        }
    }
    function highlightCurrentMatchiframe() {
        if (!matches.length) {
            counter.style.display = 'none';
            return;
        }
        (isTextarea ? highlightDiv : target)
            .querySelectorAll('.highlight-match.current-match')
            .forEach(el => el.classList.remove('current-match'));
        const spans = (isTextarea ? highlightDiv : target).querySelectorAll('.highlight-match');
        const span = spans[currentIndex];
        if (!span) return;
        span.classList.add('current-match');
        span.scrollIntoView({ block: "center", behavior: "smooth" });
        counter.textContent = `${currentIndex + 1} / ${matches.length}`;
    }
    function nextMatch() {
        if (!matches.length) return;
        currentIndex = (currentIndex + 1) % matches.length;
        highlightCurrentMatchiframe();
        input.focus({ preventScroll: true });
    }
    function prevMatch() {
        if (!matches.length) return;
        currentIndex = (currentIndex - 1 + matches.length) % matches.length;
        highlightCurrentMatchiframe();
        input.focus({ preventScroll: true });
    }
    function showMessage(type) {
        noResultsSpan.style.display = 'none';
        endResultsSpan.style.display = 'none';
        let span = null;
        if (type === 'no-results') span = noResultsSpan;
        if (type === 'end-results') span = endResultsSpan;
        if (!span) return;
        span.style.display = 'inline';
        span.style.opacity = '1';
        span.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        span.style.transform = 'translateY(0)';
        clearTimeout(span._timeout);
        span._timeout = setTimeout(() => {
            span.style.opacity = '0';
            span.style.transform = 'translateY(-8px)';
            setTimeout(() => { span.style.display = 'none'; }, 300);
        }, 2000);
    }
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!matches.length) {
                showMessage('no-results');
                return;
            }
            if (currentIndex < matches.length - 1) {
                currentIndex++;
                highlightCurrentMatchiframe();
            } else {
                currentIndex = matches.length - 1;
                highlightCurrentMatchiframe();
                showMessage('end-results');
            }
            input.focus({ preventScroll: true });
        }
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            hideAllPopups();
        }
    });
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        document.addEventListener('click', () => {
            hideAllPopups();
        });
    }
    function setupIframePopupCloser() {
        const iframe = document.querySelector('iframe');
        if (!iframe) return;
        document.addEventListener('click', e => {
            const rect = iframe.getBoundingClientRect();
            if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            ) {
                hideAllPopups();
            }
        });
        function attachInsideListener() {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDoc) return;
                iframeDoc.removeEventListener('click', hideAllPopups);
                iframeDoc.addEventListener('click', hideAllPopups);
            } catch (err) {
                console.warn("Cross-origin iframe - cannot attach click listener inside.", err);
            }
        }
        iframe.addEventListener('load', attachInsideListener);
        if (iframe.contentDocument?.readyState === 'complete') {
            attachInsideListener();
        }
    }
    setupIframePopupCloser();
    input.addEventListener('input', updateHighlightsiframe);
    nextBtn.addEventListener('click', nextMatch);
    prevBtn.addEventListener('click', prevMatch);
    target.addEventListener('scroll', () => {
        highlightDiv.scrollTop = target.scrollTop;
    });
    updateHighlightsiframe();
};



document.addEventListener('click', function (e) {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;

    const rect = iframe.getBoundingClientRect();
    const clickedOutside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;
    if (clickedOutside) {
        try {
            if (iframe.contentWindow?.removeSearchUI) {
                iframe.contentWindow.removeSearchUI();
            }
        } catch (err) {
            console.warn("Could not access iframe:", err);
        }
    }
});

$('body').on('click', '.editor-sidebar button', function () {
    var dataactive = $(this).attr('data-editor');
    $(this).addClass('active').siblings('button').removeClass('active');
    var container = $(this).closest('.editor-container');
    container.find('.editor-panel').removeClass('active');
    container.find('#' + dataactive).addClass('active');
});
window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    e.returnValue = "";
});
function loadScripts() {
    const editor = document.getElementById('js-editor');
    const functionsToInclude = [
        'attachResize',
        'CustomAppSlider'
    ];
    let combinedCode = '';
    functionsToInclude.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            combinedCode += window[funcName].toString() + '\n\n';
        }
    });
    if (typeof window.attachResize === 'function') {
        combinedCode += '$(".cuz__slider").each(function () {\n';
        combinedCode += '    CustomAppSlider($(this));\n';
        combinedCode += '});\n';
        combinedCode += '$(document).ready(function() {\n';
        combinedCode += '    CustomAppSlider();\n';
        combinedCode += '});\n';
    }
    editor.value = combinedCode;
}
async function typeWithBackspaceLoop(element, messages, typingSpeed = 50, pause = 800, stopFlag) {
    let currentMsg = 0;
    while (!stopFlag.ready) {
        const msg = messages[currentMsg];
        for (let i = 0; i < msg.length; i++) {
            element.textContent += msg[i];
            await new Promise(r => setTimeout(r, typingSpeed));
            if (stopFlag.ready) return;
        }
        await new Promise(r => setTimeout(r, pause));
        if (stopFlag.ready) return;
        for (let i = msg.length - 1; i >= 0; i--) {
            element.textContent = msg.slice(0, i);
            await new Promise(r => setTimeout(r, typingSpeed / 2));
            if (stopFlag.ready) return;
        }
        await new Promise(r => setTimeout(r, 200));
        currentMsg = (currentMsg + 1) % messages.length;
    }
}
async function typeOnce(element, message, typingSpeed = 50) {
    element.textContent = "";
    for (let i = 0; i < message.length; i++) {
        element.textContent += message[i];
        await new Promise(r => setTimeout(r, typingSpeed));
    }
    await new Promise(r => setTimeout(r, 1000));
}
async function loadAll() {
    const cacheBuster = Date.now();
    const pageLoader = document.getElementById('page-loader');
    const loadingMsg = document.getElementById('loading-message');
    const typingText = document.getElementById('main__typing--text');
    const editorContainer = document.querySelector('.editor-container');
    const siteHeader = document.querySelector('.siteheader');
    siteHeader.style.pointerEvents = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    pageLoader.style.display = 'flex';
    await new Promise(resolve => setTimeout(resolve, 500));
    pageLoader.style.display = 'none';
    loadingMsg.innerHTML = '';
    loadingMsg.style.display = 'flex';
    loadingMsg.style.flexDirection = 'column';
    loadingMsg.style.alignItems = 'center';
    loadingMsg.style.justifyContent = 'center';
    loadingMsg.style.gap = '10px';
    loadingMsg.style.opacity = '1';

    const readyIconfirstContainer = document.createElement('div');
    readyIconfirstContainer.className = 'loader__second';
    readyIconfirstContainer.innerHTML = `
    <div class="loading__slider__loader">
  <div class="loading__slider__track">
    <div class="loading__slider__slide">Please Wait</div>
    <div class="loading__slider__slide">Please Wait</div>
    <div class="loading__slider__slide">Please Wait</div>
    <div class="loading__slider__slide">Please Wait</div>
  </div>
  <div class="loading__slider__pagination">
    <span class="loading__dot"></span>
    <span class="loading__dot"></span>
    <span class="loading__dot"></span>
    <span class="loading__dot"></span>
  </div>
</div>
`;
    loadingMsg.appendChild(readyIconfirstContainer);
    typingText.textContent = '';
    loadingMsg.appendChild(typingText);
    const stopFlag = { ready: false };
    const typingLoop = typeWithBackspaceLoop(
        typingText,
        ["Please wait, the content is loading...", "We are fetching the content..."],
        50,
        800,
        stopFlag
    );
    const cssEditor = document.getElementById('css-editor');
    const cssUrl = `https://vinoth-elito.github.io/vinoth-sliders/css/preview.css?v=${cacheBuster}`;
    try {
        const res = await fetch(cssUrl, { cache: 'no-store' });
        cssEditor.value = await res.text();
        updatePreview();
    } catch (e) {
        cssEditor.value = `/* Failed to load CSS: ${e.message} */`;
    }
    const htmlEditor = document.getElementById('html-editor');
    const rows = [
        [
            `https://raw.githubusercontent.com/vinoth-elito/vinoth-sliders/main/slider1.html?v=${cacheBuster}`,

            `https://raw.githubusercontent.com/vinoth-elito/vinoth-sliders/main/slider2.html?v=${cacheBuster}`
        ],
        [
            `https://raw.githubusercontent.com/vinoth-elito/vinoth-sliders/main/slider3.html?v=${cacheBuster}`,
            `https://raw.githubusercontent.com/vinoth-elito/vinoth-sliders/main/slider4.html?v=${cacheBuster}`
        ],
        [
            `https://raw.githubusercontent.com/vinoth-elito/vinoth-sliders/main/slider5.html?v=${cacheBuster}`,
            `https://raw.githubusercontent.com/vinoth-elito/vinoth-sliders/main/slider6.html?v=${cacheBuster}`
        ],
        [
            `https://raw.githubusercontent.com/vinoth-elito/vinoth-sliders/main/slider7.html?v=${cacheBuster}`
        ]

    ];
    let finalHTML = '';
    for (let i = 0; i < rows.length; i++) {
        let style = i != 0 ? ' style="justify-content:left;margin-top:30px;"' : '';
        let rowHTML = `<div class="input__row"${style}>\n`;
        for (let file of rows[i]) {
            try {
                const res = await fetch(file, { cache: 'no-store' });
                const html = await res.text();
                rowHTML += `${html}\n`;
            } catch (e) {
                rowHTML += `<!-- Failed to load ${file} -->\n`;
            }
        }
        rowHTML += '</div>\n';
        finalHTML += rowHTML;
    }
    htmlEditor.value = finalHTML;
    updatePreview();

    await new Promise(resolve => {
        const interval = setInterval(() => {
            const allReady = ['attachResize', 'CustomAppSlider']
                .every(fn => typeof window[fn] === 'function');
            if (allReady) {
                clearInterval(interval);
                resolve();
            }
        }, 50);
    });

    loadScripts();
    stopFlag.ready = true;
    await typingLoop;
    loadingMsg.innerHTML = '';
    loadingMsg.style.display = 'flex';
    loadingMsg.style.flexDirection = 'column';
    loadingMsg.style.alignItems = 'center';
    loadingMsg.style.justifyContent = 'center';
    loadingMsg.style.gap = '10px';
    const readyIconContainer = document.createElement('div');
    readyIconContainer.className = 'loader__second';
    readyIconContainer.innerHTML = `
<div class="slider-loader-drag">
  <div class="load__hand">&#128070;</div>
  <div class="load__slider__track">
    <div class="load__slider__slide">1</div>
    <div class="load__slider__slide">2</div>
    <div class="load__slider__slide">3</div>
    <div class="load__slider__slide">4</div>
    <div class="load__slider__slide">5</div>
    <div class="load__slider__slide">6</div>
    <div class="load__slider__slide">7</div>
    <div class="load__slider__slide">8</div>
    <div class="load__slider__slide">9</div>
    <div class="load__slider__slide">10</div>
    <div class="load__slider__slide">11</div>
    <div class="load__slider__slide">12</div>
  </div>
</div>
`;
    loadingMsg.appendChild(readyIconContainer);
    typingText.textContent = '';
    loadingMsg.appendChild(typingText);
    await typeOnce(typingText, "The content is ready for view, thanks for your patience", 50);
    $(loadingMsg).fadeOut(500);
    $(editorContainer).css('visibility', 'visible').hide().fadeIn(500);
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    siteHeader.style.pointerEvents = '';
}
window.onload = loadAll;