function showSlide(number) {
  document.querySelectorAll('.slidePage2').forEach(function (slide) {
    slide.style.display = 'none'; // Hide all slides
  });

  document.getElementById(`slide${number}`).style.display = 'block'; // Show the selected slide
  document.querySelector('.containerRight').style.visibility = 'visible'; // Make the right container visible
}

function changeSlide(slideNumber) {
  document.querySelectorAll('.n2-bullet').forEach(function (bullet) {
    bullet.classList.remove('n2-active');
  });

  document.querySelector(`#bullet${slideNumber}`).classList.add('n2-active');

  const slideToScroll = document.getElementById(`slide${slideNumber}`);
  if (slideToScroll) {
    slideToScroll.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}
