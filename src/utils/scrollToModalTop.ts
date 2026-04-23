export const scrollToModalTop = () => {
  const contentScroller = document.querySelector('.content');
  if (contentScroller instanceof HTMLElement) {
    contentScroller.scrollTo({ top: 0, behavior: 'auto' });
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};
