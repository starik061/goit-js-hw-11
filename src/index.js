import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import './sass/main.scss';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import * as bootstrap from 'bootstrap';
import cardTemplate from './templates/card-template.hbs';

const PIXABAY_KEY = '35924143-9020fc77f3274be39114409f4';
const PIXABAY_URL = 'https://pixabay.com/api';
let tempQuery = '';
let queryPage = 1;
let queryItemsPerPage = 40;

const formEl = document.querySelector('#search-form');
const searchInputEl = document.querySelector('[name="searchQuery"]');
const galleryEl = document.querySelector('.gallery');
const loadMoreButtonEl = document.querySelector('.load-more');

formEl.addEventListener('submit', onSearchImages);

async function onSearchImages(event) {
  event.preventDefault();

  loadMoreButtonEl.style.display = 'none';

  let searchQuery = searchInputEl.value.trim();

  if (tempQuery !== searchQuery) {
    clearGallery();
    queryPage = 1;
  }

  let findData = await requestToPixabay(searchQuery);

  let photoArr = findData.data.hits;
  let totalFindItems = findData.data.totalHits;

  if (Math.ceil(totalFindItems / queryItemsPerPage) === queryPage) {
    setTimeout(
      () =>
        Notify.warning(
          "We're sorry, but you've reached the end of search results."
        ),
      1000
    );
    loadMoreButtonEl.style.display = 'none';
  } else {
    loadMoreButtonEl.style.display = 'block';
    loadMoreButtonEl.addEventListener('click', onSearchImages);
  }

  if (totalFindItems === 0) {
    Notify.info(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    loadMoreButtonEl.style.display = 'none';
    return;
  }

  await renderPhotoCards(photoArr);

  if (queryPage !== 1) {
    smoothScroll();
  }
  let gallery = new SimpleLightbox('.gallery .photo-card a');

  tempQuery = searchQuery;
  queryPage += 1;
}

async function requestToPixabay(query) {
  let serverAnswer = await axios.get(
    `${PIXABAY_URL}/?key=${PIXABAY_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${queryPage}&per_page=${queryItemsPerPage}`
  );
  console.dir(serverAnswer);
  return serverAnswer;
}

async function renderPhotoCards(array) {
  console.log(array);
  galleryEl.insertAdjacentHTML(
    'beforeend',
    array
      .map(item => {
        return cardTemplate(item);
      })
      .join('')
  );
}

function clearGallery() {
  galleryEl.innerHTML = '';
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2.5,
    behavior: 'smooth',
  });
  console.log('scroll');
}
