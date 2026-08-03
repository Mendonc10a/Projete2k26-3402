Como rodar o DeepGuard AI (Windows)

Pré-requisito:
Ter o Node.js instalado. Para conferir, abra o cmd e digite:

node -v

Se aparecer um número de versão (ex: v20.11.0), está tudo certo. Se der erro, baixe e instale o Node.js no site oficial antes de continuar.

Passo 1 — Abrir o cmd dentro da pasta do projeto:
Forma mais fácil:

Abra o Explorador de Arquivos e entre na pasta PROJETE (a que tem os arquivos server.js, package.json, database.js etc.)
Clique na barra de endereço lá em cima (onde mostra o caminho da pasta)
Apague o texto que está lá, digite cmd e aperte Enter

Isso abre o Prompt de Comando já dentro da pasta certa.
Alternativa: abra o cmd normalmente (Win → digite cmd → Enter), digite cd  (com espaço no final) e arraste a pasta PROJETE para dentro da janela do cmd. O caminho completo aparece sozinho — é só apertar Enter.

Passo 2 — Instalar as dependências
Com o cmd aberto na pasta certa, digite:

npm install

Aperte Enter e espere terminar (só precisa fazer isso uma vez, ou sempre que apagar a pasta node_modules). Ao final deve aparecer algo como added XX packages, sem nenhuma linha vermelha de erro.

Passo 3 — Iniciar o servidor
Ainda no cmd, digite:

npm start

Se der tudo certo, vai aparecer esta mensagem no terminal:

DeepGuard AI rodando em http://localhost:3000

Importante: essa janela do cmd precisa ficar aberta enquanto você usa o site. Se fechar o cmd, o servidor para.

Passo 4 — Abrir o site
Abra o navegador (Chrome, Edge, etc.) e acesse:
http://localhost:3000

A tela de login deve aparecer. Você pode clicar em "Criar Conta" para cadastrar um usuário novo, ou entrar com uma conta já cadastrada anteriormente.
