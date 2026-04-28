import express from 'express';

import { verificarToken } from '../middlewares/autenticacao.js';
import { verificarRole } from '../middlewares/autorizacao.js';
import { validarDados } from '../middlewares/validacao.js';

import { agendamentoCreateSchema, agendamentoUpdateSchema } from '../schemas/agendamentoSchema.js';

import {
    criarAgendamento,
    listarAgendamentos,
    listarAgendamentoPorId,
    editarAgendamento,
    excluirAgendamento
} from '../controllers/agendamentos.js';

const router = express.Router();

router.post('/', verificarToken, validarDados(agendamentoCreateSchema), criarAgendamento);
router.get('/', verificarToken, listarAgendamentos);
router.get('/:id', verificarToken, listarAgendamentoPorId);
router.put('/:id', verificarToken, validarDados(agendamentoUpdateSchema), editarAgendamento);
router.delete('/:id', verificarToken, verificarRole(['ADMIN']), excluirAgendamento);

export default router;