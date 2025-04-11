document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      button.classList.toggle('active');

      console.log(`Toggled ${button.dataset.category}`);
    });
  });