//
function loadComponent(url, elementId) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${url}`);
      return res.text();
    })
    .then(html => {
      const container = document.getElementById(elementId);

      if (!container) return;

      container.innerHTML = html;

      container.querySelectorAll("script").forEach(oldScript => {
        const newScript = document.createElement("script");
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
        oldScript.remove();
      });
    })
    .catch(err => console.error(err));
}

const path = window.location.pathname;

const isSubPage =
  path.includes('/cars/') ||
  path.includes('/races/') ||
  path.includes('/calculator/');

const componentPath = isSubPage
  ? '../components/'
  : 'components/';

loadComponent(componentPath + 'navbar.html', 'navbar');
loadComponent(componentPath + 'footer.html', 'footer');
