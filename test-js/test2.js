class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(
      `Hello, my name is ${this.name} and I am ${this.age} years old.`
    );
  }

  haveBirthday() {
    this.age += 1;
    console.log(`Happy Birthday! You are now ${this.age} years old.`);
  }

  reName(newname) {
    this.name = newname;
  }
}
