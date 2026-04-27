import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import usuarios from './routes/usuarios.js';
import servicos from './routes/servicos.js'
import agendamentos from './routes/agendamentos.js'

dotenv.config();

const app = express();

const corsOptions = {
    origin: ['http://localhost:3000'],

    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],

    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions));

app.use(express.json());

app.use('/usuarios', usuarios);
app.use('/servicos', servicos);
app.use('/agendamentos', agendamentos);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("🚀 Servidor rodando com sucesso!");
});