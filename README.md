# js-transform

A tool for converting json's field names in typescript or javascript! Support multiple individual names!

> 一个用于转换 json 字段名的 ts/js 工具，支持多个别名

## 1、 普通使用

### 普通对象转换

例 1：通过对象转换，以下例子会所有对应的 key 为`a`的转换为 key 为`params1`

```ts
import { JSONParse } from "json-transform-utils";

const data = "{a:1,b:2,c:{a:2,b:3}}";
JSONParse(data, { a: "params1" });

//结果为  "{params1:1,b:2,c:{params1:2,b:3}}"
```

### 通过注解转换

例子 2:通过对象注解转换

> 需注意声明顺序，比如以下场景中，City 应该声明在 Person 前面。

```ts
export class City {
  id: string;
  @JsonField({ names: ["city_name", "cityName"] })
  name: string;
}

export class Dog {
  @JsonField("dog_name")
  name: string;
}

export class Cat {
  @JsonField("cat_name")
  name: string;
}

export class Pet {
  @JsonField({ names: ["pets_dogs"], from: Dog })
  dogs: Dog[];
  @JsonField({ names: ["pets_cats"], from: Cat })
  cats: Cat[];
}

export class Person {
  id: string;
  @JsonField("person_name")
  name: string;
  @JsonField({ names: ["person_age", "old_person_age"] })
  age: number;
  @JsonField({ names: ["city"], from: City })
  city: City;

  @JsonField({ from: Pet })
  pets: Pet[];
}

//--处理单个对象
const data = "<person的对象json字符串>";
JSONParse(data, Person);

//--处理嵌套数据:例如分页
const data = "{page:1,total_page:100,contents:<person的对象json字符串>}";
JSONParse(data, { contents: Person });
```

### 转换监听

> 工具提供了一个 class 注解，通过该注解，可以处理转换前的数据类型 和转换后的数据。

#### 示例一：

> 通过，定义全局的转换方法，配合`class-transformer`实现请求后直接将 plain object 转换为 class object 。

```ts
/**
 * 一些普通的转换为Class的方法
 * Some common ways to convert to Class
 * @returns
 */
export function CommonJSONClass() {
  return JSONClass({
    after: function (result: BlockResInfo, parse: TransformParseObject, json: string) {
      if (typeof parse === "function") {
        return plainToInstance(parse, result);
      } else {
        return result;
      }
    },
  });
}

/**
 * 使用注解
 */
@CommonJSONClass()
export class YouerRespose {}
```

### 和 Axios 框架配合使用

1、步骤一:扩展 Axios 的配置参数

```ts
import { TransformParseObject } from "json-transform-utils";
//---扩展属性
declare module "axios" {
  export interface AxiosRequestConfig {
    transformJson?: TransformParseObject; // 转换为json的映射属性
  }
}
```

2、步骤二: 新增`transformResponse`转换属性:

```ts
const axios = axiosClient.create({
  //<...其他参数>
  transformResponse: [
    function (this: AxiosRequestConfig, data: string, headers: any) {
      /**
       * Some other processing can be done here.For example, with the *`class-transform` dependency library, you can convert `plain Object` to *`Class Object`.
       *
       * 在这里可以进行一些其他的处理
       * 例如利用class-transformer 依赖库，可以将plain Object 转换为 Class Object
       */
      return JSONParse(data, this.transformJson);
    },
  ],
});
```

3、步骤三：请求数据

```ts
//Post
axios.post<ResposeInfo>(
  "youer request url",
  { params: 1 },
  {
    // 设置转换方法
    transformJson: PlatformResInfo,
  }
);

//Get
axios.get<PageInfo<ResposeInfo>>("youer request url", {
  params: {
    page: params.page ?? 1, //页码
  },
  transformJson: {
    contents: ResposeInfo,
  },
});
```

#### PS: 可以利用 `class-transformer` 依赖库配合将 plain Object 转换为 Class Object

> `class-transformer` Url:https://www.npmjs.com/package/class-transformer

> Thinks ~
