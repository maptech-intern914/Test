(function () {
  "use strict";

  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var track = carousel.querySelector(".maptech-carousel-track");
    var slides = Array.prototype.slice.call(track.children);
    var previous = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var dots = carousel.querySelector("[data-carousel-dots]");
    var toggle = carousel.querySelector("[data-carousel-toggle]");
    var stops = [];
    var animationFrame = 0;
    var activeStop = 0;
    var autoplayDelay = Number(carousel.dataset.carouselAutoplay);
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var hovered = false;
    var focused = false;
    var manuallyPaused = reducedMotion.matches;

    function getStep() {
      if (carousel.dataset.carouselStep === "page") {
        return track.clientWidth;
      }

      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      return slides[0].getBoundingClientRect().width + gap;
    }

    function updateState() {
      var maximum = Math.max(0, track.scrollWidth - track.clientWidth);
      var position = track.scrollLeft;
      var distance = Infinity;

      activeStop = 0;
      stops.forEach(function (stop, index) {
        var difference = Math.abs(position - stop);
        if (difference < distance) {
          activeStop = index;
          distance = difference;
        }
      });

      Array.prototype.forEach.call(dots.children, function (dot, index) {
        dot.setAttribute("aria-current", index === activeStop ? "true" : "false");
      });
      previous.disabled = position <= 1;
      next.disabled = position >= maximum - 1;
      carousel.classList.toggle("is-static", maximum <= 1);
    }

    function updateToggle() {
      if (!toggle) {
        return;
      }
      toggle.textContent = manuallyPaused ? "Resume rotation" : "Pause rotation";
      toggle.setAttribute("aria-pressed", manuallyPaused ? "true" : "false");
    }

    function buildStops() {
      var maximum = Math.max(0, track.scrollWidth - track.clientWidth);
      var step = Math.max(1, getStep());
      stops = [0];

      for (var position = step; position < maximum; position += step) {
        stops.push(position);
      }
      if (maximum - stops[stops.length - 1] > step / 2) {
        stops.push(maximum);
      }

      dots.replaceChildren();
      stops.forEach(function (stop, index) {
        var dot = document.createElement("button");
        dot.className = "maptech-carousel-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", "Go to carousel position " + (index + 1));
        dot.addEventListener("click", function () {
          track.scrollTo({ left: stop, behavior: "smooth" });
        });
        dots.appendChild(dot);
      });
      updateState();
    }

    if (toggle && autoplayDelay > 0) {
      updateToggle();
      toggle.addEventListener("click", function () {
        manuallyPaused = !manuallyPaused;
        updateToggle();
      });

      carousel.addEventListener("pointerenter", function () {
        hovered = true;
      });
      carousel.addEventListener("pointerleave", function () {
        hovered = false;
      });
      carousel.addEventListener("focusin", function () {
        focused = true;
      });
      carousel.addEventListener("focusout", function (event) {
        focused = carousel.contains(event.relatedTarget);
      });
      reducedMotion.addEventListener("change", function (event) {
        if (event.matches) {
          manuallyPaused = true;
          updateToggle();
        }
      });

      window.setInterval(function () {
        if (manuallyPaused || hovered || focused || document.hidden || stops.length < 2) {
          return;
        }

        var nextStop = activeStop + 1;
        if (nextStop >= stops.length) {
          nextStop = 0;
        }
        track.scrollTo({ left: stops[nextStop], behavior: "instant" });
        updateState();
      }, autoplayDelay);
    }

    previous.addEventListener("click", function () {
      var current = track.scrollLeft;
      var target = 0;
      stops.forEach(function (stop) {
        if (stop < current - 1) {
          target = stop;
        }
      });
      track.scrollTo({ left: target, behavior: "smooth" });
    });

    next.addEventListener("click", function () {
      var target = stops[stops.length - 1];
      for (var index = 0; index < stops.length; index += 1) {
        if (stops[index] > track.scrollLeft + 1) {
          target = stops[index];
          break;
        }
      }
      track.scrollTo({ left: target, behavior: "smooth" });
    });

    track.addEventListener("scroll", function () {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      animationFrame = window.requestAnimationFrame(updateState);
    });

    window.addEventListener("resize", buildStops);
    buildStops();
  });

  document.querySelectorAll(".maptech-partners-marquee").forEach(function (marquee) {
    var track = marquee.querySelector(".maptech-partners-track");
    var firstGroup = track.querySelector(".maptech-partners-group");
    var clone = firstGroup.cloneNode(true);
    track.style.animationDuration = `${42 * firstGroup.children.length / 12}s`;
    var toggle = marquee.querySelector("[data-partners-toggle]");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var animation;
    var manuallyPaused = reducedMotion.matches;
    var pointerStart = null;
    var dragged = false;

    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a").forEach(function (link) {
      link.setAttribute("tabindex", "-1");
    });
    track.appendChild(clone);

    function getAnimation() {
      return track.getAnimations().filter(function (item) {
        return item.animationName === "maptech-partners-marquee";
      })[0];
    }

    function updateToggle() {
      if (!toggle) {
        return;
      }
      marquee.classList.toggle("is-manually-playing", !manuallyPaused);
      toggle.textContent = manuallyPaused ? "Resume rotation" : "Pause rotation";
      toggle.setAttribute("aria-pressed", manuallyPaused ? "true" : "false");
    }

    function resumeIfAllowed() {
      if (!manuallyPaused && !reducedMotion.matches && !marquee.matches(":hover") && !marquee.contains(document.activeElement)) {
        animation.play();
      }
    }

    animation = getAnimation();
    if (reducedMotion.matches) {
      animation.pause();
    }
    updateToggle();

    if (toggle) {
      toggle.addEventListener("click", function () {
        manuallyPaused = !manuallyPaused;
        updateToggle();
        if (manuallyPaused) {
          animation.pause();
        } else {
          resumeIfAllowed();
        }
      });
    }

    marquee.addEventListener("pointerdown", function (event) {
      if (event.button !== 0 || reducedMotion.matches) {
        return;
      }
      pointerStart = {
        id: event.pointerId,
        x: event.clientX,
        time: Number(animation.currentTime) || 0
      };
      dragged = false;
    });

    marquee.addEventListener("pointermove", function (event) {
      if (!pointerStart || pointerStart.id !== event.pointerId) {
        return;
      }

      var delta = event.clientX - pointerStart.x;
      if (!dragged && Math.abs(delta) > 5) {
        dragged = true;
        animation.pause();
        marquee.classList.add("is-dragging");
        track.classList.add("is-dragging");
        marquee.setPointerCapture(event.pointerId);
      }
      if (dragged) {
        event.preventDefault();
        var loopWidth = track.scrollWidth / 2;
        var duration = Number(animation.effect.getTiming().duration);
        var targetTime = pointerStart.time - (delta / loopWidth) * duration;
        animation.currentTime = ((targetTime % duration) + duration) % duration;
      }
    });

    function endPointer(event) {
      if (!pointerStart || pointerStart.id !== event.pointerId) {
        return;
      }
      if (dragged) {
        resumeIfAllowed();
        window.setTimeout(function () {
          dragged = false;
        }, 0);
      }
      pointerStart = null;
      marquee.classList.remove("is-dragging");
      track.classList.remove("is-dragging");
    }

    marquee.addEventListener("pointerup", endPointer);
    marquee.addEventListener("pointercancel", endPointer);
    document.addEventListener("click", function (event) {
      if (dragged && marquee.contains(event.target)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);

    reducedMotion.addEventListener("change", function (event) {
      if (event.matches) {
        manuallyPaused = true;
        animation.pause();
      }
      updateToggle();
      resumeIfAllowed();
    });

    marquee.addEventListener("pointerleave", resumeIfAllowed);
    marquee.addEventListener("focusout", function (event) {
      if (!marquee.contains(event.relatedTarget)) {
        resumeIfAllowed();
      }
    });
  });
}());
