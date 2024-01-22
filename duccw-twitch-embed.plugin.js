/**
 * @name duccw-twitch-embed
 * @author dwuuup
 * @description Watch duccW's twitch stream on discord through an embeded window
 * @version 1.2
 */

module.exports = class MyPlugin {
  constructor(meta) {
    this.streamUser = 'duccw';
    this.eventListeners = [];
  }

  start() {
    this.createOpenStreamElement();
  }

  stop() {
    this.removeTwitchEmbed();
    this.removeOpenStreamElement();
    this.removeListeners();
  }

  // This makes listener cleanup easier
  addListener(element, type, callback) {
    element.addEventListener(type, callback);

    const listener = {
      element: element,
      type: type,
      callback: callback
    }

    this.eventListeners.push(listener);
  }

  removeListeners() {
    this.eventListeners.forEach((listener) => {
      listener.element.removeEventListener(listener.type, listener.callback);
    });
  }

  createOpenStreamElement() {
    const self = this;

    const root = document.getElementById("app-mount");

    const element = document.createElement('button');
    element.id = 'duccw-twitch-embed-max';
    element.style.position = 'absolute';
    element.style.display = 'flex';
    element.style.width = '52px';
    element.style.height = '52px';
    element.style.bottom = '10px';
    element.style.right = '10px';
    element.style.borderRadius = '26px';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.backgroundColor = '#1B8748';

    const img = document.createElement('img');
    img.src = 'https://static-cdn.jtvnw.net/jtv_user_pictures/9301298f-f6e6-4498-b97e-aa9c69c7fe3c-profile_image-70x70.png';
    img.width = '40';
    img.height = '40';

    const handleStartClick = () => {
      self.createTwitchEmbed();
      element.style.visibility = 'hidden';
    }

    element.append(img);
    root.append(element);

    this.addListener(element, 'click', handleStartClick);
  }

  removeOpenStreamElement() {
    const element = document.getElementById('duccw-twitch-embed-max');

    if (element) {
      element.remove();
    }
  }

  createTwitchEmbed() {
    const self = this;

    const root = document.getElementById("app-mount");

    const container = document.createElement("div");
    container.id = 'duccw-twitch-embed-container';

    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.position = 'absolute';
    container.style.top = 'calc(100% - 380px - 20px)';
    container.style.left = 'calc(100% - 640px - 20px)';
    container.style.backgroundColor = '#ffffff';
    container.style.borderRadius = '10px';
    container.style.overflow = 'hidden';
    container.style.zIndex = '100';
    container.style.backgroundColor = '#000000';
    /*
    transform: scale(0.6);
  transition: opacity 250ms 250ms ease, transform 300ms 
    */
    
    const minimize = document.createElement('button');
    minimize.style.width = '40px';
    minimize.style.height = '20px';
    minimize.style.backgroundColor = '#000000';
    minimize.style.fontSize = '14px';
    minimize.style.color = '#ffffff';
    minimize.textContent = 'x';

    const handleMinimizeHover = (e) => {
      minimize.style.backgroundColor = '#222222';
    }

    const handleMinimizeUnhover = (e) => {
      minimize.style.backgroundColor = '#000000';
    }

    this.addListener(minimize, 'mouseover', handleMinimizeHover);
    this.addListener(minimize, 'mouseout', handleMinimizeUnhover);

    const headerDrag = document.createElement("div");
    headerDrag.style.height = '20px';
    headerDrag.style.width = 'calc(100% - 40px)';
    headerDrag.style.cursor = 'grab';
    headerDrag.style.zIndex = '101';

    const header = document.createElement("div");
    header.id = 'duccw-twitch-embed-header';
    header.style.display = 'flex';
    header.style.height = '20px';
    header.style.width = '100%';
    header.style.backgroundColor = '#000000';

    var offsetX, offsetY, isDragging = false;

    const handleHeaderPress = (e) => {
      isDragging = true;
  
      offsetX = e.clientX - container.getBoundingClientRect().left;
      offsetY = e.clientY - container.getBoundingClientRect().top;

      headerDrag.style.cursor = 'grabbing';
    }

    this.addListener(headerDrag, 'mousedown', handleHeaderPress);

    const handleMouseMove = (e) => {
      if (isDragging) {
        var newX = e.clientX - offsetX;
        var newY = e.clientY - offsetY;

        if (newX < 0) {
          newX = 0;
        }
        
        if (newY < 20) {
          newY = 20;
        }

        if (newX > root.getBoundingClientRect().width - container.getBoundingClientRect().width) {
          newX = root.getBoundingClientRect().width - container.getBoundingClientRect().width
        }

        if (newY > root.getBoundingClientRect().height - 20) {
          newY = root.getBoundingClientRect().height - 20;
        }
  
        container.style.left = newX + 'px';
        container.style.top = newY + 'px';
      }
    }
  
    this.addListener(document, 'mousemove', handleMouseMove);

    const handleMouseUp = (e) => {
      isDragging = false;
  
      headerDrag.style.cursor = 'grab';
    }

    this.addListener(document, 'mouseup', handleMouseUp);

    header.append(headerDrag);
    header.append(minimize);

    const twitchEmbed = document.createElement("iframe");
    twitchEmbed.src = "https://player.twitch.tv/?channel=" + this.streamUser + "&parent=discord.com&muted=true&theme=dark";
    twitchEmbed.height = "360px";
    twitchEmbed.width = "640px";
    twitchEmbed.allowFullscreen = true;

    const handleMinimizeClick = () => {
      self.removeTwitchEmbed()

      const max = document.getElementById('duccw-twitch-embed-max');
      max.style.visibility = 'visible';
    }

    this.addListener(minimize, 'click', handleMinimizeClick);

    container.append(header);
    container.append(twitchEmbed);

    const popUpStyle = document.createElement('style');

    popUpStyle.textContent = `
      @keyframes popUpAnimation {
        0% {
          transform: scale(0.8);
        }
        60% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }

      .pop-up {
        animation: popUpAnimation 300ms ease-in-out;
      }
    `;

    root.appendChild(popUpStyle);
    container.classList.add('pop-up');

    root.append(container);
  }

  removeTwitchEmbed() {
    const element = document.getElementById('duccw-twitch-embed-container');

    if (element) {
      element.remove();
    }
  }

};