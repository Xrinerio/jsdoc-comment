class Rock {
  constructor(color, size) {
    this.color = color;
    this.size = size;
  }

  ReSize(newsize) {
    this.size = newsize;
    console.log(`New size - $(newsize)`);
  }
}
