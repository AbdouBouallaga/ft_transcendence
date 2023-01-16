// PADDLE CLASS

class Paddle {
    constructor(paddleElement) {
      this.paddleElement = paddleElement;
    }
  
    get position() {
      return parseFloat(
        getComputedStyle(this.paddleElement).getPropertyValue("--position")
      );
    }
  
    set position(newPos) {
      this.paddleElement.style.setProperty("--position", newPos);
    }
  
    /* This method returns the position of the ball relative to the window */
    rect() {
      return this.paddleElement.getBoundingClientRect();
    }
  
    resetPosition() {
      this.position = 50;
    }
}  

// END OF PADDLE CLASS

export default Paddle;