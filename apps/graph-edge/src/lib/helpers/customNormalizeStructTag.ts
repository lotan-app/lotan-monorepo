import { normalizeStructTag } from '@mysten/sui/utils';

export function customNormalizeStructTag(type: any): string {
  const { address, module, name, type_args } = type.struct || type;

  const formattedTypeParams =
    type_args?.length > 0
      ? `<${type_args
          .map(typeParam => (typeof typeParam === 'string' ? typeParam : customNormalizeStructTag(typeParam)))
          .join(',')}>`
      : '';

  return normalizeStructTag(`${address}::${module}::${name}${formattedTypeParams}`);
}
