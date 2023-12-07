import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
var UsuarioRegis = []

const porta = 3000;
const host = '0.0.0.0';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'paginas')));
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

app.get('/')
app.get('/', autenticar, PaginaMenu);
//app.post('/Cadastro', autenticar, processaCadastroUsuario);

app.post('/login', ValidarLogin);

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
      <link rel="icon" href="/paginas/assets/img/logo.jpg">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
          integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
      <link rel="stylesheet" href="/paginas/assets/css/inicial.css">
  </head>
  
  <body>
      <div class="container col-7">
          <h1 class="text-center color"><u>Menu</u></h1>
          <div class="altinha">
              <ul>
              <li class="par"><a href="/paginas/cadastrarUsuario.html">Cadastro de Usuario</a></li>
              <li class="par"><a href="/paginas/postarMensagem.html">Bate-Papo</a></li>
          </ul>
          </div>
  
      </div>
      <p class="par text-right" style="margin-top: 500px;">Seu Ultimo acesso foi em <strong class="last-acess">${dataUltimoAcesso}</strong></p>
  
  </body>
  
  </html>
  `
  );
}

function ValidarLogin(requisicao, resposta) {
  const usuario = requisicao.body.login;
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
    UsuarioFinal = usuario;
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
