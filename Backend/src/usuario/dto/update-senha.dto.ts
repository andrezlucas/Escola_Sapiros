import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class UpdateSenhaDto {
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString()
  @Length(8, 64)
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]).{8,}$/,
    {
      message:
        'A senha deve conter ao menos 1 letra maiúscula, 1 número e 1 caractere especial.',
    },
  )
  senha: string;

  @IsNotEmpty({ message: 'A confirmação de senha é obrigatória' })
  @IsString()
  confirmarSenha: string;
}
