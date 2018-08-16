const { expect } = require("chai");
const { getHeroes } = require("../script");

it("should be a function", () => {
  expect(getHeroes).to.be.a("function");
})