import { path } from './object';

/** Returns a theme property at a given dot delimited `pathStr`.
 *  This is meant to be used with styled-components ttl:s to avoid typing
 *  lambda functions with simple theme props.
 */
export const prop = (pathStr: string) => path(`theme.${pathStr}`);

/** Access layout properties in a theme */
export const layout = (layoutProp: string) => prop(`layout.${layoutProp}`);

/** Access color properties in a theme */
export const color = (name: string) => prop(`colors.${name}`);
