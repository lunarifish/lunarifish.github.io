import { links } from "./links.js";

const linkContainer = document.getElementById("links");

function addLink(name, link, icon) {
    return ` 
    <a href="${link}" class="link" target="blank" rel="noopener"> 
    ${icon}
    <span>${name}</span> 
    <div>&ensp;&ensp;&ensp;</div>
    </a>
  `;
}

let allLinks = "";

links.forEach((ele) => {
    let link = ele.link;
    let name = ele.name;
    let icon = ele.icon;

    allLinks += addLink(name, link, icon);
});

linkContainer.innerHTML = allLinks;