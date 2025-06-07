# 🧩 Fullstack Kafka Demo – React + Spring Boot + PostgreSQL + Kafka (KRaft)

Este projeto é uma aplicação fullstack construída para demonstrar a integração entre um front-end em **React**, uma API em **Java Spring Boot**, um banco de dados **PostgreSQL** e uma arquitetura de mensageria baseada em **Apache Kafka no modo KRaft** (sem Zookeeper).

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: React  
- **Backend**: Spring Boot  
- **Banco de Dados**: PostgreSQL  
- **Mensageria**: Apache Kafka (modo KRaft)  
- **Build**: Maven

---

## 📦 Funcionalidades

- Interface em React que envia mensagens  
- Backend em Spring Boot que consome essas mensagens via Kafka  
- Persistência dos dados recebidos em um banco PostgreSQL  
- Comunicação assíncrona com Kafka no modo KRaft (sem Zookeeper)

---

## 📂 Estrutura do Projeto
/backend
**API Java + Consumer Kafka** <br>
/frontend
**Frontend em React**

---

## 🐞 Desafios encontrados

Durante o desenvolvimento, fui surpreendido por um erro curioso ao tentar conectar o Spring Boot ao Kafka: <br>
Connection to node -1 could not be established <br>

O estranho é que, em dois terminais separados — um publisher e outro consumer — tudo funcionava normalmente. Mas a aplicação Spring Boot (rodando no Windows via IntelliJ) simplesmente não conseguia se comunicar com o broker.

Acontece que o Kafka estava rodando no Ubuntu/WSL, e o Spring Boot no Windows. Ou seja: **redes diferentes**!

### A solução envolveu três passos simples (mas não óbvios):
- Identificar o IP atual do WSL;
- Corrigir a configuração de `bootstrap.servers` no Spring Boot;
- Ajustar o Kafka para ouvir em todas as interfaces (`listeners` e `advertised.listeners`).

### Aprendizados para levar:
- Sempre verifique se seus serviços estão rodando em ambientes distintos (Docker, WSL, VMs…);
- Estar na mesma máquina **não** significa estar na mesma rede.

---

## 🤝 Contribuições

Contribuições são bem-vindas!  
Sinta-se à vontade para abrir uma issue ou enviar um pull request com sugestões.

---

## 📄 Licença

Este projeto está licenciado sob a licença **MIT**.
