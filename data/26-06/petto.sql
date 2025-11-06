-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 25/06/2025 às 03:29
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `petto`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `pets`
--

CREATE TABLE `pets` (
  `id_pet` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `especie` varchar(50) DEFAULT NULL,
  `raca` varchar(50) DEFAULT NULL,
  `idade` int(11) DEFAULT NULL,
  `peso` float DEFAULT NULL,
  `sexo` char(1) DEFAULT NULL,
  `cor` varchar(50) DEFAULT NULL,
  `id_veterinario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `pets`
--

INSERT INTO `pets` (`id_pet`, `nome`, `id_usuario`, `especie`, `raca`, `idade`, `peso`, `sexo`, `cor`, `id_veterinario`) VALUES
(50, 'Rex', 63, 'Cachorro', 'Pastor Alemão', 5, 30, 'M', 'Preto e Bege', 65),
(51, 'Thor', 64, 'Cachorro', 'Bulldog Francês', 4, 12, 'M', 'Creme', 67);

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `email` varchar(50) NOT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `telefone` varchar(15) DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `senha`, `nome`, `telefone`, `endereco`) VALUES
(62, 'admin@petto.com', '$2y$10$rTMhQ3aGT6HiLzv4L/EpOOBbYAsoqZ1ywF2j.BMvASqWR6WnLNMru', 'Admin', '(11) 90000-0000', 'São Paulo/SP'),
(63, 'joao.silva@gmail.com', '$2y$10$EDtGQWCxvtXwZkbgnEVXo.mCOOUQ2Tk9xgo/e30Qsv2KCNPNkDQvC', 'João Silva', '(21) 91234-5678', 'Rua das Flores, 23 - Taquaritinga/SP'),
(64, 'maria.costa@gmail.com', '$2y$10$isP.6FgvgXNZpVkdan4tnuWqfaks0GaMX9wvObZRAKGuTr6i5WhkK', 'Maria Costa', '(16) 98765-4321', 'Avenida Brasil, 456 - Matão/SP'),
(65, 'teste@gmail.com', '$2b$10$2Q/OFvwMRgkR3aQ1NnB7qO48OgYIcryI31ZGsQzUXKVZmNhjN93Ne', 'Jônatas de Moraes da Silva', NULL, NULL),
(66, 'morafabiana564@gmail.com', '$2b$10$P2y4Y12Pqgjje1UoBKloUuC9yUmXwpn4.qesW/i4rOZ5DxBElT4Zu', 'Fabiana moraes', NULL, NULL),
(67, 'tes@gmail.com', '$2b$10$ZFOXEL0HuQHowtlf1GkEguPd5DYeV1IiVHkQnQ3z3yqvIHPRxU9U2', 'Teste', NULL, NULL),
(68, 'jonatasmoraes05@gmail.com', '$2b$10$6dRphwgjpjTNXXoNuyWlkOxN8uuvwCpg0awEjwY30neqmQzJWReHO', 'Jhon', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `vacinas`
--

CREATE TABLE `vacinas` (
  `id_vacina` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `data_aplicacao` date NOT NULL,
  `proxima_aplicacao` date NOT NULL,
  `id_pet` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `vacinas`
--

INSERT INTO `vacinas` (`id_vacina`, `nome`, `data_aplicacao`, `proxima_aplicacao`, `id_pet`) VALUES
(4, 'V10', '2025-06-26', '2026-06-26', 50),
(5, 'Antirrábica', '2025-06-21', '2026-06-21', 51);

-- --------------------------------------------------------

--
-- Estrutura para tabela `veterinarios`
--

CREATE TABLE `veterinarios` (
  `id_veterinario` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `telefone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `endereco` varchar(100) DEFAULT NULL,
  `cpf` varchar(15) DEFAULT NULL,
  `crmv` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `veterinarios`
--

INSERT INTO `veterinarios` (`id_veterinario`, `nome`, `telefone`, `email`, `endereco`, `cpf`, `crmv`) VALUES
(63, 'Dr. Lucas Oliveira', '(16) 98765-4321', 'lucas.oliveira@gmail.com', 'Flares, 723 - Taquaritinga/SP', '123.456.789-00', '12345-SP'),
(64, 'Dra. Ana Souza', '(16) 99876-5432', 'ana.souza@gmail.com', 'Avenida Brasil, 456 - Matão/SP', '987.654.321-99', '67891-SP'),
(65, 'Dr. Pedro Silva', '(16) 91234-5678', 'pedro.silva@gmail.com', 'Rua Acácias, 789 - Araraquara/SP', '456.789.123-22', '54321-SP'),
(66, 'Dra. Mariana Costa', '(16) 93456-7890', 'marianacosta@gmail.com', 'Alameda, 101 - Taquaritinga/SP', '789.123.456-33', '17223-SP'),
(67, 'Dr. Carlos Pereira', '(16) 94567-8901', 'carlos.pereira@gmail.com', 'Travessa, 55 - Taquaritinga/SP', '321.654.987-44', '33445-SP');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `pets`
--
ALTER TABLE `pets`
  ADD PRIMARY KEY (`id_pet`),
  ADD KEY `idx_id_veterinario` (`id_veterinario`),
  ADD KEY `fk_usuario_pet` (`id_usuario`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `vacinas`
--
ALTER TABLE `vacinas`
  ADD PRIMARY KEY (`id_vacina`),
  ADD KEY `id_pet` (`id_pet`);

--
-- Índices de tabela `veterinarios`
--
ALTER TABLE `veterinarios`
  ADD PRIMARY KEY (`id_veterinario`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `pets`
--
ALTER TABLE `pets`
  MODIFY `id_pet` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT de tabela `vacinas`
--
ALTER TABLE `vacinas`
  MODIFY `id_vacina` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `veterinarios`
--
ALTER TABLE `veterinarios`
  MODIFY `id_veterinario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `pets`
--
ALTER TABLE `pets`
  ADD CONSTRAINT `fk_usuario_pet` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_veterinario` FOREIGN KEY (`id_veterinario`) REFERENCES `veterinarios` (`id_veterinario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `vacinas`
--
ALTER TABLE `vacinas`
  ADD CONSTRAINT `vacinas_ibfk_1` FOREIGN KEY (`id_pet`) REFERENCES `pets` (`id_pet`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
