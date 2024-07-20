import CartParser from "./CartParser";
import validJson from "../samples/cart.json";
let parser, parse;

beforeEach(() => {
  parser = new CartParser();
  parse = parser.parse.bind(parser);
});

describe("CartParser - unit tests", () => {
  // Add your unit tests here.
  it("should read valid csv file and return valid JSON data", () => {
    const { items, total } = parser.parse("./samples/cart.csv");

    // console.log(items);

    const isString = (value) => typeof value === "string";
    const isPositiveNumber = (value) => typeof value === "number" && value > 0;

    const areItemsValid = items.every((item) => {
      const { id, name, price, quantity } = item;

      return (
        isString(id) &&
        isString(name) &&
        isPositiveNumber(price) &&
        isPositiveNumber(quantity)
      );
    });

    expect(areItemsValid && isPositiveNumber(total)).toBeTruthy();
  });
});

describe("CartParser - integration test", () => {
  // Add your integration test here.
});
