-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 22/08/2025 às 05:24
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

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
-- Estrutura para tabela `medicamentos`
--

CREATE TABLE `medicamentos` (
  `id_medicamento` int(11) NOT NULL,
  `id_pet` int(11) NOT NULL,
  `nome_medicamento` varchar(100) NOT NULL,
  `data_aplicacao` date DEFAULT NULL,
  `data_desconhecida` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `medicamentos`
--

INSERT INTO `medicamentos` (`id_medicamento`, `id_pet`, `nome_medicamento`, `data_aplicacao`, `data_desconhecida`) VALUES
(1, 54, 'Vermífugo (Remédio para Verme - Comprimido Oral)', NULL, 1),
(2, 59, 'Vermífugo (Remédio para Verme - Injetável)', NULL, 0),
(3, 59, 'Vermífugo (Remédio para Verme - Comprimido Oral)', NULL, 0),
(12, 88, 'Vermífugo (Remédio para Verme - Comprimido Oral)', '2025-07-15', 0),
(13, 88, 'Vermífugo (Remédio para Verme - Injetável)', '2025-07-15', 0);

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
  `idade_valor` int(11) DEFAULT NULL,
  `idade_unidade` varchar(10) DEFAULT 'anos',
  `idade_meses` int(11) DEFAULT NULL,
  `idade_dias` int(11) DEFAULT NULL,
  `peso` float DEFAULT NULL,
  `sexo` char(1) DEFAULT NULL,
  `cor` varchar(50) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `id_veterinario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `pets`
--

INSERT INTO `pets` (`id_pet`, `nome`, `id_usuario`, `especie`, `raca`, `idade_valor`, `idade_unidade`, `idade_meses`, `idade_dias`, `peso`, `sexo`, `cor`, `data_nascimento`, `foto_url`, `id_veterinario`) VALUES
(50, 'Rex', 63, 'Cachorro', 'Pastor Alemão', 5, 'anos', NULL, NULL, 30, 'M', 'Preto e Bege', NULL, NULL, 65),
(51, 'Thor', 64, 'Cachorro', 'Bulldog Francês', 4, 'anos', NULL, NULL, 12, 'M', 'Creme', NULL, NULL, 67),
(54, 'Caramelo ', NULL, 'cachorro', 'chow_chow', 2, 'meses', NULL, NULL, NULL, 'M', 'Caramelo ', NULL, NULL, NULL),
(56, 'Caraca', NULL, 'tartaruga', 'jabuti_piranga', 15, 'anos', NULL, NULL, 15, 'M', 'Verde', NULL, NULL, NULL),
(59, 'Caramelo ', NULL, 'cachorro', 'chow_chow', 2, 'meses', NULL, NULL, NULL, 'M', 'Caramelado', NULL, NULL, NULL),
(73, 'Urso ', 81, 'cachorro', 'vira_lata', NULL, NULL, NULL, NULL, 7, 'M', 'Caramelo', '2025-05-22', NULL, NULL),
(79, 'Rex', 85, 'cachorro', 'vira_lata', NULL, NULL, NULL, NULL, 5, 'M', 'branco', '2010-10-02', NULL, NULL),
(80, 'Tico', 86, 'gato', 'vira_lata', NULL, NULL, NULL, NULL, 5, 'M', 'Laranja', '2020-05-10', NULL, NULL),
(88, 'Caramelo', 80, 'cachorro', 'beagle', NULL, NULL, NULL, NULL, 7, 'M', 'Caramelo', '2025-05-25', '/uploads/305e91ef800377f9ec7e69038a31d168.jpeg', NULL);

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
  `endereco` varchar(200) DEFAULT NULL,
  `pet_primario` varchar(100) DEFAULT NULL COMMENT 'Resposta para a pergunta: nome do primeiro pet',
  `cor_favorita` varchar(100) DEFAULT NULL COMMENT 'Resposta para a pergunta: cor favorita'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `senha`, `nome`, `telefone`, `endereco`, `pet_primario`, `cor_favorita`) VALUES
(62, 'admin@petto.com', '$2y$10$rTMhQ3aGT6HiLzv4L/EpOOBbYAsoqZ1ywF2j.BMvASqWR6WnLNMru', 'Admin', '(11) 90000-0000', 'São Paulo/SP', NULL, NULL),
(63, 'joao.silva@gmail.com', '$2y$10$EDtGQWCxvtXwZkbgnEVXo.mCOOUQ2Tk9xgo/e30Qsv2KCNPNkDQvC', 'João Silva', '(21) 91234-5678', 'Rua das Flores, 23 - Taquaritinga/SP', NULL, NULL),
(64, 'maria.costa@gmail.com', '$2y$10$isP.6FgvgXNZpVkdan4tnuWqfaks0GaMX9wvObZRAKGuTr6i5WhkK', 'Maria Costa', '(16) 98765-4321', 'Avenida Brasil, 456 - Matão/SP', NULL, NULL),
(80, 'jonatasmoraes05@gmail.com', '$2b$10$oznvBTLMVjSR6wiV7zd5EOvVqO5PFKQbWSKPNtQxQnkTqNO138EfW', 'Jônatas', NULL, NULL, 'Tigre', 'Azul'),
(81, 'davisilva16y@gmail.com', '$2b$10$EmkG1mGTUcfFa.pyVeRkZ.C85c01nD0aPYa0slGivs4EZ/pe8/vPK', 'Davi Silva ', NULL, NULL, 'Caramelo', 'Preto '),
(82, 'davisilva016y@gmail.com', '$2b$10$7N38aKAOhBdppHobNcqlbuZkX5bAfUgmI3vIrTV9VcUYH0mjcB36S', 'Davi ', NULL, NULL, 'CARAMELO ', 'Preto '),
(83, 'morafabiana564@gmail.com', '$2b$10$71S4mo64JZfWUuXOnKeJV.2dLE50PN2PwPFNdXY57n.iWCd3.5woi', 'Fabiana ', NULL, NULL, 'Bethoven', 'Azul'),
(84, 'jhon@gmail.com', '$2b$10$tDY.AcUnElLX7iMehTwMyuUxV0tEK7cIknEI7mMXjyWjN2dfnswbO', 'Jhon', NULL, NULL, 'Tigre', 'Azul'),
(85, 'maicon354@gmail.com', '$2b$10$xLr92btjIlqzoCBWPfZxsOMSttKaFYrOvcuLaD4POBzhWJ391ul3y', 'Maicon', NULL, NULL, 'rex', 'azul'),
(86, 'stefanistraccini@gmail.com', '$2b$10$4yna7UzPShQtBzUUbUEDoeeHei.ild6CyqvAhID8rorquoTmJ2Kwy', 'Stefani', NULL, NULL, 'Tico', 'Rosa');

-- --------------------------------------------------------

--
-- Estrutura para tabela `vacinas`
--

CREATE TABLE `vacinas` (
  `id_vacina` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `data_aplicacao` date DEFAULT NULL,
  `proxima_aplicacao` date NOT NULL,
  `data_desconhecida` tinyint(1) NOT NULL DEFAULT 0,
  `id_pet` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `vacinas`
--

INSERT INTO `vacinas` (`id_vacina`, `nome`, `data_aplicacao`, `proxima_aplicacao`, `data_desconhecida`, `id_pet`) VALUES
(4, 'V10', '2025-06-26', '2026-06-26', 0, 50),
(5, 'Antirrábica', '2025-06-21', '2026-06-21', 0, 51),
(13, 'Polivalente V8 ou V10 (Cinomose, Parvovirose, etc.)', NULL, '0000-00-00', 0, 73),
(15, 'Leucemia Felina (FeLV)', '2021-06-22', '0000-00-00', 0, 80),
(17, 'Polivalente V8 ou V10 (Cinomose, Parvovirose, etc.)', '2025-08-15', '0000-00-00', 0, 88);

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
-- Índices de tabela `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD PRIMARY KEY (`id_medicamento`),
  ADD KEY `id_pet` (`id_pet`);

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
-- AUTO_INCREMENT de tabela `medicamentos`
--
ALTER TABLE `medicamentos`
  MODIFY `id_medicamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `pets`
--
ALTER TABLE `pets`
  MODIFY `id_pet` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT de tabela `vacinas`
--
ALTER TABLE `vacinas`
  MODIFY `id_vacina` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `veterinarios`
--
ALTER TABLE `veterinarios`
  MODIFY `id_veterinario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD CONSTRAINT `medicamentos_ibfk_1` FOREIGN KEY (`id_pet`) REFERENCES `pets` (`id_pet`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `vacinas_ibfk_1` FOREIGN KEY (`id_pet`) REFERENCES `pets` (`id_pet`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
