# Identificação, aceitação por SMS e revisão das testemunhas

## Âmbito e comportamento

Esta alteração aplica o processo de três testemunhas aos endereços inscritos na feira. Usa os códigos e titulares dos registos canónicos de afroloc.ao. Não altera o protocolo de testemunhas de endereços que não estejam inscritos na feira.

1. O requerente indica o nome completo da testemunha, o telefone angolano confirmado e o AFROLOC. Os três têm de corresponder à mesma conta. É possível identificar a testemunha antes da inspeção da residência; isso não representa aceitação nem validação documental.
2. Antes do envio, o servidor exige inspeções atuais das duas moradas, distância até 500 m e o mesmo condomínio quando o endereço a validar pertence a um condomínio. Um validador oficial ativo, independente e com jurisdição é atribuído ao pedido.
3. O fornecedor recebe um pedido real de envio. A mensagem identifica o requerente e a morada, explica a declaração e indica o número institucional de receção. A testemunha envia `ACEITO <referência>` ou `RECUSO <referência>` do telefone previamente confirmado, dentro de 48 horas. Uma aceitação do fornecedor não prova entrega, nem substitui a resposta da testemunha.
4. O webhook autenticado confere remetente, destinatário, referência, prazo e identificador da mensagem. Mensagens repetidas são idempotentes. O SMS aceite deixa o testemunho pendente de decisão.
5. O validador atribuído confere identidade, endereço, distância e condomínio, assinala a conferência e regista uma justificação antes de aprovar ou recusar. A decisão fica disponível no processo. Esta versão não envia automaticamente outro SMS com a decisão.
6. A certificação da feira exige três pessoas distintas, com telefones distintos, aceitação por SMS e aprovação oficial. A evidência é reavaliada: alterações de identidade, telefone, residência ou autoridade podem deixar de contar para a certificação.

O nome é confrontado com o perfil canónico (sem distinção de maiúsculas ou espaços repetidos). Isto não equivale a uma consulta de documento de identidade num registo oficial. Não se recolhem imagens de BI nesta alteração. A conferência humana e a sua justificação ficam registadas.

## Persistência e segurança

- Migração: `20261109144720_fair_witness_identity_sms_review.sql`, posterior à migração factual da feira.
- Tabelas privadas com RLS: `fair_witness_requests` e `fair_witness_sms_receipts`; sem leitura/escrita direta por `anon` ou `authenticated`.
- RPC privada `fair_witness_process`; o servidor deriva o utilizador da sessão autenticada, com AAL2 quando a conta tem MFA configurado.
- Webhook separado `fair-witness-sms`, com Basic Auth obrigatório. Segredos ausentes bloqueiam o processamento. Não modifica `receive-witness-sms`, usado noutros fluxos.
- Os pedidos não permitem substituir a testemunha ou transferir o testemunho para outra morada. A confirmação pelo protocolo antigo não pode aprovar endereços inscritos na feira.
- Limites de reenvio: cinco minutos por pedido e dez preparações por requerente/hora. Um timeout é apresentado como envio não confirmado; não como entrega falhada ou aprovação.
- Nenhum nome, contacto, entrega ou aceitação real é criado pela migração.

## Configuração e publicação coordenada

Estado em 9 de novembro de 2026: implementação testada localmente; esta nova migração e estes handlers ainda não foram aplicados ao serviço em produção. O acesso pelo conector Vercel ao projeto `dist` continua a devolver 404, embora o projeto exista no painel. Os merges das PRs anteriores foram feitos entre branches de trabalho e não comprovam atualização de `app.afroloc.ao`.

O operador deve configurar um número com receção real de SMS no fornecedor e encaminhamento HTTP para:

`https://ljcxqwjvjgobhisqkujr.supabase.co/functions/v1/fair-witness-sms`

Configuração privada necessária:

| Variável | Uso |
| --- | --- |
| `FAIR_SMS_NUMBER` | Número institucional, em formato internacional, que recebe as respostas |
| `INFOBIP_INBOUND_USER`, `INFOBIP_INBOUND_PASS` | Credenciais Basic Auth do encaminhamento no fornecedor |
| `INFOBIP_BASE_URL`, `INFOBIP_API_KEY` | Envio pela conta Infobip autorizada |
| `INFOBIP_SENDER` | Identificador de envio autorizado; se omitido, usa AFROLOC |
| `FAIR_SMS_INBOUND_READY` | `true` apenas depois de confirmar número e encaminhamento; sem este valor, o envio fica bloqueado |

O webhook público deve ter `verify_jwt=false`: autentica o fornecedor por Basic Auth obrigatório, não por sessão de utilizador. `fair-verification` valida internamente a sessão. Guardar segredos exclusivamente no serviço; não no repositório ou no frontend.

Ordem de ativação: confirmar que não surgiram testemunhos no protocolo antigo desde a última consulta; resolver qualquer pedido existente sem o promover automaticamente; aplicar a migração; publicar os dois handlers; publicar a interface coordenada no projeto correto. Manter o envio bloqueado enquanto não houver número e encaminhamento configurados. A interface recusa operar com uma API anterior à versão 3 e mostra uma mensagem de atualização pendente.

Antes de anunciar operação real, completar um teste autorizado de envio, receção, recusa, aprovação por validador designado e persistência após recarregar a aplicação. Usar pessoas e telemóveis reais autorizados. Não usar números fictícios na produção. Não assumir que um remetente alfanumérico permite receber respostas.

Documentação do fornecedor: https://www.infobip.com/docs/tutorials/receive-an-sms-message-using-infobip-api e https://www.infobip.com/docs/sms/communication-options . O handler recebe lotes `results` do formato `MO_JSON_2`, com `from`, `to`, `text`, `messageId` e `receivedAt`.

## Verificação concluída e limites

`npm --prefix tests/fair test` cobre os handlers antigos e novos e os contratos PostgreSQL em PGlite: identificação, telefone confirmado, titularidade, separação de aceitação/aprovação, autorização, mensagens repetidas, expiração, recusa, limites de reenvio, 499,9/500,1 m, condomínio, bloqueio de protocolos antigos, impossibilidade de substituir a identidade/morada e certificação com três aprovações. Todos os dados de teste são isolados e não entram na produção.

`npm run build` verifica TypeScript e compila a aplicação. Estes testes não comprovam entrega real de SMS nem a publicação. A designação real dos validadores e um número com receção testada continuam necessários. A reatribuição de pedidos cujo validador deixe de estar ativo requer tratamento operacional; não existe nesta alteração um botão de reatribuição automática.
