/**
 * @name twitch-embed
 * @author dwuuup
 * @description Watch twitch stream on discord through an embeded window
 * @version 1.4
 */

module.exports = class MyPlugin {
  constructor(meta) {
    this.streamUser = 'duccw';
    this.eventListeners = [];
    this.timeouts = {};
  }

  start() {
    this.createOpenStreamElement();
  }

  stop() {
    this.removeTwitchEmbed();
    this.removeOpenStreamElement();
    this.removeListeners();
    this.removeAnimationStyle();
    this.removeOpenAniamtionStyle();
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
    element.id = 'twitch-embed-max';
    element.style.position = 'absolute';
    element.style.display = 'flex';
    element.style.width = '52px';
    element.style.height = '52px';
    element.style.bottom = '10px';
    element.style.right = '10px';
    element.style.borderRadius = '26px';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.backgroundColor = '#6441A5';
    element.style.boxShadow = 'rgba(0, 0, 0, 0.35) 0px 5px 15px';
    element.style.zIndex = '21';

    const img = document.createElement('img');
    img.src = 'https://www.pngmart.com/files/22/Twitch-Logo-PNG-Transparent.png';
    img.width = '30';
    img.height = '30';

    const openButtonAnimation = document.createElement('style');
    openButtonAnimation.id = 'twitch-embed-open-animation-style';

    openButtonAnimation.textContent = `
      @keyframes openButtonAnimation {
        30% {
          transform: scale(1.06);
        }
        100% {
          transform: scale(1);
        }
      }

      .open-animation {
        animation: openButtonAnimation 400ms ease-in-out;
      }

      @keyframes userInputAnimationOut {
        0% {
          width: 10px;
        }
        70% {
          width: 205px;
        }
        100% {
          width: 200px;
        }
      }

      .user-animation-out {
        animation: userInputAnimationOut 200ms ease-in-out;
      }

      @keyframes userInputAnimationIn {
        0% {
          width: 200px;
        }
        100% {
          width: 10px;
        }
      }

      .user-animation-in {
        animation: userInputAnimationIn 200ms ease-in-out;
      }
    `;

    root.append(openButtonAnimation);

    const usernameContainer = document.createElement('div');
    usernameContainer.id = 'twitch-embed-user';
    usernameContainer.style.position = 'absolute';
    usernameContainer.style.display = 'flex';
    usernameContainer.style.backgroundColor = '#0B0516';
    usernameContainer.style.borderTopLeftRadius = '26px';
    usernameContainer.style.borderBottomLeftRadius = '26px';
    usernameContainer.style.width = '10px';
    usernameContainer.style.height = '40px';
    usernameContainer.style.bottom = '15px';
    usernameContainer.style.right = '34px';
    usernameContainer.style.transformOrigin = 'center right';
    usernameContainer.style.overflow = 'hidden';
    usernameContainer.style.boxShadow = 'rgba(0, 0, 0, 0.35) 0px 5px 15px';
    usernameContainer.style.zIndex = '20';

    const usernameInput = document.createElement('input');
    usernameInput.id = 'twitch-embed-user';
    usernameInput.style.margin = '4px';
    usernameInput.style.borderRadius = '22px';
    usernameInput.style.border = '2px solid #402A6B';
    usernameInput.style.padding = '10px';
    usernameInput.style.backgroundColor = '#000000';
    usernameInput.style.color = '#FFFFFF';
    usernameInput.style.width = '140px';
    usernameInput.style.textAlign = 'center';
    usernameInput.style.fontSize = '16px';
    usernameInput.placeholder = 'Channel';
    usernameInput.value = this.streamUser;


    usernameContainer.append(usernameInput);

    const handleOpenClick = () => {
      self.createTwitchEmbed();
      self.removeAnimationStyle();
      element.style.visibility = 'hidden';
      usernameContainer.style.visibility = 'hidden';
    }

    const handleOpenHover = (e) => {
      element.classList.add('open-animation');
    }

    const handleOpenUnhover = (e) => {
      element.classList.remove('open-animation');
    }


    let isUsernameShow = false;

    const handleUserShow = (e) => {
      isUsernameShow = isUsernameShow === false;

      if (isUsernameShow) {
        usernameContainer.classList.add('user-animation-out');
        usernameContainer.classList.remove('user-animation-in');
        usernameContainer.style.width = '200px';

        return;
      }

      usernameContainer.classList.remove('user-animation-out');
      usernameContainer.classList.add('user-animation-in');
      usernameContainer.style.width = '25px';
    }

    const handleInputChange = (e) => {
      const regex = /([a-zA-z0-9\_\-]*)/s;

      const value = e.target.value;

      if (value === null) {
        return '';
      }

      const match = value.match(regex);

      this.streamUser = match !== null ? match[0]: this.streamUser;

      usernameInput.value = this.streamUser;
    }

    this.addListener(element, 'mouseover', handleOpenHover);
    this.addListener(element, 'mouseout', handleOpenUnhover);

    this.addListener(element, 'click', handleOpenClick);
    this.addListener(element, 'contextmenu', handleUserShow);

    this.addListener(usernameInput, 'input', handleInputChange);

    element.append(img);

    root.append(usernameContainer);
    root.append(element);
  }

  removeOpenStreamElement() {
    const element = document.getElementById('twitch-embed-max');

    if (element) {
      element.remove();
    }

    const userElement = document.getElementById('twitch-embed-user');

    if (userElement) {
      userElement.remove();
    }
  }

  createTwitchEmbed() {
    const self = this;

    const root = document.getElementById("app-mount");

    const container = document.createElement("div");
    container.id = 'twitch-embed-container';

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
    container.style.resize = 'both';
    container.style.minWidth = '322px';
    container.style.minHeight = '202px';
    container.style.boxShadow = 'rgba(0, 0, 0, 0.35) 0px 5px 15px';
    container.style.border = '1px solid #111111';

    container.style.maxWidth = '100%';
    container.style.maxHeight = '100%'
    
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
    header.id = 'twitch-embed-header';
    header.style.display = 'flex';
    header.style.height = '20px';
    header.style.width = '100%';
    header.style.backgroundColor = '#000000';
    header.style.overflow = 'hidden';

    var offsetX, offsetY, isDragging = false;

    header.append(headerDrag);
    header.append(minimize);

    const twitchEmbed = document.createElement("iframe");
    twitchEmbed.src = "https://player.twitch.tv/?channel=" + this.streamUser + "&parent=discord.com&muted=true&theme=dark";
    twitchEmbed.height = "360px";
    twitchEmbed.width = "640px";
    twitchEmbed.allowFullscreen = true;

    const handleMinimizeClick = () => {
      self.removeTwitchEmbed()

      const max = document.getElementById('twitch-embed-max');
      max.style.visibility = 'visible';

      const user = document.getElementById('twitch-embed-user');
      user.style.visibility = 'visible';
    }

    this.addListener(minimize, 'click', handleMinimizeClick);

    container.append(header);
    container.append(twitchEmbed);

    const twitchEmbedDragOverlay = document.createElement('div');
    twitchEmbedDragOverlay.style.position = 'absolute';
    twitchEmbedDragOverlay.style.top = '20px';
    twitchEmbedDragOverlay.style.left = '0px';
    twitchEmbedDragOverlay.style.height = "360px";
    twitchEmbedDragOverlay.style.width = "640px";
    twitchEmbedDragOverlay.style.display = 'none';

    container.append(twitchEmbedDragOverlay);

    const popUpStyle = document.createElement('style');
    popUpStyle.id = 'twitch-embed-animation-style';

    popUpStyle.textContent = `
      @keyframes popUpAnimation {
        0% {
          transform: scale(0.8);
        }
        60% {
          transform: scale(1.02);
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

    const handleRemoveDragOverlay = () => {
      twitchEmbedDragOverlay.style.display = 'none';
    }

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

        twitchEmbedDragOverlay.style.display = 'block';

        self.resetableTimeout('drag', handleRemoveDragOverlay, 500);
      }
    }
  
    this.addListener(document, 'mousemove', handleMouseMove);

    const handleMouseUp = (e) => {
      isDragging = false;
  
      headerDrag.style.cursor = 'grab';
    }

    this.addListener(document, 'mouseup', handleMouseUp);

    const handleResize = (e) => {
      const rect = container.getBoundingClientRect();

      twitchEmbed.width = rect.width - 2 + 'px';
      twitchEmbed.height = rect.height - 22 + 'px';
      twitchEmbedDragOverlay.style.width = twitchEmbed.width;
      twitchEmbedDragOverlay.style.height = twitchEmbed.height;
      twitchEmbedDragOverlay.style.display = 'block';


      self.resetableTimeout('drag', handleRemoveDragOverlay, 500);
    }
    
    setTimeout(() => {new ResizeObserver(handleResize).observe(container)}, 1000);


    root.append(container);
  }

  removeTwitchEmbed() {
    const element = document.getElementById('twitch-embed-container');

    if (element) {
      element.remove();
    }
  }

  removeAnimationStyle() {
    const style = document.getElementById('twitch-embed-animation-style');

    if (style) {
      style.remove();
    }
  }

  removeOpenAniamtionStyle() {
    const style = document.getElementById('twitch-embed-open-animation-style');

    if (style) {
      style.remove();
    }
  }

  resetableTimeout(key, func, timeMs) {
    let previousTimeout = key in this.timeouts ? this.timeouts[key] : null;

    if (previousTimeout) {
      clearTimeout(previousTimeout)
    }

    this.timeouts[key] = setTimeout(func, timeMs);
  }

};