/*
  Warnings:

  - Added the required column `data_hora_fim` to the `Agendamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `agendamento` ADD COLUMN `data_hora_fim` DATETIME(3) NOT NULL;
