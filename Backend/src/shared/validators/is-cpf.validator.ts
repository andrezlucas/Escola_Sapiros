import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsCpfConstraint implements ValidatorConstraintInterface {
  validate(value: any, _args?: ValidationArguments): boolean {
    if (value === null || value === undefined) return false;
    const str = String(value).replace(/\D/g, '');
    if (str.length !== 11) return false;
    if (/^(\d)\1+$/.test(str)) return false; // todos os dígitos iguais

    const calc = (cpf: string, factor: number) => {
      let total = 0;
      for (let i = 0; i < factor - 1; i++) {
        total += parseInt(cpf.charAt(i), 10) * (factor - i);
      }
      const rest = (total * 10) % 11;
      return rest === 10 ? 0 : rest;
    };

    const first = calc(str, 10);
    const second = calc(str, 11);
    return first === parseInt(str.charAt(9), 10) && second === parseInt(str.charAt(10), 10);
  }

  defaultMessage(args?: ValidationArguments): string {
    return `${args?.property} inválido`;
  }
}

export function IsCpf(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCpfConstraint,
    });
  };
}
