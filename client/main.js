const lightboxContainer = document.querySelector('.lightbox-container');
const lightboxImage = document.querySelector('.lightbox-img');
const lightboxBtns = document.querySelectorAll('.lightbox-btn');
const lightboxBtnLeft = document.querySelector('#left');
const lightboxBtnRight = document.querySelector('#right');
const loader = document.querySelector('.loader');

let scrollLock = false;

const showLightBox = () => {
  lightboxContainer.classList.add('active');
};

lightboxContainer.addEventListener('click', () => {
  lightboxContainer.classList.remove('active');
});

const getTotalPosts = async blogName => {
  const response = await fetch(`http://localhost:8888/user/${blogName}/total_posts`);
  const data = await response.json();
  return data.total;
};

const getProfile = async blogName => {
  let profile;
  try {
    const response = await fetch(`http://localhost:8888/user/${blogName}`);
    const data = await response.json();
    profile = { avatar: data.info[0].avatar, username: data.info[0].username, description: data.info[0].description };
    loadProfile(profile);
    getImages(blogName);
  } catch (err) {
    profile = { avatar: '', username: 'Not Found', description: '' };
    loadProfile(profile);
  }
};

const loadProfile = profile => {
  const avatarElement = document.querySelector('#avatar');
  const nameElement = document.querySelector('#name');
  const desElement = document.querySelector('#description');
  avatarElement.src = profile.avatar;
  nameElement.innerHTML = profile.username;
  desElement.innerHTML = profile.description;
};

const getImages = async (blogName, offset) => {
  try {
    displayLoading();
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
    html += `<div class="image-item lightbox-enabled">`;
    html += `<img id="${image.id}" src="${image.og_size}" data-imagesrc="${image.og_size}" alt="${image.alt}">`;
    html += `</div>`;
  });
  displayLoading();
  document.querySelector('.image-list').insertAdjacentHTML('beforeend', html);
  /**************lightbox***************/
  let lightboxEnabled = document.querySelectorAll('.lightbox-enabled');
  let lightboxArray = [...lightboxEnabled];
  let lastImage = lightboxArray.length - 1;
  let activeImg;

  const setActiveImage = image => {
    if (!image) {
      return;
    } else {
      lightboxImage.src = image.firstChild.dataset.imagesrc;
    }
    activeImg = lightboxArray.indexOf(image);
  };
  lightboxBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      slidesHandler(e.currentTarget.id);
    });
  });
  const slidesHandler = moveItem => {
    moveItem.includes('left') ? slideLeft() : slideRight();
  };
  const slideLeft = () => {
    // activeImg === 0 ? setActiveImage(lightboxArray[lastImage]) : setActiveImage(lightboxArray[activeImg].previousElementSibling);
    if (activeImg === 0) {
      setActiveImage(lightboxArray[lastImage]);
    } else if (!lightboxArray[activeImg]) {
      return;
    } else {
      setActiveImage(lightboxArray[activeImg].previousElementSibling);
    }
  };
  const slideRight = () => {
    // activeImg === lastImage ? setActiveImage(lightboxArray[0]) : setActiveImage(lightboxArray[activeImg].nextElementSibling);
    if (activeImg === lastImage) {
      setActiveImage(lightboxArray[0]);
    } else if (!lightboxArray[activeImg]) {
      return;
    } else {
      setActiveImage(lightboxArray[activeImg].nextElementSibling);
    }
  };
  lightboxEnabled.forEach(img => {
    img.addEventListener('click', e => {
      showLightBox();
      setActiveImage(img);
    });
  });
  window.addEventListener('keydown', e => {
    if (!lightboxContainer.classList.contains('active')) return;
    if (e.key.includes('Left') || e.key.includes('Right')) {
      e.preventDefault();
      slidesHandler(e.key.toLowerCase());
    }
  });
  /*****************************/
  scrollLock = false;
};

const displayLoading = () => {
  loader.style.display = 'block';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 1800);
};

const main = () => {
  let totalPosts;
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
      // getImages(input);
      getTotalPosts(input).then(data => (totalPosts = data));
      window.onscroll = function () {
        if (scrollLock || this.oldScroll > this.scrollY) return;
        this.oldScroll = this.scrollY;
        if (this.innerHeight + this.pageYOffset >= (document.body.scrollHeight / 4) * 3) {
          scrollLock = true;
          let postElement = document.querySelectorAll('.image-item');
          if (postElement.length === totalPosts) {
            return;
          } else {
            console.log('load lan 2');
            getImages(input, postElement.length);
          }
        }
      };
    }
  });
};
main();
