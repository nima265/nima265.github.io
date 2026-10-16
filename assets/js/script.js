'use strict';

const tabs = [...document.querySelectorAll('[data-tab]')];
const panels = [...document.querySelectorAll('[data-panel]')];
const revealItems = [...document.querySelectorAll('[data-reveal]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealPanel(panel) {
  panel.querySelectorAll('[data-reveal]').forEach((item, index) => {
    window.setTimeout(() => item.classList.add('is-visible'), Math.min(index * 65, 260));
  });
}

function activateTab(name, { updateHash = true, focus = false } = {}) {
  const selectedTab = tabs.find((tab) => tab.dataset.tab === name) || tabs[0];
  const selectedName = selectedTab.dataset.tab;

  tabs.forEach((tab) => {
    const selected = tab === selectedTab;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  panels.forEach((panel) => {
    const selected = panel.dataset.panel === selectedName;
    panel.hidden = !selected;
    panel.classList.toggle('is-active', selected);
    if (selected) revealPanel(panel);
  });

  if (updateHash && window.location.hash !== `#${selectedName}`) {
    window.history.replaceState(null, '', `#${selectedName}`);
  }
  if (updateHash) window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  if (focus) selectedTab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  tab.addEventListener('keydown', (event) => {
    let nextIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex !== undefined) {
      event.preventDefault();
      activateTab(tabs[nextIndex].dataset.tab, { focus: true });
    }
  });
});

document.querySelectorAll('[data-open-tab]').forEach((button) => {
  button.addEventListener('click', () => activateTab(button.dataset.openTab));
});

window.addEventListener('hashchange', () => {
  const target = window.location.hash.slice(1);
  if (tabs.some((tab) => tab.dataset.tab === target)) activateTab(target, { updateHash: false });
});

const filters = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('[data-project]')];
filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const category = filter.dataset.filter;
    filters.forEach((button) => {
      const selected = button === filter;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    projects.forEach((project) => {
      project.hidden = category !== 'all' && project.dataset.category !== category;
    });
  });
});

if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const requestedTab = window.location.hash.slice(1);
activateTab(requestedTab, { updateHash: false });
