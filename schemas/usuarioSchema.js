import { z } from 'zod';

export const usuarioCreateSchema = z.object({
    nome: z.string({ required_error: "O nome é obrigatório!" })
    .min(3, "O nome precisa ter pelo menos 3 caracteres!"),
    
    email: z.string({ required_error: "O e-mail é obrigatório!" })
    .email("Formato de e-mail inválido!"),

    telefone: z.string({ required_error: "O telefone é obrigatório" })
    .length(11, 'O telefone deve ter exatamente 11 dígitos!'),

    senha: z.string({ required_error: "A senha é obrigatória!" })
    .min(8, "A senha precisa ter no mínimo 8 caracteres!"),

    role: z.string().toUpperCase().optional()
});

//todos os campos acima se tornam opcionais no PUT
export const usuarioUpdateSchema = usuarioCreateSchema.partial();