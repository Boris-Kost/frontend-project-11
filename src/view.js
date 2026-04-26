import { subscribe } from 'valtio/vanilla';

const renderForm = (state, elements, i18n) => {
  const { input, feedback } = elements;
  const { form } = state;

  if (form.status === 'finished') {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('messages.success');
    input.value = '';
    input.focus();
  }

  if (form.status === 'failed') {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18n.t(`errors.${form.error}`);
  }
};

const initView = (state, elements, i18n) => {
  subscribe(state.form, () => {
    renderForm(state, elements, i18n);
  });
};

export default initView;
