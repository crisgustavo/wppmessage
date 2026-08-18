Documentação da API para envio de mensagens no whatsapp

API para integração com WhatsApp via Baileys comunicando com a API do Whatsapp Web (não oficial), permitindo gerenciamento de sessões, leitura de QR Code e envio de mensagens.

Base URL: https://wppcontrole.ereno.app.br

🔐 Autenticação
Todas as requisições utilizam um identificador único de sessão (sessionId) que deve ser fornecido no corpo da requisição em formato JSON.

Campo	                Tipo	              Descrição
sessionId	            string	            Identificador único da sessão (CNPJ, número WhatsApp ou UUID)

## 📌 Endpoints
## 1. Iniciar Sessão
Inicia uma nova sessão do WhatsApp ou recupera uma sessão existente.

Endpoint: POST /init

- Corpo da Requisição:

  json
  { "sessionId": "554499991111" }

- Resposta de Sucesso:

  json
  { "status": "CREATING_QR" }


## 2. Verificar Status da Sessão
Verifica o estado atual da sessão (conectado, aguardando QR, etc).

Endpoint: POST /check

- Corpo da Requisição:

  json
  { "sessionId": "5544999373916" }

- Respostas Possíveis:

Situação	                Resposta
Aguardando QR Code	      {"connected": false, "hasQR": true}
Conectado	                {"connected": true, "jidNumber": "5544999373916"}
Desconectado	            {"connected": false, "hasQR": false}

Campos da Resposta:

Campo	          Tipo	          Descrição
connected	      boolean	        Indica se o WhatsApp está conectado
hasQR	          boolean	        Indica se há um QR Code disponível para leitura
jidNumber	      string	        Número do WhatsApp conectado (formato: DDI + DDD + número 8 dígitos)
Nota: O jidNumber retorna o número no formato internacional sem o dígito 9 adicional (ex: 554499991111).


## 3. Obter QR Code
Retorna a imagem do QR Code em formato Base64 para escaneamento.

Endpoint: POST /qr

- Corpo da Requisição:

  json
  { "sessionId": "5544999373916" }

- Resposta de Sucesso:

  json
  { "qr": "data:image/png;base64,iVBORw0KGgoAAAANS..." }

Campo	      Tipo	        Descrição
qr	        string	      Imagem PNG em Base64 (incluindo prefixo data:image/png;base64,)
Uso: A string Base64 pode ser diretamente atribuída a um elemento <img> no HTML ou convertida para imagem em aplicações desktop.


## 4. Enviar Mensagem
Envia uma mensagem de texto e/ou mídia para um contato WhatsApp.

Endpoint: POST /send

- Corpo da Requisição:

  json
  {
    "sessionId": "5544999373916",
    "number": "554499999999",
    "message": "Olá, tudo bem?",
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "filename": "imagem.png",
    "mimetype": "image/png"
  } 

- Campos da Requisição:

Campo	          Obrigatório	       Tipo	            Descrição
sessionId	      ✅	               string	          Identificador da sessão
number	        ✅	               string	          Número de destino (formato: DDI + DDD + 8 dígitos, sem o 9 inicial)
message	        ❌	               string	          Texto da mensagem
base64	        ❌	               string	          Arquivo codificado em Base64
filename	      ❌*	             string	          Nome do arquivo com extensão
mimetype	      ❌*	             string	          Tipo MIME do arquivo
*Obrigatório se base64 for fornecido.

- Formatos de Número Aceitos:

✅ 554499999999     - Correto (DDI 55 + DDD 44 + número 8 dígitos)
❌ 5544999999999    - Incorreto (não incluir o 9 adicional)
❌ (44) 99999-9999  - Incorreto (use apenas dígitos)

- Respostas:

Situação	          Resposta	          
Sucesso	            {"status": "SENT"}	
Erro	              {"status": "ERROR"}	

🔄 Fluxo de Uso Recomendado
Diagrama de Sequência
text
[Aplicação Cliente]                           [API WhatsApp]                     [WhatsApp]
        |                                           |                                 |
        |<-------- POST /init (sessionId) --------->|                                 |
        |<------- {"status":"CREATING_QR"} -------->|                                 |
        |                                           |                                 |
        |<-------- POST /check (sessionId) -------->|                                 |
        |<--- {"connected":false, "hasQR":true} --->|                                 |
        |                                           |                                 |
        |<--------- POST /qr (sessionId) ---------->|                                 |
        |<------ {"qr":"data:image/png;..."} ------>|                                 |
        |      (Exibe QR Code para o usuário)       |                                 |
        |                                           |      (Usuário escaneia QR)      |
        |                                           |<------------------------------->|
        |                                           |                                 |
        |<-------- POST /check (sessionId) -------->|                                 |
        |<- {"connected":true, "jidNumber":"..."} ->|                                 |
        |                                           |                                 |
        |<-------- POST /send (message) -------->   |                                 |
        |<----------- {"status":"SENT"} ----------->|<------ Mensagem entregue ------>|
        |                                           |                                 |


## Passo a Passo para Implementação

Iniciar Sessão

Chame /init com um sessionId único

Armazene este ID para todas as requisições subsequentes

Polling de Status

Implemente um timer/loop a cada 2 segundos chamando /check

Interrompa o polling quando receber {"connected": true}

Exibir QR Code (se necessário)

Se /check retornar {"connected": false, "hasQR": true}

Chame /qr para obter a imagem

Exiba o QR Code para o usuário escanear

Enviar Mensagens

Após conexão confirmada, use /send para enviar mensagens

O campo number deve estar no formato internacional sem o 9 adicional