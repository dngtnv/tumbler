let scrollLock = false;
const getProfile = async blogName => {
  const response = await fetch(`http://localhost:8888/user/${blogName}`);
  const data = await response.json();
  loadProfile(data);
};

const loadProfile = profile => {
  const avatarElement = document.querySelector('#avatar');
  const nameElement = document.querySelector('#name');
  const desElement = document.querySelector('#description');
  avatarElement.src = profile.info[0].avatar;
  nameElement.innerHTML = profile.info[0].username;
  desElement.innerHTML = profile.info[0].description;
};

const getImages = async (blogName, offset) => {
  try {
    doLoading();
    if (!offset) {
      offset = 0;
    }
    const response = await fetch(`http://localhost:8888/${blogName}/photos/20/offset=${offset}`);
    const data = await response.json();
    loadImages(data);
  } catch (err) {
    console.log(err);
  }
};

const loadImages = imagesArr => {
  let html = '';
  imagesArr.images.forEach(image => {
    html += `<div class="image-item">`;
    html += `<img id="${image.id}" src="${image.url}" alt="${image.alt}">`;
    html += `</div>`;
  });
  doLoading();
  setTimeout(() => {
    document.querySelector('.image-list').insertAdjacentHTML('beforeend', html);
    removeLoading();
    scrollLock = false;
  }, 1000);
};
const doLoading = () => {
  const loader = document.querySelector('.loader');
  loader.style.visibility = 'visible';
};
const removeLoading = () => {
  const loader = document.querySelector('.loader');
  loader.style.visibility = 'hiddene';
};

const main = () => {
  const inputElement = document.querySelector('#search-input');
  inputElement.addEventListener('change', e => {
    let input = e.target.value;
    if (!input) {
      e.preventDefault();
    } else {
      e.preventDefault();
      inputElement.blur();
      let element = document.querySelector('.image-list');
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      getProfile(input);
      getImages(input);
      window.onscroll = function () {
        if (scrollLock) return;
        if (this.innerHeight + this.pageYOffset >= (document.body.scrollHeight / 4) * 3) {
          scrollLock = true;
          let postElement = document.querySelectorAll('.image-item');
          getImages(input, postElement.length);
        }
      };
    }
  });
};
main();
