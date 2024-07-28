import CartParser from "./CartParser";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

let parser, parse, readFile, validate, calcTotal, createError, parseLine;
const csvPath = "./samples/cart.csv";

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

beforeEach(() => {
  parser = new CartParser();
  parse = parser.parse.bind(parser);
  validate = parser.validate.bind(parser);
  readFile = parser.readFile.bind(parser);
  calcTotal = parser.calcTotal.bind(parser);
  createError = parser.createError.bind(parser);
});

afterEach(() => {
  fs.readFileSync.mockRestore();
});

describe("CartParser - unit tests", () => {
  // Add your unit tests here.

  it("should read existing csv file", () => {
    const originalFs = jest.requireActual("fs");
    const fileExists = originalFs.existsSync(csvPath);

    expect(fileExists).toBeTruthy();
  });

  it("should throw Validation failed! if errors exists", () => {
    const fs = require("fs");
    const content = `Product names,Price,Quantity
  		Test,9,2`;
    fs.readFileSync.mockReturnValue(content);
    expect(() => {
      return parse();
    }).toThrow("Validation failed!");
  });

  it("should received valid path and return UTF8 string", () => {
    const fs = require("fs");
    const content = `Product name,Price,Quantity
  		Test,9,2`;
    fs.readFileSync.mockReturnValue(content);

    const result = readFile();

    function isUTF8(str) {
      try {
        return str === decodeURIComponent(encodeURIComponent(str));
      } catch (e) {
        return false;
      }
    }
    expect(isUTF8(result)).toBeTruthy();
  });

  it("should validate csv content and return no errors", () => {
    const fs = require("fs");
    const content = `Product name,Price,Quantity
  		Test,9,2`;
    fs.readFileSync.mockReturnValue(content);

    const errors = () => {
      return validate();
    };

    expect(errors.length).toBe(0);
  });

  it("should throw error when csv headers are invalid", () => {
    const content = `Product namex,Price,Quantity
    Test,9,2`;

    const result = validate(content);

    expect(result).toHaveLength(1);
    expect(result.find((x) => x.type === "header")).toBeTruthy();
    expect(result[0].message).toBe(
      `Expected header to be named "Product name" but received Product namex.`
    );
  });

  it("should throw error when number of cells not met", () => {
    const content = `Product name,Price,Quantity
    Test,9.00`;

    const result = validate(content);

    expect(result).toHaveLength(1);
    expect(result.find((x) => x.type === "row")).toBeTruthy();
    expect(result[0].message).toBe(
      `Expected row to have 3 cells but received 2.`
    );
  });

  it("should throw error when receive a nonempty string cell content", () => {
    const content = `Product name,Price,Quantity
    ,3,2`;
    const result = validate(content);

    expect(result).toHaveLength(1);
    expect(result.find((x) => x.type === "cell")).toBeTruthy();
    expect(result[0].message).toBe(
      `Expected cell to be a nonempty string but received "".`
    );
  });

  it("should throw error when receive a positive number cell content", () => {
    const content = `Product name,Price,Quantity
    Test,-3,2`;
    const result = validate(content);

    expect(result).toHaveLength(1);
    expect(result.find((x) => x.type === "cell")).toBeTruthy();
    expect(result[0].message).toBe(
      `Expected cell to be a positive number but received "-3".`
    );
  });

  it("should receive a string separated by comma and return valid object", () => {
    const testLine = "Testing,20,2";
    const mockUuid = "1234";
    uuidv4.mockImplementation(() => mockUuid);
    const result = parser.parseLine(testLine);

    expect(result).toEqual({
      id: "1234",
      name: "Testing",
      price: 20,
      quantity: 2,
    });
  });

  it("should receive valid items to calculate and return positive number as total", () => {
    const testLine = "Testing,20,2";
    const mockUuid = "1234";
    uuidv4.mockImplementation(() => mockUuid);
    const result = parser.parseLine(testLine);
    const totalArr = [];

    totalArr.push(result);
    const total = calcTotal(totalArr);

    expect(total).toEqual(40);
  });

  it("should create and error object", () => {
    const typeTest = "test";
    const rowTest = 0;
    const columnTest = 2;
    const messageTest = "This is a test";

    const errorTest = createError(typeTest, rowTest, columnTest, messageTest);

    expect(errorTest.type).toBe("test");
    expect(errorTest.row).toBe(0);
    expect(errorTest.column).toBe(2);
    expect(errorTest.message).toBe("This is a test");
  });
});

//TODO:

describe("CartParser - integration test", () => {
  // Add your integration test here.

  it("should return an object array of items and total prices", () => {
    const actualFn = jest.requireActual("fs").readFileSync;
    fs.readFileSync.mockImplementation(actualFn);

    const mockUuid = "1234";
    uuidv4.mockImplementation(() => mockUuid);

    const parsed = parse("./samples/cart.csv");
    const fileContent = readFile("./samples/cart.csv");
    const validated = validate(fileContent);

    console.log(validated);

    expect(parsed).toEqual({
      items: [
        { name: "Mollis consequat", price: 9, quantity: 3, id: "1234" },
        { name: "Tvoluptatem", price: 10.32, quantity: 2, id: "1234" },
        {
          name: "Scelerisque lacinia",
          price: 18.9,
          quantity: 2,
          id: "1234",
        },
        {
          name: "Consectetur adipiscing",
          price: 28.72,
          quantity: 10,
          id: "1234",
        },
        {
          name: "Condimentum aliquet",
          price: 13.9,
          quantity: 2,
          id: "1234",
        },
      ],
      total: 400.44,
    });
    expect(parsed.items.length).toEqual(5);
    expect(parsed.total).toEqual(400.44);
    expect(() => {
      return parse("./samples/cart.csv");
    }).not.toThrow("Validation failed!");
    expect(validated.length).toEqual(0);
    expect(fileContent).toBeTruthy();
  });
});
