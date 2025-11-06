// API/API.JS
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const os = require('os');
const multer = require('multer');
const fs = require('fs/promises');
const path = require('path');
const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());

// Configuração de Conexão com o bd MySql
const dbConfig = {
    host: '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'petto',
    connectionLimit: 10
};
const pool = mysql.createPool(dbConfig);

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
        req.user = user;
        next();
    });
};

// Rotas de Autenticação
const authRouter = express.Router();


authRouter.post('/cadastro', async (req, res) => {
    const { nome, email, senha, pet_primario, cor_favorita, role } = req.body;
    const { crmv, cpf, nome_clinica, tempo_experiencia, cep_clinica, endereco, bairro_clinica, numero_clinica } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,20}$/;
    if (!passwordRegex.test(senha.trim())) {
        return res.status(400).json({ message: 'A senha não atende aos requisitos de segurança.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [users] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email.trim()]);
        if (users.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        
        const senhaHash = await bcrypt.hash(senha.trim(), 10);
        const userRole = role === 'veterinario' ? 'veterinario' : 'tutor';
        
        const userSql = 'INSERT INTO usuarios (nome, email, senha, pet_primario, cor_favorita, role) VALUES (?, ?, ?, ?, ?, ?)';
        const [userResult] = await connection.execute(userSql, [
            nome.trim(), email.trim(), senhaHash, pet_primario || null, cor_favorita || null, userRole
        ]);
        const newUserId = userResult.insertId;

        if (userRole === 'veterinario') {
            if (!crmv || !nome_clinica || !cpf) {
                await connection.rollback();
                return res.status(400).json({ message: 'CRMV, Nome da Clínica e CPF são obrigatórios para veterinários.' });
            }
            const vetSql = `
                INSERT INTO veterinarios 
                (user_id, nome, email, crmv, cpf, nome_clinica, tempo_experiencia, cep_clinica, endereco, bairro_clinica, numero_clinica) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // CORREÇÃO DEFINITIVA: Garantimos que TODOS os campos que vêm do formulário
            // sejam convertidos para 'null' se estiverem vazios/undefined.
            await connection.execute(vetSql, [
                newUserId, nome.trim(), email.trim(), crmv || null, cpf || null, nome_clinica || null, 
                tempo_experiencia || null, cep_clinica || null, endereco || null, 
                bairro_clinica || null, numero_clinica || null
            ]);
        }
        
        await connection.commit();
        res.status(201).json({ message: 'Cadastro realizado com sucesso!' });

    } catch (error) { 
        await connection.rollback();
        console.error("Erro no cadastro unificado:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' }); 
    } finally {
        connection.release();
    }
});


// Verifica se o email ja esta em uso durante o cadastro
authRouter.post('/check-email', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'E-mail não fornecido.' });
    }
    try {
        const [users] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email.trim()]);
        if (users.length > 0) {
            return res.status(409).json({ isAvailable: false, message: 'Este e-mail já está em uso.' });
        }
        return res.status(200).json({ isAvailable: true });
    } catch (error) {
        console.error("Erro ao verificar e-mail:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


// Verifica se existe o email e se a senha esta correta para que seja efetuado o login
authRouter.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });

    try {
        const [users] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email.trim()]);
        const user = users[0];
        if (!user) {
            return res.status(404).json({ message: 'Usuário não cadastrado.', errorCode: 'USER_NOT_FOUND' });
        }
        const isPasswordCorrect = await bcrypt.compare(senha, user.senha);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }
        const tokenPayload = { id: user.id, nome: user.nome, email: user.email, role: user.role };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Verifica o email se existe para recuperação de senha
authRouter.post('/verificar-email', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'E-mail é obrigatório.' });
    }

    try {
        const [users] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        
        if (users.length > 0) {
            res.status(200).json({ exists: true });
        } else {
            res.status(404).json({ exists: false, message: 'Nenhum usuário encontrado com este e-mail.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Verifica se a resposta cadastrada condiz com o valor inserido para a recuperação
authRouter.post('/verificar-resposta', async (req, res) => {
    const { email, tipo_pergunta, resposta } = req.body;

    if (!email || !tipo_pergunta || !resposta) {
        return res.status(400).json({ message: 'Informações incompletas.' });
    }

    try {
        const [users] = await pool.execute('SELECT pet_primario, cor_favorita FROM usuarios WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        let respostaCorreta = false;
        if (tipo_pergunta === 'pet' && resposta.toLowerCase() === user.pet_primario.toLowerCase()) {
            respostaCorreta = true;
        } else if (tipo_pergunta === 'cor' && resposta.toLowerCase() === user.cor_favorita.toLowerCase()) {
            respostaCorreta = true;
        }

        if (respostaCorreta) {
            const tempToken = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: '10m' });
            res.status(200).json({ message: 'Resposta correta!', token: tempToken });
        } else {
            res.status(401).json({ message: 'Resposta incorreta.' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Verifica as condições para a nova senha
authRouter.post('/redefinir-senha', async (req, res) => {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
        return res.status(400).json({ message: 'Token ou nova senha não fornecidos.' });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,20}$/;
    if (!passwordRegex.test(novaSenha)) {
        return res.status(400).json({ 
            message: 'A nova senha não atende aos requisitos de segurança.' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const email = decoded.email;

        const senhaHash = await bcrypt.hash(novaSenha, 10);
        await pool.execute('UPDATE usuarios SET senha = ? WHERE email = ?', [senhaHash, email]);

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado. Tente novamente.' });
    }
});

// Rotas do veterinario
authRouter.post('/cadastro-vet', async (req, res) => {
    const { nome, email, senha, crmv } = req.body;

    // Validação básica
    if (!nome || !email || !senha || !crmv) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    // (Você pode adicionar validação de senha aqui como na outra rota de cadastro)

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Verifica se o e-mail já está em uso na tabela de usuários
        const [users] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email.trim()]);
        if (users.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        
        // 2. Cria a conta de login na tabela 'usuarios' com a role 'veterinario'
        const senhaHash = await bcrypt.hash(senha.trim(), 10);
        const userSql = 'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)';
        const [userResult] = await connection.execute(userSql, [nome.trim(), email.trim(), senhaHash, 'veterinario']);
        const newUserId = userResult.insertId;

        // 3. Cria o perfil profissional na tabela 'veterinarios', vinculando ao user_id
        const vetSql = 'INSERT INTO veterinarios (crmv, user_id, nome, email) VALUES (?, ?, ?, ?)';
        await connection.execute(vetSql, [crmv.trim(), newUserId, nome.trim(), email.trim()]);
        
        await connection.commit();
        res.status(201).json({ message: 'Cadastro de veterinário realizado com sucesso!' });

    } catch (error) { 
        await connection.rollback();
        console.error("Erro no cadastro de veterinário:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' }); 
    } finally {
        connection.release();
    }
});

const vetRouter = express.Router();

// Middleware de segurança: verifica se o usuário é um veterinário
const isVeterinario = (req, res, next) => {
    if (req.user && req.user.role === 'veterinario') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Rota exclusiva para veterinários.' });
    }
};

// Rota para buscar os pacientes de um veterinário
vetRouter.get('/pacientes', async (req, res) => {
    try {
        // 1. Descobrir o ID do veterinário a partir do ID do usuário logado
        const [vetData] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        if (vetData.length === 0) {
            return res.status(404).json({ message: 'Perfil de veterinário não encontrado.' });
        }
        const vetId = vetData[0].id_veterinario;

        // 2. Buscar todos os pets vinculados a esse veterinário
        const sql = `
            SELECT p.id_pet, p.nome, p.raca, p.foto_url, u.nome as nome_tutor
            FROM pets p
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE p.id_veterinario = ?
        `;
        const [pacientes] = await pool.execute(sql, [vetId]);
        res.status(200).json(pacientes);
    } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
        res.status(500).json({ message: 'Erro ao buscar dados dos pacientes.' });
    }
});

// Rota para buscar os detalhes de UM paciente (incluindo o prontuário)
vetRouter.get('/pacientes/:petId', async (req, res) => {
    try {
        const { petId } = req.params;
        
        // Busca os detalhes do pet (pode reusar a lógica da rota de tutor)
        const petSql = 'SELECT * FROM pets WHERE id_pet = ?';
        const [petRows] = await pool.execute(petSql, [petId]);
        if (petRows.length === 0) {
            return res.status(404).json({ message: 'Pet não encontrado.' });
        }
        
        // Busca o prontuário do pet
        const prontuarioSql = 'SELECT * FROM prontuario WHERE id_pet = ? ORDER BY data_consulta DESC';
        const [prontuarioRows] = await pool.execute(prontuarioSql, [petId]);

        // Combina tudo e envia
        res.status(200).json({ ...petRows[0], prontuario: prontuarioRows });

    } catch (error) {
        console.error("Erro ao buscar detalhes do paciente:", error);
        res.status(500).json({ message: 'Erro ao buscar detalhes do paciente.' });
    }
});

// Rota para adicionar um novo registro de consulta ao prontuário
vetRouter.post('/pacientes/:petId/consulta', async (req, res) => {
    try {
        const { petId } = req.params;
        const { data_consulta, motivo, diagnostico, tratamento } = req.body;

        // Busca o ID do veterinário
        const [vetData] = await pool.execute('SELECT id_veterinario FROM veterinarios WHERE user_id = ?', [req.user.id]);
        const vetId = vetData[0].id_veterinario;

        const sql = 'INSERT INTO prontuario (id_pet, id_veterinario, data_consulta, motivo, diagnostico, tratamento) VALUES (?, ?, ?, ?, ?, ?)';
        await pool.execute(sql, [petId, vetId, data_consulta, motivo, diagnostico, tratamento]);

        res.status(201).json({ message: 'Consulta registrada com sucesso!' });
    } catch (error) {
        console.error("Erro ao registrar consulta:", error);
        res.status(500).json({ message: 'Erro ao registrar consulta.' });
    }
});

// Rotas do usuario
const userRouter = express.Router();

// ROTA PARA BUSCAR DADOS DO PERFIL DO USUÁRIO
userRouter.get('/profile', async (req, res) => {
    try {
        // --- INÍCIO DA CORREÇÃO ---
        // Verificação de segurança: garante que o ID do usuário foi extraído
        // corretamente do token de autenticação pelo middleware.
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Token de autenticação inválido ou corrompido.' });
        }
        // --- FIM DA CORREÇÃO ---

        const [users] = await pool.execute(
            'SELECT id, nome, email, foto_url FROM usuarios WHERE id = ?',
            [req.user.id] // Agora temos certeza que req.user.id existe
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado no banco de dados.' });
        }
        res.status(200).json(users[0]);
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ message: 'Erro interno ao buscar dados do perfil.' });
    }
});

// ROTA PARA ATUALIZAR O PERFIL (NOME E FOTO)
userRouter.put('/profile', upload.single('foto'), async (req, res) => {
    const { nome } = req.body;
    const userId = req.user.id;
    let foto_url = null;

    if (!nome) {
        return res.status(400).json({ message: 'O nome é obrigatório.' });
    }

    try {
        // Se uma nova foto foi enviada
        if (req.file) {
            // Primeiro, busca a foto antiga para deletá-la depois
            const [users] = await pool.execute('SELECT foto_url FROM usuarios WHERE id = ?', [userId]);
            const oldFotoUrl = users[0]?.foto_url;

            // Deleta o arquivo antigo se existir
            if (oldFotoUrl) {
                const oldPath = path.join(__dirname, oldFotoUrl);
                try {
                    await fs.unlink(oldPath);
                } catch (fileError) {
                    console.error("Erro ao deletar foto antiga:", fileError);
                }
            }
            
            // Salva a nova foto
            const ext = req.file.mimetype.split('/')[1];
            const newFilename = `${req.file.filename}.${ext}`;
            const newPath = `uploads/${newFilename}`;
            await fs.rename(req.file.path, newPath);
            foto_url = `/${newPath}`;
        }

        let sql, params;
        if (foto_url) {
            sql = 'UPDATE usuarios SET nome = ?, foto_url = ? WHERE id = ?';
            params = [nome.trim(), foto_url, userId];
        } else {
            sql = 'UPDATE usuarios SET nome = ? WHERE id = ?';
            params = [nome.trim(), userId];
        }

        await pool.execute(sql, params);
        res.status(200).json({ message: 'Perfil atualizado com sucesso!' });

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ message: 'Erro ao atualizar o perfil.' });
    }
});

// ROTA PARA DELETAR A CONTA (COM CONFIRMAÇÃO DE SENHA)
userRouter.post('/delete-account', async (req, res) => {
    const { senha } = req.body;
    const userId = req.user.id;

    if (!senha) {
        return res.status(400).json({ message: 'A senha é obrigatória para confirmar a exclusão.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar a senha
        const [userRows] = await connection.execute('SELECT senha, foto_url FROM usuarios WHERE id = ?', [userId]);
        const user = userRows[0];
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }

        const isPasswordCorrect = await bcrypt.compare(senha, user.senha);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Senha incorreta. A exclusão foi cancelada.' });
        }

        // Coletar URLs de todas as fotos a serem deletadas
        const [petRows] = await connection.execute('SELECT foto_url FROM pets WHERE id_usuario = ?', [userId]);
        const petFotoUrls = petRows.map(p => p.foto_url).filter(Boolean); // Filtra URLs nulas
        const allFotoUrls = user.foto_url ? [...petFotoUrls, user.foto_url] : petFotoUrls;

        // Deletar os pets do usuário (as vacinas e medicamentos serão deletadas em cascata - ON DELETE CASCADE)
        await connection.execute('DELETE FROM pets WHERE id_usuario = ?', [userId]);

        // Deletar o usuário
        await connection.execute('DELETE FROM usuarios WHERE id = ?', [userId]);
        
        // Se tudo deu certo no banco, salvar a transação
        await connection.commit();

        // Deletar os arquivos de imagem do servidor
        for (const url of allFotoUrls) {
            const filePath = path.join(__dirname, url);
            try {
                await fs.unlink(filePath);
            } catch (fileError) {
                console.error(`Erro ao deletar arquivo ${filePath}:`, fileError);
            }
        }

        res.status(200).json({ message: 'Sua conta e todos os seus dados foram deletados com sucesso.' });

    } catch (error) {
        await connection.rollback();
        console.error("Erro ao deletar conta:", error);
        res.status(500).json({ message: 'Ocorreu um erro e não foi possível deletar sua conta.' });
    } finally {
        connection.release();
    }
});



// Rotas dos "Pets"
const petRouter = express.Router();

petRouter.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.id_pet, p.nome, p.raca, p.foto_url,
                (p.peso IS NOT NULL AND p.cor IS NOT NULL AND p.cor != '') as is_details_complete,
                (SELECT COUNT(*) FROM vacinas v WHERE v.id_pet = p.id_pet) > 0 as has_vaccines,
                (SELECT COUNT(*) FROM medicamentos m WHERE m.id_pet = p.id_pet) > 0 as has_meds
            FROM pets p
            WHERE p.id_usuario = ?
        `;
        const [pets] = await pool.execute(sql, [req.user.id]);
        res.status(200).json(pets);
    } catch (error) {
        console.error("Erro ao buscar pets:", error);
        res.status(500).json({ message: 'Erro ao buscar dados dos pets.' });
    }
});

petRouter.get('/:petId', async (req, res) => {
    try {
        const { petId } = req.params;
        const userId = req.user.id;

        // Busca pet
        const petSql = 'SELECT * FROM pets WHERE id_pet = ? AND id_usuario = ?';
        const [petRows] = await pool.execute(petSql, [petId, userId]);
        if (petRows.length === 0) {
            return res.status(404).json({ message: 'Pet não encontrado.' });
        }
        const pet = petRows[0];

        // Busca vacinas
        const [vacinasRows] = await pool.execute(
            'SELECT * FROM vacinas WHERE id_pet = ? ORDER BY data_aplicacao DESC',
            [petId]
        );

        const vacinas = vacinasRows.map(v => ({
            id: v.id_dataset,
            nome: v.nome,
            data_aplicacao: v.data_aplicacao,
            data_desconhecida: v.data_desconhecida
        }));

        // Busca medicamentos
        const [medicamentosRows] = await pool.execute(
            'SELECT * FROM medicamentos WHERE id_pet = ? ORDER BY data_aplicacao DESC',
            [petId]
        );

        const medicamentos = medicamentosRows.map(m => ({
            id: m.id_dataset,
            nome: m.nome_medicamento,
            data_aplicacao: m.data_aplicacao,
            data_desconhecida: m.data_desconhecida
        }));
        
        res.status(200).json({ ...pet, vacinas, medicamentos });
    } catch (error) {
        console.error("Erro ao buscar detalhes do pet:", error);
        res.status(500).json({ message: 'Erro ao buscar detalhes do pet.' });
    }
});     

// "Salva" e armazena a imagem do pet
petRouter.post('/', upload.single('foto'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const payload = req.body;
        
        const idade_valor = payload.idade_valor ? parseInt(payload.idade_valor, 10) : null;
        const idade_meses = payload.idade_meses ? parseInt(payload.idade_meses, 10) : null;
        const idade_dias = payload.idade_dias ? parseInt(payload.idade_dias, 10) : null;
        const peso = payload.peso ? parseFloat(payload.peso) : null;
        
        const vacinas = payload.vacinas ? JSON.parse(payload.vacinas) : [];
        const medicamentos = payload.medicamentos ? JSON.parse(payload.medicamentos) : [];

        if (!payload.nome || !payload.especie || !payload.raca || !payload.sexo) {
            throw new Error('Campos básicos do pet não preenchidos.');
        }

        const isIdadeValida = (payload.data_nascimento && payload.data_nascimento.match(/^\d{4}-\d{2}-\d{2}$/)) || (idade_valor !== null && !isNaN(idade_valor));
        if (!isIdadeValida) {
             throw new Error('A data de nascimento ou a idade aproximada é obrigatória.');
        }
        
        let foto_url = null;
        if (req.file) {
            const ext = req.file.mimetype.split('/')[1];
            const newFilename = `${req.file.filename}.${ext}`;
            const newPath = `uploads/${newFilename}`;
            await fs.rename(req.file.path, newPath);
            foto_url = `/uploads/${newFilename}`;
        }
        
        const petSql = `INSERT INTO pets (nome, id_usuario, especie, raca, idade_valor, idade_unidade, idade_meses, idade_dias, sexo, peso, cor, data_nascimento, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const petParams = [ payload.nome, req.user.id, payload.especie, payload.raca, idade_valor, payload.idade_unidade || null, idade_meses, idade_dias, payload.sexo, peso, payload.cor || null, payload.data_nascimento || null, foto_url ];
        
        const [petResult] = await connection.execute(petSql, petParams);
        const newPetId = petResult.insertId;
        
        if (vacinas.length > 0) {
            const vacinaSql = 'INSERT INTO vacinas (id_pet, id_dataset, nome, data_aplicacao, data_desconhecida) VALUES ?';
            const vacinaValues = vacinas.map((v) => [
                newPetId,
                v.id,
                v.nome,
                v.data_aplicacao || null,
                v.data_desconhecida ?? 0 
            ]);            
            await connection.query(vacinaSql, [vacinaValues]);
        }
        
        if (medicamentos.length > 0) {
            const medSql = 'INSERT INTO medicamentos (id_pet, id_dataset, nome_medicamento, data_aplicacao, data_desconhecida) VALUES ?';
            const medValues = medicamentos.map((m) => [
                newPetId,
                m.id,
                m.nome, 
                m.data_aplicacao || null,
                m.data_desconhecida ?? 0
            ]);            
            await connection.query(medSql, [medValues]);
        }
        
        await connection.commit();
        res.status(201).json({ message: 'Pet cadastrado com sucesso!', petId: newPetId });
    } catch (error) {
        await connection.rollback();
        console.error("Erro na transação de cadastro de pet:", error);
        res.status(500).json({ message: error.message || 'Erro ao cadastrar o pet.' });
    } finally {
        connection.release();
    }
});

petRouter.put('/:petId', async (req, res) => {
    try {
        const { petId } = req.params;
        const userId = req.user.id;
        const { nome, especie, raca, idade_valor, idade_unidade, sexo, peso, cor } = req.body;
        if (!nome || !especie || !raca || !idade_valor || !idade_unidade || !sexo) { return res.status(400).json({ message: 'Campos essenciais não podem ser vazios.' }); }
        const sql = `UPDATE pets SET nome = ?, especie = ?, raca = ?, idade_valor = ?, idade_unidade = ?, sexo = ?, peso = ?, cor = ? WHERE id_pet = ? AND id_usuario = ?`;
        const params = [ nome, especie, raca, idade_valor, idade_unidade, sexo, peso || null, cor || null, petId, userId ];
        const [result] = await pool.execute(sql, params);
        if (result.affectedRows === 0) { return res.status(404).json({ message: 'Pet não encontrado ou você não tem permissão.' });}
        res.status(200).json({ message: 'Dados do pet atualizados com sucesso!' });
    } catch (error) {
        console.error("Erro ao atualizar pet:", error);
        res.status(500).json({ message: 'Erro interno ao tentar atualizar.' });
    }
});

petRouter.delete('/:petId', async (req, res) => {
    const { petId } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Busca o pet para garantir que ele existe e pertence ao usuário, e para pegar a foto do pet
        const [petRows] = await connection.execute(
            'SELECT foto_url FROM pets WHERE id_pet = ? AND id_usuario = ?',
            [petId, userId]
        );

        if (petRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Pet não encontrado ou você não tem permissão.' });
        }
        
        const { foto_url } = petRows[0];

        // Apaga explicitamente os registros filhos
        await connection.execute('DELETE FROM vacinas WHERE id_pet = ?', [petId]);
        await connection.execute('DELETE FROM medicamentos WHERE id_pet = ?', [petId]);

        // Apaga o registro do pet
        const [deleteResult] = await connection.execute(
            'DELETE FROM pets WHERE id_pet = ?', 
            [petId]
        );
        
        // Finaliza a transação no banco ou seja salva no banco
        await connection.commit();

        // Se tudo deu certo no banco, ele retorna e apaga o arquivo da foto
        if (deleteResult.affectedRows > 0 && foto_url) {
            try {
                const filename = path.basename(foto_url); 
                const filePath = path.join(__dirname, 'uploads', filename);
                
                await fs.unlink(filePath);
                console.log(`Arquivo de imagem deletado: ${filePath}`);
            } catch (fileError) {
                console.error(`Erro ao deletar o arquivo de imagem ${filePath}:`, fileError);
            }
        }
        
        connection.release();
        res.status(200).json({ message: 'Pet deletado com sucesso!' });

    } catch (error) {
        // Desfaz tudo se algo der errado
        await connection.rollback(); 
        connection.release();
        console.error("Erro ao deletar o pet:", error);
        res.status(500).json({ message: 'Erro ao deletar o pet.' });
    }
});

// Registro de rotas, inicialização e conexão do servidor
app.use('/api/auth', authRouter);
app.use('/api/user', authenticateToken, userRouter);
app.use('/api/pets', authenticateToken, petRouter);
app.use('/api/vet', authenticateToken, isVeterinario, vetRouter);

const startServer = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('✅ Conexão com o banco de dados estabelecida.');
        app.listen(port, '0.0.0.0', () => {
            console.log(`\n🚀 Servidor Petto rodando na porta ${port}.`);
            console.log('   Acessível na sua rede local. Use um dos IPs abaixo no seu app:');
            const interfaces = os.networkInterfaces();
            Object.keys(interfaces).forEach(ifaceName => {
                const ifaceGroup = interfaces[ifaceName];
                if (ifaceGroup) {
                    ifaceGroup.forEach(iface => {
                        if (iface.family === 'IPv4' && !iface.internal) {
                            console.log(`   ➡️  http://${iface.address}:${port}`);
                        }
                    });
                }
            });
            console.log('');
        });
    } catch (error) {
        console.error('❌ ERRO FATAL: Não foi possível conectar ao banco de dados.', error.message);
        process.exit(1);
    }
};

startServer();