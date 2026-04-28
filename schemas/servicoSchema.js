//categoria (string), descricao (string), valor (decimal), duracao (int - minutos)
import { z } from 'zod';

export const servicoCreateSchema = z.object({
    categoria: z.string({ required_error: "A categoria do serviço é obrigatória!" })
    .min(3, "A categoria precisa ter pelo menos 3 caracteres!"),

    descricao: z.string({ required_error: "A descrição do serviço é obrigatória!" })
    .min(5, "A descrição precisa ter pelo menos 5 caracteres!"),

    valor: z.number({ required_error: "O valor do serviço é obrigatório!"})
    .positive("O valor deve ser maior que zero!"),

    duracao: z.number({ required_error: "A duração do serviço é obrigatória!" })
    .int("A duração deve ser um número inteiro (em minutos)!")
    .positive("A duração deve ser maior que zero!")
});

export const servicoUpdateSchema = servicoCreateSchema.partial();