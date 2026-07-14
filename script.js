(function () {
    // Note the need to initialize this right away for some reason
    // (this cannot wait until the "load" event in particular)
    const player = window.Stream ? window.Stream(document.getElementById('videoplayer')) : null;

    var createEl = function (tagName, attrs) {
        var anchor = document.createElement(tagName);
        Object.keys(attrs).forEach(function (key) {
            anchor[key] = attrs[key];
        });
        return anchor;
    };

    var createAnchorFromHeading = function (headingEl) {
        let id;
        if (headingEl.id) {
            id = headingEl.id;
        }
        else {
            const section = headingEl.closest('section');
            id = section.id;
        }
        return createEl(
            "a",
            {
                className: "ref",
                href: "#" + id,
                textContent: "#",
                title: headingEl.textContent
            }
        );
    };

    window.addEventListener("load", function () {
        const agendaTabs = document.querySelector('[data-agenda-tabs]');
        if (agendaTabs) {
            const tabs = [...agendaTabs.querySelectorAll('[data-agenda-tab]')];
            const panels = tabs.map(tab => document.getElementById(tab.getAttribute('data-agenda-tab')));

            const activateTab = function (index, moveFocus) {
                tabs.forEach(function (tab, tabIndex) {
                    const isActive = tabIndex === index;
                    tab.setAttribute('aria-selected', String(isActive));
                    tab.setAttribute('tabindex', isActive ? '0' : '-1');
                    panels[tabIndex].hidden = !isActive;
                });
                if (moveFocus) tabs[index].focus();
            };

            agendaTabs.setAttribute('role', 'tablist');
            agendaTabs.setAttribute('aria-label', 'Workshop days');
            agendaTabs.hidden = false;
            agendaTabs.closest('.workshop-agenda').classList.add('tabs-active');

            tabs.forEach(function (tab, index) {
                const panel = panels[index];
                const dayHeading = panel.querySelector('h2');
                tab.id = 'tab-' + panel.id;
                tab.setAttribute('role', 'tab');
                tab.setAttribute('aria-controls', panel.id);
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', tab.id);
                dayHeading.hidden = true;

                tab.addEventListener('click', function () {
                    activateTab(index, false);
                });

                tab.addEventListener('keydown', function (event) {
                    let nextIndex = index;
                    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
                    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
                    else if (event.key === 'Home') nextIndex = 0;
                    else if (event.key === 'End') nextIndex = tabs.length - 1;
                    else return;

                    event.preventDefault();
                    activateTab(nextIndex, true);
                });
            });

            const hashTarget = window.location.hash && document.querySelector(window.location.hash);
            const initialIndex = hashTarget && hashTarget.closest('#day-2') ? 1 : 0;
            activateTab(initialIndex, false);
        }

        Array.prototype.forEach.call(document.querySelectorAll("main section[id] h1, main section[id] h2, main section[id] h3, main section[id] h4, main section[id] h5"), function (el) {
            var a = createAnchorFromHeading(el);
            el.classList.add("has-ref");
            el.addEventListener("click", function () {
                a.click();
            });
            el.insertBefore(a, el.firstChild);
        });

        const toggle = document.querySelector('[data-action=toggle]');
        const toggling = {};
        if (toggle) {
            const button = document.createElement('button');
            button.innerHTML = 'Expand position statements ▶';
            button.setAttribute('data-action', 'expand');
            toggle.appendChild(button);

            button.addEventListener('click', _ => {
                if (button.getAttribute('data-action') === 'expand') {
                    button.setAttribute('data-action', 'collapse');
                    button.innerHTML = 'Collapse position statements ▼';
                    [...document.querySelectorAll('details.paper')].forEach(paper => {
                        toggling[paper.id] = true;
                        if (!paper.hasAttribute('open')) {
                            paper.setAttribute('open', '');
                        }
                    });
                }
                else {
                    button.setAttribute('data-action', 'expand');
                    button.innerHTML = 'Expand position statements ▶';
                    [...document.querySelectorAll('details.paper')].forEach(paper => {
                        toggling[paper.id] = true;
                        if (paper.hasAttribute('open')) {
                            paper.removeAttribute('open');
                        }
                    });
                }
            });
        }

        for (const paper of [...document.querySelectorAll('details.paper')]) {
            paper.addEventListener('toggle', _ => {
              if (paper.open && !toggling[paper.id]) {
                window.location.hash = '#' + paper.id;
              }
              toggling[paper.id] = false;
            });
        }

        const hash = window.location.hash;
        if (hash) {
            const hashDetails = document.querySelector(`details${hash}`);
            if (hashDetails) {
                if (!hashDetails.hasAttribute('open')) {
                    hashDetails.setAttribute('open', '');
                }
            }
            else {
                const pos = hash.lastIndexOf('-');
                const prefix = pos > 0 ? hash.substring(0, pos) : hash;
                const el = document.querySelector(`details${prefix}`);
                if (el) {
                    if (!el.hasAttribute('open')) {
                        toggling[el.id] = true;
                        el.setAttribute('open', '');
                    }
                    if (el && hash !== prefix) {
                        const hashEl = document.querySelector(hash);
                        if (hashEl) {
                            hashEl.scrollIntoView();
                        }
                    }
                }
            }
        }

        if (window.Stream) {
            const playParagraphs = [...document.querySelectorAll('p[data-start]')];
            for (const p of playParagraphs) {
                const button = document.createElement('button');
                button.innerText = '▶️';
                button.setAttribute('title', 'Play talk at this position');
                p.insertBefore(button, p.firstChild);
                button.addEventListener('click', evt => {
                    if (player.paused) {
                        player.play();
                    }
                    player.currentTime = parseFloat(p.getAttribute('data-start'));
                    return true;
                });
            }
        }
    });
})();
