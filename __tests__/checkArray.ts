import { JSONParse } from "../src";

test("The results need to be equal after conversion.", () => {
  const data = JSON.stringify([
    {
      a: 1,
      b: [
        { a: 2, c: 3 },
        { a: 3, c: 4 },
        { a: 5, c: 6 },
      ],
    },
    {
      a: 2,
      b: [
        { a: 2, c: 3 },
        { a: 3, c: 4 },
        { a: 5, c: 6 },
      ],
    },
  ]);
  const parseResult = JSONParse(data, {
    a: "paramsA",
    b: "paramsB",
  });

  const result = [
    {
      paramsA: 1,
      paramsB: [
        { paramsA: 2, c: 3 },
        { paramsA: 3, c: 4 },
        { paramsA: 5, c: 6 },
      ],
    },
    {
      paramsA: 2,
      paramsB: [
        { paramsA: 2, c: 3 },
        { paramsA: 3, c: 4 },
        { paramsA: 5, c: 6 },
      ],
    },
  ];
  expect(parseResult).toEqual(result);
});
