import { proxy } from 'valtio/vanilla';
import * as yup from 'yup';
import i18next from 'i18next';
import ru from './locales/ru.js';
import initView from './view.js';
import './index.css';
import 'bootstrap';

const app = () => {
  const state = proxy({
    form: {
      valid: true,
      error: null,
      status: 'filling', // filling, failed, finished
    },
    feeds: [],
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  }).then(() => {
    yup.setLocale({
      string: {
        url: 'invalidUrl',
      },
      mixed: {
        required: 'required',
        notOneOf: 'duplicate',
      },
    });

    initView(state, elements, i18nInstance);

    const validate = (url, feeds) => {
      const schema = yup.string().url().required().notOneOf(feeds);
      return schema.validate(url);
    };

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url').trim();

      validate(url, state.feeds)
        .then(() => {
          state.form.valid = true;
          state.form.error = null;
          state.feeds.push(url);
          state.form.status = 'finished';
        })
        .catch((err) => {
          state.form.valid = false;
          state.form.error = err.message;
          state.form.status = 'failed';
        });
    });
  });
};

app();
