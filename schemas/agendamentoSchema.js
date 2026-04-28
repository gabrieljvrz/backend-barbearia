import { z } from 'zod';

export const agendamentoCreateSchema = z.object({
    servicoId: z.number({ required_error: "O ID do serviço é obrigatório" })
        .int("O ID deve ser um número inteiro.")
        .positive("O ID do serviço é inválido"),

    barbeiroId: z.number({ required_error: "O ID do barbeiro é obrigatório" })
        .int("O ID deve ser um número inteiro.")
        .positive("O ID do barbeiro é inválido"),

    //opcional, se não vier, o controller pega do token de qm tá logado
    clienteId: z.number().int().positive().optional(),

    data_hora_inicio: z.coerce.date({
        required_error: "A data e hora do agendamento são obrigatórias!",
        invalid_type_error: "Formato de data inválido!"
    }).min(new Date(), "Você não pode agendar em uma data ou horário que já passou!"),

    status: z.enum(['PENDENTE', 'CONCLUIDO', 'CANCELADO']).optional()
});

//tudo opcional
export const agendamentoUpdateSchema = agendamentoCreateSchema.partial();