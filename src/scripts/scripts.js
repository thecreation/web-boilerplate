import Lazyload from 'vanilla-lazyload';

(function(document) {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('#sidebar');
  const checkbox = document.querySelector('#sidebar-checkbox');

  document.addEventListener(
    'click',
    e => {
      const target = e.target;
      if (
        !checkbox.checked ||
        sidebar.contains(target) ||
        (target === checkbox || target === toggle)
      ) {
        return;
      }

      checkbox.checked = false;
    },
    false
  );

  // https://github.com/verlok/lazyload
  new Lazyload({
    threshold: 500,
    elements_selector: '.lazy',
    data_src: 'src',
    data_srcset: 'srcset'
  });
})(document);
