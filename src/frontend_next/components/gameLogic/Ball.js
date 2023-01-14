const INITIAL_SPEED = 0.05;
const INCREASE_SPEED = 0.000001;

class Ball {
  constructor(ballElement) {
    this.ballElement = ballElement;
    this.resetPosition();
  }

  get x() {
    console.log("INSIDE X");
    return parseFloat(
      getComputedStyle(this.ballElement).getPropertyValue("--x")
    );
  }

  get y() {
    return parseFloat(
      getComputedStyle(this.ballElement).getPropertyValue("--y")
    );
  }

  set x(newX) {
    this.ballElement.style.setProperty("--x", newX);
  }

  set y(newY) {
    this.ballElement.style.setProperty("--y", newY);
  }

  /* This method returns the position of the ball relative to the window */
  rect() {
    return this.ballElement.getBoundingClientRect();
  }

  updatePosition(delta, paddlesRect) {
    this.x += this.direction.x * this.speed * delta;
    this.y += this.direction.y * this.speed * delta;
    this.speed += INCREASE_SPEED * delta;
    const rect = this.rect();

    // if the ball has crossed upper or lower boundaries
    if (rect.bottom >= window.innerHeight || rect.top <= 0) {
      this.direction.y *= -1;
    }
    // if one of the paddlesRect satisfy the collision test then bounce the ball (by x = -x)
    if (paddlesRect.some((paddle) => isCollided(paddle, rect))) {
      this.direction.x *= -1;
    }
  }

  resetPosition() {
    this.x = 50;
    this.y = 50;
    this.direction = { x: 0 };
    while (
      Math.abs(this.direction.x) <= 0.2 ||
      Math.abs(this.direction.x) >= 0.8
    ) {
      const degree = genRandomBetween(0, 2 * Math.PI);
      this.direction = { x: Math.cos(degree), y: Math.sin(degree) };
    }
    this.speed = INITIAL_SPEED;
  }
}

function genRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function isCollided(paddle, ball) {
  return (
    paddle.right >= ball.left &&
    paddle.left <= ball.right &&
    paddle.top <= ball.bottom &&
    paddle.bottom >= ball.top
  );
}

export default Ball;
