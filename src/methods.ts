/**
 * 是否是可以构建的函数
 * @param f
 * @returns
 */
export function isConstructor(f:any) {
    try {
        new f()
    } catch (err) {
        // verify err is the expected error and then
        return false
    }
    return true
}
