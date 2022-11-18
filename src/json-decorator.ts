import { TransformObject } from './json-transform'

export const JsonDecorator = Symbol('__JsonDecorator__')


/**
 * Attribute decorator
 * @param params Configuration for json field
 * @returns  
 */
export function JsonField(
    params:
        | {
              names?: string[]
              from?: string | Function
          }
        | string
): PropertyDecorator {
    // console.log('加载属性装饰器:', params)
    return function (target:any, key:any) {
        // console.log('执行属性装饰器:', target, key, params)
        if (!target.constructor[JsonDecorator]) {
            target.constructor[JsonDecorator] = {}
        }
        if (typeof params === 'string') {
            target.constructor[JsonDecorator][params] = key
        } else {
            const names = params.names ?? [key]
            names.forEach(n => {
                if (n) {
                    if (params.from instanceof Function) {
                        if (params.from.name === Function.name) {
                            target.constructor[JsonDecorator][n] = params.from()
                        } else {
                            const data: TransformObject = {
                                key: key.toString(),
                                type: params.from as any
                            }
                            target.constructor[JsonDecorator][n] = data
                        }
                    } else {
                        target.constructor[JsonDecorator][n] = key
                    }
                }
            })
        }
    }
}
