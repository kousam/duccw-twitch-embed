/**
 * @name twitch-embed
 * @author dwuuup
 * @description Watch twitch stream on discord through an embeded window
 * @version 1.4
 * @source https://github.com/kousam/twitch-embed
 */

module.exports = class MyPlugin {
  constructor(meta) {
    this.streamUser = 'duccw';
    this.eventListeners = [];
    this.timeouts = {};
  }

  start() {
    this.createStyleElement();
    this.createOpenStreamElement();
  }

  stop() {
    this.removeTwitchEmbed();
    this.removeOpenStreamElement();
    this.removeListeners();
    this.removeStyleElement();
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

  resetableTimeout(key, func, timeMs) {
    let previousTimeout = key in this.timeouts ? this.timeouts[key] : null;

    if (previousTimeout) {
      clearTimeout(previousTimeout)
    }

    this.timeouts[key] = setTimeout(func, timeMs);
  }

  createOpenStreamElement() {
    const self = this;

    const root = document.getElementById("app-mount");

    const element = document.createElement('button');
    element.id = 'twitch-embed-open';

    const img = document.createElement('img');
    img.src = 'https://www.pngmart.com/files/22/Twitch-Logo-PNG-Transparent.png';
    img.width = '30';
    img.height = '30';

    const usernameContainer = document.createElement('div');
    usernameContainer.id = 'twitch-embed-user';
    usernameContainer.classList.add('twitch-embed-user-initial');

    const usernameInput = document.createElement('input');
    usernameInput.id = 'twitch-embed-user-input';
    usernameInput.placeholder = 'Channel';
    usernameInput.value = this.streamUser;

    usernameContainer.append(usernameInput);

    const handleOpenClick = () => {
      self.createTwitchEmbed();
      element.style.visibility = 'hidden';
      usernameContainer.style.visibility = 'hidden';
    }


    let isUsernameShow = false;

    const handleUserShow = (e) => {
      isUsernameShow = isUsernameShow === false;

      if (isUsernameShow) {
        usernameContainer.classList.add('twitch-embed-user-show');
        usernameContainer.classList.remove('twitch-embed-user-hide');
        usernameContainer.classList.remove('twitch-embed-user-initial');

        return;
      }
      usernameContainer.classList.remove('twitch-embed-user-show');
      usernameContainer.classList.add('twitch-embed-user-hide');
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

    this.addListener(element, 'click', handleOpenClick);
    this.addListener(element, 'contextmenu', handleUserShow);

    this.addListener(usernameInput, 'input', handleInputChange);

    element.append(img);

    root.append(usernameContainer);
    root.append(element);
  }

  removeOpenStreamElement() {
    const element = document.getElementById('twitch-embed-open');

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
    
    const closeButton = document.createElement('button');
    closeButton.id = 'twitch-embed-close';
    closeButton.textContent = 'x';
    closeButton.style.visibility = 'hidden';

    const header = document.createElement("div");
    header.id = 'twitch-embed-header';

    const handleHeaderHover = (e) => {
      closeButton.style.visibility = 'visible';
    }

    const handleHeaderUnHover = (e) => {
      closeButton.style.visibility = 'hidden';
    }

    this.addListener(header, 'mouseover', handleHeaderHover);
    this.addListener(header, 'mouseout', handleHeaderUnHover);

    var offsetX, offsetY, isDragging = false;

    header.append(closeButton);

    const twitchEmbed = document.createElement("iframe");
    twitchEmbed.id = 'twitch-embed';
    twitchEmbed.src = "https://player.twitch.tv/?channel=" + this.streamUser + "&parent=discord.com&muted=true&theme=dark";
    twitchEmbed.height = "360px";
    twitchEmbed.width = "640px";
    twitchEmbed.allowFullscreen = false;

    const handleMinimizeClick = () => {
      self.removeTwitchEmbed()

      const openElement = document.getElementById('twitch-embed-open');
      openElement.style.visibility = 'visible';

      const user = document.getElementById('twitch-embed-user');
      user.style.visibility = 'visible';
    }

    this.addListener(closeButton, 'click', handleMinimizeClick);

    container.append(twitchEmbed);
    container.append(header);

    const twitchEmbedDragOverlay = document.createElement('div');
    twitchEmbedDragOverlay.id = 'twitch-embed-drag-overlay';

    container.append(twitchEmbedDragOverlay);

    container.classList.add('pop-up');

    const handleRemoveDragOverlay = () => {
      twitchEmbedDragOverlay.style.display = 'none';
    }

    const handleHeaderPress = (e) => {
      isDragging = true;
  
      offsetX = e.clientX - container.getBoundingClientRect().left;
      offsetY = e.clientY - container.getBoundingClientRect().top;

      header.classList.remove('twitch-embed-header-drag-false');
      header.classList.add('twitch-embed-header-drag-true');
    }

    this.addListener(header, 'mousedown', handleHeaderPress);

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

        if (newY > root.getBoundingClientRect().height - container.getBoundingClientRect().height) {
          newY = root.getBoundingClientRect().height - container.getBoundingClientRect().height;
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
  
      header.classList.add('twitch-embed-header-drag-false');
      header.classList.remove('twitch-embed-header-drag-true');
    }

    this.addListener(document, 'mouseup', handleMouseUp);

    const handleResize = (e) => {
      const rect = container.getBoundingClientRect();

      twitchEmbed.width = rect.width - 2 + 'px';
      twitchEmbed.height = rect.height - 2 + 'px';
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

  createStyleElement() {
    const style = `
    @keyframes openButtonAnimation {
      30% {
        transform: scale(1.06);
      }
      100% {
        transform: scale(1);
      }
    }

    #twitch-embed-open {
      position: absolute;
      displat: flex;
      width: 52px;
      height: 52px;
      bottom: 10px;
      right: 10px;
      border-radius: 26px;
      align-items: center;
      justify-content: center;
      background-color: #6441A5;
      box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
      z-index: 21;
    }

    #twitch-embed-open:hover {
      animation: openButtonAnimation 400ms ease-in-out;
    }
    
    #twitch-embed-user {
      position: absolute;
      display: flex;
      background-color: #0B0516;
      border-top-left-radius: 26px;
      border-bottom-left-radius: 26px;
      height: 40px;
      bottom: 15px;
      right: 34px;
      transform-origin: center right;
      overflow: hidden;
      box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
      z-index: 20;
    }

    #twitch-embed-user-input {
      margin: 4px;
      border-radius: 22px;
      border: 2px solid #402A6B;
      padding: 10px;
      background-color: #000000;
      color: #FFFFFF;
      width: 140px;
      text-align: center;
      font-size: 16px;
    }

    @keyframes userInputAnimationShow {
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

    @keyframes userInputAnimationHide {
      0% {
        width: 200px;
      }
      100% {
        width: 10px;
      }
    }

    .twitch-embed-user-initial {
      width: 10px;
    }

    .twitch-embed-user-show {
      width: 200px;
      animation: userInputAnimationShow 200ms ease-in-out;
    }

    .twitch-embed-user-hide {
      width: 10px;
      animation: userInputAnimationHide 200ms ease-in-out;
    }

    #twitch-embed-container {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: calc(100% - 380px);
      left: calc(100% - 660px);
      background-color: #000000;
      border-radius: 10px;
      overflow: hidden;
      z-index: 100;
      resize: both;
      width: 640px;
      height: 360px;
      min-width: 322px;
      min-height: 202px;
      box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
      border: 1px solid #111111;
      max-width: 100%;
      max-height: 100%;
    }

    #twitch-embed-close {
      position: absolute;
      top: 0px;
      right: 0px;
      width: 40px;
      height: 36px;
      background-color: transparent;
      font-size: 24px;
      color: #FFFFFF;
      z-index: 101;
      border-radius: 10px;
      text-align: center;
      padding-left: 7px;
    }

    .twitch-embed-header-drag-true {
      cursor: grab;
    }

    .twitch-embed-header-drag-false {
      cursor: grabbing;
    }

    @keyframes headerAnimation {
      0% {
        background-position: 0 100%;
      }
      100% {
        background-position: 0 0;
      }
    }

    @keyframes headerAnimationHide {
      0% {
        background-position: 0 0;
      }
      100% {
        background-position: 0 100%;
      }
    }

    #twitch-embed-header {
      display: flex;
      position: absolute;
      height: 40px;
      width: 100%;
      overflow: hidden;
      cursor: grab;
      z-index: 101;
      background-size: 100% 200%;
      background-image: linear-gradient(#000000DD, #00000000, #00000000);
      animation: headerAnimationHide 200ms ease-in-out;
      background-position: 0 100%;
    }

    #twitch-embed-header:hover {
      background-image: linear-gradient(#000000DD, #00000000, #00000000);
      animation: headerAnimation 200ms ease-in-out;
      background-position: 0 0;
    }

    #twitch-embed-drag-overlay {
      position: absolute;
      top: 20px;
      left: 0px;
      height: 360px;
      width: 640px;
    }

    #twitch-embed {
      position: absolute;
      width: 100%;
      height: 100%;
    }

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

    const styleElement = document.createElement('style');
    styleElement.innerHTML = style;
    styleElement.id = 'twitch-embed-style';

    const root = document.getElementById("app-mount");

    root.append(styleElement);
  }

  removeStyleElement() {
    const styleElement = document.getElementById("twitch-embed-style");

    if (styleElement) {
      styleElement.remove();
    }
  }

};