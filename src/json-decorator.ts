import { JsonDecorator, JsonTransformEventDecorator, TransformEvent, TransformObject } from "./types";

/**
 * Attribute decorator
 * @param params Configuration for json field
 * @returns
 */
export function JsonField(
  params:
    | {
        names?: string[];
        from?: TransformObject;
      }
    | string
): PropertyDecorator {
  // console.log('加载属性装饰器:', params)
  return function (target: any, key: any) {
    // console.log('执行属性装饰器:', target, key, params)
    if (!target.constructor[JsonDecorator]) {
      target.constructor[JsonDecorator] = {};
    }
    if (typeof params === "string") {
      target.constructor[JsonDecorator][params] = key;
    } else {
      const names = params.names ?? [key];
      names.forEach((n) => {
        if (n) {
          if (params.from instanceof Function) {
            const data: TransformObject = {
              key: key.toString(),
              transform: params.from,
            };
            target.constructor[JsonDecorator][n] = data;
          } else if (params.from instanceof Object) {
            target.constructor[JsonDecorator][n] = params.from;
          } else {
            target.constructor[JsonDecorator][n] = key;
          }
        }
      });
    }
  };
}

/**
 * Class decorator
 * @param params Configuration for json field
 * @returns
 */
export function JSONClass(params: TransformEvent) {
  return function (constructor: any) {
    if (params) {
      constructor[JsonTransformEventDecorator] = params;
    }
    return constructor;
  };
}
