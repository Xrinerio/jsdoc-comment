class Animal {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  describe() {
    console.log(`This is ${this.name}, aged ${this.age} years.`);
  }

  makeSound() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  constructor(name, age, breed) {
    super(name, age);
    this.breed = breed;
  }

  makeSound() {
    console.log(`${this.name} barks.`);
  }

  fetch() {
    console.log(`${this.name} fetches the ball.`);
  }
}

class Cat extends Animal {
  constructor(name, age, color) {
    super(name, age);
    this.color = color;
  }

  makeSound() {
    console.log(`${this.name} meows.`);
  }

  purr() {
    console.log(`${this.name} purrs.`);
  }
}

class GoldenRetriever extends Dog {
  constructor(name, age) {
    super(name, age, "Golden Retriever");
  }

  playFetch() {
    console.log(`${this.name} loves to play fetch!`);
  }
}
