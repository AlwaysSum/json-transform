import { isConstructor } from "./methods";
import {
  JsonDecorator,
  JsonTransformEventDecorator,
  TransformObject,
  TransformEvent,
  TransformParseObject,
  TransformParseFunc,
} from "./types";

/**
 * 提供给外部的转换方法
 * @param data
 * @param transform
 * @returns
 */
export function JSONParse(data: string, transform: TransformParseObject) {
  if (!data) return data;
  if (transform) {
    const newData = transformJsonParse(data, transform);
    // console.log('@转换结果:', newData)
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
function transformJsonParse(data: string, clazz: TransformParseObject | TransformParseFunc): any {
  let transMap = {};
  let transformParse: TransformParseObject;
  let event: TransformEvent;
  // 通过方法转换
  if (typeof clazz === "function" && !isConstructor(clazz)) {
    const funcRes = (clazz as TransformParseFunc)(data) ?? {
      parse: {},
    };
    transformParse = funcRes.parse;
    event = funcRes.event;
  } else {
    // 通过类型转换
    transformParse = clazz as TransformParseObject;
  }

  if (typeof transformParse === "function") {
    const info = new transformParse();
    transMap = info.constructor?.[JsonDecorator] ?? {};
    event = info.constructor?.[JsonTransformEventDecorator];
  } else if (typeof transformParse === "object") {
    transMap = transformParse;
  } else {
    throw new Error(`Json转换异常:不存在映射类型:${transformParse}`);
  }

  // 转换方法
  const transfromDataFunc = function (data: string, trans: { [key: string]: TransformObject }) {
    // 开始转换
    let parseData = JSON.parse(data, jsonParseFun(trans));
    // 转换后处理
    if (event?.after) {
      if (parseData instanceof Array) {
        parseData = parseData.map((item) => event?.after(item, transformParse, data));
      } else {
        parseData = event?.after(parseData, transformParse, data);
      }
    }
    return parseData;
  };

  //转换前处理
  if (event?.beforeParse) {
    //只处理对象
    if (data.startsWith("{")) {
      const transData = JSON.parse(data);
      const newTransformParse = event?.beforeParse(transData, transformParse, data);
      if (newTransformParse != transformParse) {
        //走新的转换方法
        return transformJsonParse(data, transformParse);
      }
    } else if (data.startsWith("[")) {
      const transArray = JSON.parse(data);
      return transArray.map((it: any) => {
        const itJson = JSON.stringify(it);
        const newTransformParse = event?.beforeParse(it, transformParse, itJson);
        if (newTransformParse != transformParse) {
          //新的转换方法
          return transformJsonParse(itJson, newTransformParse);
        } else {
          return transfromDataFunc(itJson, transMap);
        }
      });
    }
  }

  return transfromDataFunc(data, transMap);
}

/**
 * Excute JSON Conversion method
 * @param trans
 * @returns
 */
function jsonParseFun(trans: { [key: string]: TransformObject }) {
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
      const transObj = trans[key];
      let newValue = value; //转换后的值
      let newKey = key; // 转换后的key

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
      } else if (typeof transObj === "object") {
        if (transObj.key) {
          newKey = transObj.key;
        }
        if (transObj.transform) {
          newValue = transformJsonParse(JSON.stringify(value), transObj.transform);
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
