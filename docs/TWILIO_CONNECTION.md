# Ligação Twilio à AFROLOC — 9 de novembro de 2026

## Verificação real

Na conta Twilio YAMIOO, o número ativo é **+1 984 314 5245**. O contacto institucional em Angola, **+244 923 828 282**, recebeu o teste `TESTE-0911` às 18h15 de Luanda. O registo Twilio `SM965f6a685c21541ea8693a10688e4650` passou a Delivered. Isto comprova a entrega reportada pelo fornecedor; não comprova a receção de uma resposta na AFROLOC.

O número Twilio está associado ao serviço `yamioo- Search Engine`, SID `MGa2e3716da6f72c8a3bde5d6d18a28c0a`. A integração está em `Defer to sender’s webhook`. O webhook do número foi ligado ao recetor AFROLOC abaixo, com método POST; a persistência foi confirmada após recarregar a página. O endereço anterior era `https://demo.twilio.com/welcome/sms/reply/`.

## Novo recetor

`https://ljcxqwjvjgobhisqkujr.supabase.co/functions/v1/fair-witness-twilio`

Aceita somente POST form-urlencoded assinado por Twilio. Verifica a assinatura HMAC-SHA1 sobre a URL pública fixa e todos os parâmetros, a conta, o destinatário e o MessageSid. Consulta também o Message Resource na Twilio e confronta remetente, destinatário, texto, sentido inbound e instante original de receção. Não confia num horário inventado pelo cliente. Rejeita mensagens alteradas, antigas ou sem credenciais. Responde em TwiML.

Configuração privada obrigatória: **FAIR_TWILIO_ACCOUNT_SID**, com o identificador da conta YAMIOO, e **FAIR_TWILIO_AUTH_TOKEN**, com o Auth Token principal da conta YAMIOO, guardado exclusivamente nos secrets das Edge Functions. Nunca inserir no código, no frontend, numa URL ou em mensagens de chat. Os dois secrets estão presentes; a comparação descrita abaixo identificou divergência no token. O nome específico evita alterar credenciais de outros produtos.

O identificador da conta é obrigatório e só existe na configuração privada `FAIR_TWILIO_ACCOUNT_SID`. O número tem o valor acima como configuração inicial e pode ser substituído por `FAIR_TWILIO_NUMBER`. O contacto +244 não passa a ser um número Twilio com esta alteração: respostas automáticas devem ser enviadas para o número +1 até existir outro número ligado ao fornecedor.

O GET do recetor devolve somente `configured` e `witness_workflow_enabled`, nunca os segredos. `configured` indica presença/configuração dos campos, não prova a validade do token. Só um webhook real autenticado e a consulta ao fornecedor comprovam a ligação.

## Ativação controlada

1. Publicar o novo recetor com `verify_jwt=false`: a autenticação é a assinatura Twilio obrigatória; uma sessão JWT não é enviada pelo fornecedor.
2. Guardar `FAIR_TWILIO_ACCOUNT_SID` e `FAIR_TWILIO_AUTH_TOKEN` no servidor e verificar a configuração. Não alterar o webhook do número enquanto faltar a credencial.
3. Substituir apenas o SMS webhook de **+1 984 314 5245** pelo novo URL, método POST. O serviço já delega no webhook do número; não alterar chamadas nem os restantes serviços. A configuração antiga acima permite reversão.
4. Do telefone institucional **+244 923 828 282**, responder `TESTE-RETORNO`. Só este telefone pode acionar o diagnóstico. O recetor verifica o registo real na Twilio, escreve um evento de diagnóstico sem corpo/telefone nos logs e devolve um SMS de confirmação do teste. Não cria moradores, testemunhas, aceitação, aprovação ou certificados.
5. Confirmar nos logs o evento `afroloc_twilio_return_test` e o MessageSid da mensagem real. Um teste sintético local não conta como esta confirmação.

A validação de testemunhas continua bloqueada até a migração de identidade/SMS/revisão, o backend e a interface coordenada estarem publicados, e o teste real estar concluído. Só então definir `FAIR_SMS_INBOUND_READY=true`. O transporte da feira usa Twilio por omissão; `FAIR_SMS_PROVIDER=infobip` mantém a alternativa anterior explicitamente selecionada. O envio obtém o destino de resposta do número Twilio configurado.

As mensagens ACEITO/RECUSO têm de incluir a referência do pedido. São registadas pela mesma RPC privada, com separação entre aceitação e revisão oficial. Duplicados não reenviam confirmações. Falhas do fornecedor/base de dados devolvem erro, sem confirmar uma aceitação que não foi guardada.

## Testes

Nove testes Twilio cobrem o vetor de assinatura publicado na documentação oficial, adulteração, parâmetros adicionais, conta/destinatário incorretos, confronto com o fornecedor, horário real, bloqueio por configuração incompleta, falhas de persistência, diagnóstico restrito, duplicados e transporte de saída sem aprovação fictícia. As suites anteriores continuam aplicáveis.

Fontes: https://www.twilio.com/docs/usage/security e https://www.twilio.com/docs/messaging/api/message-resource .

## Estado da publicação

O recetor `fair-witness-twilio` está publicado na AFROLOC, versão 3, com registo de etapas de rejeição sem credenciais ou corpo da mensagem. Após o utilizador guardar a configuração privada, o GET passou a devolver 200 com `configured=true` e `witness_workflow_enabled=false`. Um POST sem assinatura foi rejeitado com 403. Isto comprova configuração presente e bloqueio de pedidos não autenticados; ainda não comprova a validade da credencial num callback real.

O webhook SMS do número **+1 984 314 5245** foi alterado de `https://demo.twilio.com/welcome/sms/reply/` para o novo recetor AFROLOC, com método POST. A persistência foi confirmada após recarregar a página Twilio. Chamadas e associação ao serviço mantiveram-se inalteradas.

O SMS real `TESTE-RETORNO`, SID `SM4ab3213f4a090d5cd69567b7621ede49`, chegou à Twilio em 9 de novembro de 2026 às 18:02:22 UTC (19:02:22 Luanda), de **+244 923 828 282** para **+1 984 314 5245**. O callback recebeu HTTP 403; a repetição através do Request Inspector produziu `afroloc_twilio_rejected` com etapa `signature`. Não houve confirmação automática da AFROLOC.

A comparação local dos digests SHA256 apresentados pelo Supabase com os valores da conta YAMIOO confirmou que `FAIR_TWILIO_ACCOUNT_SID` corresponde à conta, mas `FAIR_TWILIO_AUTH_TOKEN` não corresponde ao Auth Token atual. Nenhum segredo ou digest foi acrescentado a este documento. O formulário de edição do token foi preparado para introdução e gravação pelo titular.

Próximo passo necessário: substituir o token pelo Auth Token correto da conta YAMIOO e repetir a entrega do pedido já recebido, confirmando a assinatura, o registo real no fornecedor e a resposta automática. A migração e ativação do processo completo de testemunhas continuam pendentes.
