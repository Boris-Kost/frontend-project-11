import { proxy } from 'valtio/vanilla'
import * as yup from 'yup'
import i18next from 'i18next'
import axios from 'axios'
import uniqueId from 'lodash/uniqueId'
import differenceBy from 'lodash/differenceBy'
import ru from './locales/ru.js'
import initView from './view.js'
import parse from './parser.js'
import './index.css'
import 'bootstrap'

const addProxy = url => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app')
  urlWithProxy.searchParams.set('url', url)
  urlWithProxy.searchParams.set('disableCache', 'true')
  return urlWithProxy.toString()
}

const updateFeeds = state => {
  const promises = state.feeds.map(feed => axios.get(addProxy(feed.url))
    .then(response => {
      const { items } = parse(response.data.contents)
      const currentFeedPosts = state.posts.filter(p => p.feedId === feed.id)
      const newPosts = differenceBy(items, currentFeedPosts, 'link')

      if (newPosts.length > 0) {
        const postsWithId = newPosts.map(post => ({
          ...post,
          id: uniqueId(),
          feedId: feed.id,
        }))
        state.posts.unshift(...postsWithId)
      }
    })
    .catch(e => {
      console.error(`Update failed for ${feed.url}:`, e)
    }))

  Promise.all(promises).finally(() => {
    setTimeout(() => updateFeeds(state), 5000)
  })
}

const handleRssData = (state, url, contents) => {
  const data = parse(contents)
  const feedId = uniqueId()
  state.feeds.push({
    id: feedId,
    url,
    title: data.title,
    description: data.description,
  })

  const posts = data.items.map(item => ({
    ...item,
    id: uniqueId(),
    feedId,
  }))
  state.posts.push(...posts)

  state.loadingProcess.status = 'success'
  state.form.status = 'finished'
}

const app = () => {
  const state = proxy({
    form: {
      valid: true,
      error: null,
      status: 'filling',
    },
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      selectedPostId: null,
      readPosts: new Set(),
    },
  })

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      footerLink: document.querySelector('.full-link'),
      closeBtn: document.querySelector('.modal-footer .btn-secondary'),
    },
  }

  const i18nInstance = i18next.createInstance()
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  }).then(() => {
    yup.setLocale({
      string: { url: 'invalidUrl' },
      mixed: { required: 'required', notOneOf: 'duplicate' },
    })

    initView(state, elements, i18nInstance)

    const validate = (url, feeds) => {
      const feedUrls = feeds.map(f => f.url)
      const schema = yup.string().url().required().notOneOf(feedUrls)
      return schema.validate(url)
    }

    elements.form.addEventListener('submit', e => {
      e.preventDefault()
      const formData = new FormData(e.target)
      const url = formData.get('url').trim()

      state.form.status = 'filling'
      state.loadingProcess.status = 'idle'

      validate(url, state.feeds)
        .then(() => {
          state.form.valid = true
          state.form.error = null
          state.loadingProcess.status = 'loading'

          return axios.get(addProxy(url))
        })
        .then(response => {
          handleRssData(state, url, response.data.contents)
        })
        .catch(err => {
          if (err.name === 'ValidationError') {
            state.form.valid = false
            state.form.error = err.message
            state.form.status = 'failed'
          } else if (err.isParserError) {
            state.loadingProcess.status = 'failed'
            state.loadingProcess.error = 'invalidRss'
          } else {
            state.loadingProcess.status = 'failed'
            state.loadingProcess.error = 'network'
          }
        })
    })

    elements.postsContainer.addEventListener('click', e => {
      const { id } = e.target.dataset
      if (!id) return

      state.uiState.readPosts.add(id)

      if (e.target.tagName === 'BUTTON') {
        state.uiState.selectedPostId = id
      }
    })

    setTimeout(() => updateFeeds(state), 5000)
  })
}

app()
