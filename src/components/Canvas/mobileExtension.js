export default {
  onMobileMounted() {
  },
  onMobileCanvasInit() {
    this.disableDefaultMobileScroll();
    //this.enableMobilePinchZoom();
  },
  disableDefaultMobileScroll() {
    const markUpFlex = document.getElementById("markup-flex");
    markUpFlex.addEventListener('touchmove', (e) => {
      if (!this.canEditCurrentMarkUp) return;

      if (e.target.nodeName === 'CANVAS') e.preventDefault();
    }, {passive: false, cancelable: true});

    // this.stage.on('touchmove touchstart touchend', (e) => {
    //   if (!this.canEditCurrentMarkUp) return;
    //
    //   // Prevents 2-finger touch events from triggering on canvas objects
    //   if (e.evt.touches.length > 1) {
    //     e.evt.stopPropagation();
    //     this.setStageListening(false);
    //   } else if (e.evt.touches.length === 1) {
    //     this.setStageListening(true);
    //   }
    // });
  },
  enableMobilePinchZoom() {
    const getCenter = (p1, p2) => {
      return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };
    };

    const getDistance = (p1, p2) => {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    this.stage.on('touchmove', (e) => {
      if (e.evt.touches.length !== 2) return;

      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];

      if (touch1 && touch2) {
        if (this.stage.isDragging()) {
          this.stage.stopDrag();
        }

        const p1 = {
          x: touch1.clientX,
          y: touch1.clientY,
        };
        const p2 = {
          x: touch2.clientX,
          y: touch2.clientY,
        };

        if (!this.lastCenter) {
          this.lastCenter = getCenter(p1, p2);
          return;
        }

        const newCenter = getCenter(p1, p2);

        const dist = getDistance(p1, p2);

        if (!this.lastDist) {
          this.lastDist = dist;
        }

        const pointTo = {
          x: (newCenter.x - this.stage.x()) / this.stage.scaleX(),
          y: (newCenter.y - this.stage.y()) / this.stage.scaleX(),
        };

        const scale = this.stage.scaleX() * (dist / this.lastDist);

        this.stage.scaleX(scale);
        this.stage.scaleY(scale);

        // calculate new position of the stage
        const dx = newCenter.x - this.lastCenter.x;
        const dy = newCenter.y - this.lastCenter.y;

        const newPos = {
          x: newCenter.x - pointTo.x * scale + dx,
          y: newCenter.y - pointTo.y * scale + dy,
        };

        this.stage.position(newPos);
        this.stage.batchDraw();

        this.lastDist = dist;
        this.lastCenter = newCenter;
      }
    });

    this.stage.on('touchend', function () {
      this.lastDist = 0;
      this.lastCenter = null;
    });
  }
}