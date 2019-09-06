module.exports = [
  {
    _id: "First Post",
    title: "First Post",
    author: "Evan",
    nested: {
      nested: "Evan"
    }
  },
  {
    title: "Second Post",
    author: "Evan",
    comment: {
      comment: "Hello",
      linkedTo: "First Post",
      onModel: "Post"
    }
  }
]
