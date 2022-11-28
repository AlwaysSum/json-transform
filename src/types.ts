export const JsonDecorator = Symbol('__JsonDecorator__')
export const JsonTransformEventDecorator = Symbol(
    '__JsonTransformEventDecorator__'
)
/**
 * Conversion method
 */
export type Constructor = { new (...args: any[]): any }

export type TransformParseObject =
    | {
          [key: string]: TransformObject
      }
    | Constructor

export type TransformParseFunc = (data: string) => TransformParseFuncObejct

export type TransformParseFuncObejct = {
    parse: TransformParseObject
    event?: TransformEvent
}

/**
 * Conversion class
 */
export type TransformObject =
    | {
          key: string
          transform: TransformParseObject
      }
    | Constructor
    | string

export type TransformEvent = {
    after: TransformAfterEvent
    beforeParse?: TransformBeforeParseEvent
}

export type TransformBeforeParseEvent = (
    result: any,
    transform: TransformParseObject,
    originJson: String
) => TransformParseObject

export type TransformAfterEvent = (
    result: any,
    parse: TransformParseObject,
    originJson: String
) => any
