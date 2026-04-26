import { subscribe } from 'valtio/vanilla'

const renderForm = (state, elements, i18n) => {
  const { input, feedback, button } = elements
  const { form, loadingProcess } = state

  if (loadingProcess.status === 'loading') {
    button.disabled = true
    input.readOnly = true
  } else {
    button.disabled = false
    input.readOnly = false
  }

  if (form.status === 'finished') {
    input.classList.remove('is-invalid')
    feedback.classList.remove('text-danger')
    feedback.classList.add('text-success')
    feedback.textContent = i18n.t('feedback.success')
    input.value = ''
    input.focus()
  }

  if (form.status === 'failed' || loadingProcess.status === 'failed') {
    input.classList.add('is-invalid')
    feedback.classList.remove('text-success')
    feedback.classList.add('text-danger')
    const errorKey = form.error || loadingProcess.error
    feedback.textContent = i18n.t(`errors.${errorKey}`)
  }
}

const renderFeeds = (state, elements, i18n) => {
  const { feedsContainer } = elements
  feedsContainer.innerHTML = ''

  if (state.feeds.length === 0) return

  const card = document.createElement('div')
  card.className = 'card border-0'
  const cardBody = document.createElement('div')
  cardBody.className = 'card-body'
  const title = document.createElement('h2')
  title.className = 'card-title h4'
  title.textContent = i18n.t('ui.feeds')
  cardBody.appendChild(title)
  card.appendChild(cardBody)

  const listGroup = document.createElement('ul')
  listGroup.className = 'list-group border-0 rounded-0'

  state.feeds.forEach(feed => {
    const li = document.createElement('li')
    li.className = 'list-group-item border-0 border-top-0'
    const h3 = document.createElement('h3')
    h3.className = 'h6 m-0'
    h3.textContent = feed.title
    const p = document.createElement('p')
    p.className = 'm-0 small text-black-50'
    p.textContent = feed.description
    li.append(h3, p)
    listGroup.appendChild(li)
  })

  card.appendChild(listGroup)
  feedsContainer.appendChild(card)
}

const renderPosts = (state, elements, i18n) => {
  const { postsContainer } = elements
  postsContainer.innerHTML = ''

  if (state.posts.length === 0) return

  const card = document.createElement('div')
  card.className = 'card border-0'
  const cardBody = document.createElement('div')
  cardBody.className = 'card-body'
  const title = document.createElement('h2')
  title.className = 'card-title h4'
  title.textContent = i18n.t('ui.posts')
  cardBody.appendChild(title)
  card.appendChild(cardBody)

  const listGroup = document.createElement('ul')
  listGroup.className = 'list-group border-0 rounded-0'

  state.posts.forEach(post => {
    const li = document.createElement('li')
    li.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-top-0'

    const isRead = state.uiState.readPosts.has(post.id)
    const a = document.createElement('a')
    a.setAttribute('href', post.link)
    a.className = isRead ? 'fw-normal link-secondary' : 'fw-bold'
    a.dataset.id = post.id
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
    a.textContent = post.title

    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.className = 'btn btn-outline-primary btn-sm'
    button.dataset.id = post.id
    button.dataset.bsToggle = 'modal'
    button.dataset.bsTarget = '#modal'
    button.textContent = i18n.t('ui.view')

    li.append(a, button)
    listGroup.appendChild(li)
  })

  card.appendChild(listGroup)
  postsContainer.appendChild(card)
}

const renderModal = (state, elements, i18n) => {
  const { selectedPostId } = state.uiState
  if (!selectedPostId) return

  const post = state.posts.find(p => p.id === selectedPostId)
  const {
    title, body, footerLink, closeBtn,
  } = elements.modal

  title.textContent = post.title
  body.textContent = post.description
  footerLink.setAttribute('href', post.link)
  footerLink.textContent = i18n.t('ui.modal.readFull')
  closeBtn.textContent = i18n.t('ui.modal.close')
}

const initView = (state, elements, i18n) => {
  subscribe(state, () => {
    renderForm(state, elements, i18n)
    renderFeeds(state, elements, i18n)
    renderPosts(state, elements, i18n)
    renderModal(state, elements, i18n)
  })
}

export default initView
