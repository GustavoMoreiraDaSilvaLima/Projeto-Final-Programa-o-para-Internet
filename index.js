import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
var UsuarioRegis = [];
var ListadeUsuario = [];

const porta = 3000;
const host = '0.0.0.0';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'paginas')));
app.use(express.static(path.join(process.cwd(), 'paginas/assets')));
app.use(express.static(path.join(process.cwd(), 'paginas/assets/css')));
app.use(express.static(path.join(process.cwd(), 'paginas/assets/img')));
app.use(express.static(path.join(process.cwd(), 'paginas/assets/js')));

app.use(cookieParser());
app.use(session({
  secret: "M1nhACh4M4D4",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 30 //Sessão por 30 Minutos
  }
}))

app.get('/', autenticar, PaginaMenu);
//app.post('/Cadastro', autenticar, processaCadastroUsuario);

app.post('/login', ValidarLogin);
app.post('/cadastrarUsuario', autenticar, processaCadastroUsuario);

app.listen(porta, host, () => {
  console.log(`Servidor executando na url http://${host}:${porta}`);
})


function autenticar(requisicao, resposta, next) {
  if (requisicao.session.usuarioAutenticado) {
    next();
  }
  else {
    resposta.redirect("/login.html");
  }
}

function PaginaMenu(requisicao, resposta) {
  const dataUltimoAcesso = requisicao.cookies.DataUltimoAcesso;
  const data = new Date();
  resposta.cookie("DataUltimoAcesso", data.toLocaleDateString() + " " + data.toLocaleTimeString(), {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true
  });
  resposta.end(`
  <!DOCTYPE html>
  <html lang="pt-br">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Menu do Sistema</title>
      <link rel="icon" href="/logo.jpg">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
          integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
      <link rel="stylesheet" href="/inicial.css">
  </head>
  
  <body>
      <div class="container col-7">
          <h1 class="text-center color"><u>Menu</u></h1>
          <div class="altinha">
              <ul>
              <li class="par"><a href="/cadastrarUsuario.html">Cadastro de Usuario</a></li>
              <li class="par"><a href="/postarMensagem.html">Bate-Papo</a></li>
          </ul>
          </div>
  
      </div>
      <p class="par text-right" style="margin-top: 500px;">Seu Ultimo acesso foi em <strong class="last-acess">${dataUltimoAcesso}</strong></p>
  
  </body>
  
  </html>
  `
  );
}
function Logout(requisicao, resposta){
  requisicao.session.usuarioAutenticado = false;
  resposta.redirect('/login.html');
}

function ValidarLogin(requisicao, resposta) {
  const email = requisicao.body.login;
  const senha = requisicao.body.password;

  const registUsu = requisicao.body.usucriado;
  const senhaRegis = requisicao.body.senhacriado;
  const Apelido = requisicao.body.apelidocriado;
  const NomeUsu = requisicao.body.nomecriado;

  let UsuarioFinal;
  let SenhaFinal;
  //enviar/guardar na variavel
  if ((registUsu != '') && (senhaRegis != '') && (Apelido != '') && (NomeUsu != '')) {
    const usuario = {
      email: registUsu,
      senha: senhaRegis,
      nome: NomeUsu,
      nickname: Apelido
    };

    UsuarioRegis.push(usuario);

    UsuarioFinal = registUsu;
    SenhaFinal = senhaRegis;
  }
  else {
    UsuarioFinal = email;
    SenhaFinal = senha;
  }
  for (let dados of UsuarioRegis) {
    if (UsuarioFinal && SenhaFinal && (UsuarioFinal == dados.email) && (SenhaFinal == dados.senha)) {
      requisicao.session.usuarioAutenticado = true;
      resposta.redirect('/');
    }
  }
  resposta.end(`
        <!DOCTYPE html>
    <html lang="pt-br">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Falha na Autenticação</title>
    </head>
    <body>
      <h3>Usuario ou Senha Invalidos</h3>
      <a href = "/login.html">Voltar ao Login <a>
      </body>
    </html>
      `);
}

function processaCadastroUsuario(requisicao, resposta) {
  let conteudoResposta = ``;
  const dados = requisicao.body;
  if (!(dados.nome && dados.dataNasc && dados.nick)) {
    conteudoResposta += `
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro de Usuario</title>
    <link rel="icon" href="/Usuario.png">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
        integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
</head>

<body>
    <div class="container col-6 rounded">
        <h1 class="p-3 mb-2 bg-primary text-white">Bem Vindo(a) ao Cadastro de Usuario</h1>
        <form action="/cadastrarUsuario" method="POST">
            <label for="fnome">Nome de Usuário</label>
            <input type="text" class="form-control col-md-5" name="nome" id="nome" value="${dados.nome}">`;
    if (!dados.nome) {
      conteudoResposta += `
            <div>
                <p class="text-danger">Informe um nome de Usuário</p>
            </div>
            `;
    }
    conteudoResposta += `
            <label for="DataNasc">Data de Nascimento</label>
            <input type="date" class="form-control col-md-2" name="dataNasc" id="dataNasc" value="${dados.dataNasc}">`;
    if (!dados.dataNasc) {
      conteudoResposta += `
            <div>
                <p class="text-danger">Informe uma Data Valida</p>
            </div>
            `;
    }
    conteudoResposta += `
            <label for="apelido">Apelido:</label>
            <input type="text" class="form-control col-md-5" name="nick" id="nick" value="${dados.nick}">`;
    if (!dados.nick) {
      conteudoResposta += `
  <div>
      <p class="text-danger">Informe um Apelido</p>
  </div>
  `;
    }

    conteudoResposta += `
    <div class="mt-2">
                <input type="reset" class="btn btn-danger" value="Limpar Dados">
                <input type="submit" class="btn btn-success ml-1" value="Criar Conta">
            </div>
            <a href="/"><button type="button" class="btn btn-outline-primary mt-3">Retornar ao Menu</button></a>
        </form>
    </div>
</body>

</html>
    `;
    resposta.end(conteudoResposta);
  }
  else {
    const RegistroChat = {
      nome: dados.nome,
      data: dados.dataNasc,
      apelido: dados.nick
    }

    ListadeUsuario.push(RegistroChat);

    conteudoResposta += `
    <!DOCTYPE html>
    <head>
        <title>Cadastrados</title>
        <meta charset="UTF-8">
        <link rel="icon" href="/Usuario.png">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    </head>
    <body>
        <h1 class="text-center">Lista de Usuários Cadastrados</h1>
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Nome de Usuario</th>
                    <th scope="col">Data de Nascimento</th>
                    <th scope="col">Apelido</th>
                </tr>
            </thead>
            <tbody>`;
    let i = 0;
    for (let Cadastro of ListadeUsuario) {
      conteudoResposta += `
                        <tr>
                            <th scope="row">${i}</th>
                            <td>${Cadastro.nome}</td>
                            <td>${Cadastro.data}</td>
                            <td>@${Cadastro.apelido}</td>
                        </tr>`;
      i++;
    }
    conteudoResposta += `
                        </tbody>
                    </table>
                    <a class="btn btn-light" href="/" role="button">Voltar ao menu</a>
                    <a class="btn btn-dark ml-1" href="/cadastrarUsuario.html" role="button">Continuar cadastrando</a>
                </body>
            </html>
                `;

    resposta.end(conteudoResposta);
  }
}
