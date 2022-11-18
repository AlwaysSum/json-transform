import { JsonDecorator } from "./json-decorator";

/**
 * Conversion method
 */
type Constructor = { new (...args: any[]): void };
export type TransformParseObject =
  | {
      [key: string]: TransformParseObject | TransformObject;
    }
  | Function
  | Constructor;

export function JSONParse(data: string, transform: TransformParseObject) {
  if (!data) return data;
  if (transform) {
    const newData = transformJsonParse(data, transform);
    return newData;
  }
  return JSON.parse(data);
}

/**
 * Execute the conversion method
 * @param data
 * @param transMap
 * @returns
 */
function transformJsonParse(data: string, clazz: TransformParseObject | any) {
  let transMap = {};
  if (typeof clazz === "function" && clazz.name === Function.name) {
    clazz = clazz() ?? {};
  }
  if (typeof clazz === "function") {
    console.log('====>',clazz)
    const info = new clazz();
    transMap = info.constructor?.[JsonDecorator] ?? {};
  } else if (typeof clazz === "object") {
    transMap = clazz;
  } else {
    throw new Error(`Json转换异常:不存在映射类型:${clazz}`);
  }
  return JSON.parse(data, jsonParseFun(transMap));
}

/**
 * Conversion class
 */
export type TransformObject =
  | {
      key: string;
      type: Constructor;
    }
  | string;
/**
 * Excute JSON Conversion method
 * @param trans
 * @returns
 */
function jsonParseFun(trans: { [key: string]: TransformObject | string | Function }) {
  const obj = new Map<any, string[]>();
  return function (this: any, key: string, value: any) {
    if (obj.has(value)) {
      const deletObj = obj.get(value);
      if (deletObj) {
        deletObj.forEach((it) => {
          delete value[it];
        });
      }
    }
    /**
     * Does the current property need to be converted?
     */
    if (trans[key]) {
      /**
       * Convert objects
       */
      let transObj = trans[key];
      let newValue = value; //转换后的值
      let newKey = key; // 转换后的key

      if (typeof transObj === "function" && transObj.name === Function.name) {
        transObj = transObj(); //通过方法获取转换对象
      }
      /**
       * Convert the key directly
       */
      if (typeof transObj === "string" && transObj !== key) {
        newKey = transObj;
        /**
         * Convert to an object
         */
      } else if (typeof transObj === "function") {
        newValue = transformJsonParse(JSON.stringify(value), transObj);
        /**
         * Convert through objects
         */
      } else if (typeof transObj === "object" && transObj.key) {
        newKey = transObj.key;
        if (transObj.type) {
          newValue = transformJsonParse(JSON.stringify(value), transObj.type);
        } else {
          newValue = value;
        }
      }
      /**
       * Delete old elements
       */
      if (newKey !== key) {
        this[newKey] = newValue;
        if (obj.has(this)) {
          const newObj = obj.get(this);
          if (newObj) {
            newObj.push(key);
          }
        } else {
          obj.set(this, [key]);
        }
      } else {
        return newValue;
      }
    }
    return value;
  };
}
