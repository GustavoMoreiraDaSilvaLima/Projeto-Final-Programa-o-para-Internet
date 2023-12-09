import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
var UsuarioRegis = [];
var ListadeUsuario = [];
var UsuAtual = "";
var Usuario_Mensagem = [];

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
app.get('/sair', Logout);
app.get('/postarMensagem', autenticar, NovaMensagem);

app.post('/registrar', Cadastro);
app.post('/login', ValidarLogin);
app.post('/cadastrarUsuario', autenticar, processaCadastroUsuario);
app.post('/postarMensagem', autenticar, PostarMensagem);


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
      <link rel="icon" href="/logo.png">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
          integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
      <link rel="stylesheet" href="/inicial.css">
  </head>
  
  <body>
        <div  class="float-right">
        <a href="/sair"><button class="ml-3 btn btn-danger">Encerrar Sessão</button></a>
      </div>
      <div class="float-right">
        <p>Olá ${UsuAtual}</p>
      </div>
      <div class="container col-7">
          <h1 class="text-center color"><u>Menu</u></h1>
          <div class="altinha">
              <ul>
              <li class="par"><a href="/cadastrarUsuario.html">Cadastro de Usuario</a></li>
              <li class="par"><a href="/postarMensagem">Bate-Papo</a></li>
          </ul>
          </div>
  
      </div>
      <p class="par text-right" style="margin-top: 500px;">Seu Ultimo acesso foi em <strong class="last-acess">${dataUltimoAcesso}</strong></p>
  
  </body>
  
  </html>
  `
  );
}
function Logout(requisicao, resposta) {
  requisicao.session.usuarioAutenticado = false;
  resposta.redirect('/login.html');

  console.log("------Console de Pessoas Logadas--------");
  for (let dados of UsuarioRegis) {
    console.log("Email:", dados.email);
    console.log("Senha:", dados.senha);
    console.log("Nome:", dados.nome);
    console.log("----------------------------------------")
  }
}

function ValidarLogin(requisicao, resposta) {
  const email = requisicao.body.emailcadas;
  const senha = requisicao.body.senhacadas;




  if (email && senha)
    for (let dados of UsuarioRegis) {
      if ((email === dados.email) && (senha === dados.senha)) {
        requisicao.session.usuarioAutenticado = true;




        //Guardar o nome do usuario atualmente Logado
        const UsuarioAtual = BuscaBancoDeDados(email, senha);
        UsuAtual = UsuarioAtual;
        resposta.redirect('/');

        //Listar o login para o servidor
        console.log("Usuario Logado: ", UsuAtual);
      }
    }
  resposta.end(`
  <!DOCTYPE html>
  <html lang="pt-br">
  
  <head>
      <meta charset="UTF-8">
      <link rel="icon" href="/erro.png">
      <link rel="stylesheet" href="/paginaErro.css">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
          integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
      <title>Falha na Autenticação</title>
  </head>
  
  <body class="escuro">
      <div class="altinha">
          <div class="container border border-danger dentro">
              <h3 class="text-center letraalto">Usuario ou Senha Invalidos</h3>
              <p class="letraalto text-center"><a class="text-danger" href="/login.html">Voltar ao Login <a></p>
          </div>
      </div>
  </body>
  
  </html>
      `);
}

function Cadastro(requisicao, resposta) {
  const NomeUsu = requisicao.body.nomecriado;
  const registUsu = requisicao.body.usucriado;
  const senhaRegis = requisicao.body.senhacriado;
  const confSenha = requisicao.body.confsenha;


  //enviar/guardar na variavel
  if (!(registUsu && senhaRegis && NomeUsu && senhaRegis) || (senhaRegis != confSenha)) {
    let conteudoResposta = '';
    conteudoResposta += `<!DOCTYPE html>
      <html lang="pt-br">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Autenticação</title>
          <link rel="icon" href="/cadeado.png">
          <link rel="stylesheet" href="/login.css">
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
              integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
          
      </head>
      
      <body class="fundo">
          <div class="container mt-5">
              <div class="row">
                  <div class="col-sm border border-success rounded quadrado">
                      <div class="my-5 ml-5">
                          <h1>Cadastrar</h1>
                          <form action="/registrar" method="POST">
                              <label for="NomeUsu">Nome de Usuario</label>
                              <input type="text" id="nomecriado" name="nomecriado" value="${NomeUsu}"class="form-control col-md-7" placeholder="Nome"><br>
                              `;
    if (!NomeUsu) {
      conteudoResposta += `
                                <p class="text-danger">Informe um nome de Usuário</p>
                                `
    }

    conteudoResposta += `
                              <label for="email">E-mail:</label>
                              <input type="text" id="usucriado" name="usucriado" value="${registUsu}" placeholder="email@email.com"
                                  class="form-control col-md-7"><br>`;
    if (!registUsu) {
      conteudoResposta += `
                                <p class="text-danger">Informe um Email</p>
                                `
    }
    conteudoResposta += `
                              <label for="senha">Senha:</label>
                              <input type="password" id="senhacriado" name="senhacriado" value="${senhaRegis}" placeholder="Senha"
                                  class="form-control col-md-5"><br>`
    if (!senhaRegis) {
      conteudoResposta += `
      <p class="text-danger">Senha nao pode estar <strong>vazio</strong></p>
      `
    }
    conteudoResposta += `
                              <label for="confsenha">Confirmar Senha</label>
                              <input type="password" id="confsenha" name="confsenha" value="${confSenha}" class="form-control col-md-7" placeholder="Confirmar Senha"><br>`
    if (!confSenha || senhaRegis != confSenha) {
      conteudoResposta += `
                            <p class="text-danger">Senha não <strong>coincidem</strong></p>
                          `
    }
    conteudoResposta += `
                              <input type="reset" class="btn btn-danger" value="Limpar Dados">
                              <input type="submit" class="btn btn-success ml-1" value="Criar Conta">
                          </form>
                      </div>
                  </div>
                  <div class="col-sm border border-info ml-1  rounded quadrado">
                      <div class="my-5 ml-5">
                          <h1>Login</h1>
                          <form action='/login' method='POST'>
                              <label for="login">E-mail:</label>
                              <input class="form-control col-md-7" type="text" id="emailcadas" name="emailcadas" placeholder="email@email.com">
                              <br>
                              <label for="password">Senha:</label>
                              <input class="form-control col-md-5" type="password" id="senhacadas" name="senhacadas"
                                  placeholder="Senha">
                              <br>
                              <input type="reset" class="btn btn-danger" value="Limpar">
                              <input type="submit" class="btn btn-success ml-1" value="Login">
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      
      </body>
      
      </html>`



    resposta.end(conteudoResposta);
  }
  else {
    const usuario = {
      email: registUsu,
      senha: senhaRegis,
      nome: NomeUsu
    };

    UsuarioRegis.push(usuario);//guardar no Array

    let conteudoResposta = `
    <!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conta Criada com sucesso</title>
    <link rel="icon" href="/cadeado.png">
    <link rel="stylesheet" href="/contacriada.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
        integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
</head>

<body class="fundo">
    <div class="altinha">
        <div class="container mt-5 fundo1">
            <div class="row">
                <div class="col-sm border border-success rounded">
                    <div class="my-5 ml-5">
                        <h1 class="text-center">Conta criada com sucesso</h1>
                        <a href="/login.html"><button class="btn btn btn-success btn-lg meio">Clique Aqui para
                                Prosseguir e logar corretamente</button></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
    `;
    let pos = UsuarioRegis.length;
    console.log("----Usuario Cadastro com sucesso----");
    console.log(UsuarioRegis[pos - 1].nome);
    console.log(UsuarioRegis[pos - 1].email);
    console.log(UsuarioRegis[pos - 1].senha);
    console.log("-------------------------------------");
    resposta.end(conteudoResposta);

  }
}

function BuscaBancoDeDados(email, senha) {
  let nome = "";
  for (let busca of UsuarioRegis) {
    if (email == busca.email && senha == busca.senha) {
      nome = busca.nome;
    }
  }
  return nome;
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
    let i = 1;
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

function PostarMensagem(requisicao, resposta) {
  const Usu = requisicao.body.Usuario;
  const Men = requisicao.body.Mensagem;

  if (Usu != '' && Men != '') {
    const dat = new Date();
    let Apelido_chat = BuscaApe(Usu);
    const NovaMensagem = {
      nome: Usu,
      apelido: Apelido_chat,
      mensagem: Men,
      momento: dat.toLocaleDateString(),
      Hora: dat.toLocaleTimeString()
    };
    Usuario_Mensagem.push(NovaMensagem);

    let conteudoPagina = `
    <!DOCTYPE html>
  <html lang="pt-br">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bate-Papo</title>
      <link rel="icon" href="/Chat.png">
      <link rel="stylesheet" href="/batepapo.css">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
          integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
  </head>
  
  <body>
  <h1 class="text-center badge badge-pill badge-primary">Bate-Papo</h1>
  <h1 class="text-center badge badge-pill badge-success">On</h1>
  <a href="/" class="text-center badge badge-pill badge-secondary">Retornar ao Menu</a>
      <div class="container">
          <h1 class="text-center">Bate-Papo</h1>
          <div class="border  border-primary rounded">`
    for (let Mensagem of Usuario_Mensagem) {
      conteudoPagina += `
              <div class="border border-secondary rounded mx-5 my-5">
                  <h6 class="ml-5 mt-5 ">${Mensagem.apelido}</h6>
                  <p class=" pequeno ml-5">Enviado por ${Mensagem.nome} no dia ${Mensagem.momento} às ${Mensagem.Hora}</p>
                  <p class="ml-5 mb-5">${Mensagem.mensagem}</p>
              </div>
              `;
    }
    conteudoPagina += `
          </div>
          <div class="mt-5 border">
              <div class="mx-5 my-5">
                  <form action="/postarMensagem" method="POST">
                      <label>Enviar Mensagem</label>
                      <label for="Usuario">Usuário</label>
                      <select class="form-control col-md-3 my-3" name="Usuario" id="Usuario">
                        <option value="">Selecione o Usuario</option>`;
    for (let Usuarios of ListadeUsuario) {
      conteudoPagina += `
                      
                          <option value="${Usuarios.nome}">${Usuarios.nome}</option>`;
    }
    conteudoPagina += `
                        </select>
                      <label for="mensagem">Mensagem:</label>
                      <input class="form-control col-md-7 my-3" type="text" name="Mensagem" id="Mensagem">
                      <input type="submit" class="btn btn-success ml-1 my-3" value="Enviar Mensagem">
                  </form>
              </div>
          </div>
      </div>
  </body>
  
  
  </html>
    `;

    resposta.end(conteudoPagina);
  }
  else {
    let ConteudoErro = `
    <!DOCTYPE html>
    <html lang="pt-br">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bate-Papo</title>
        <link rel="icon" href="/Chat.png">
        <link rel="stylesheet" href="/batepapo.css">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
            integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    </head>
    
    <body>
    <h1 class="text-center badge badge-pill badge-primary">Bate-Papo</h1>
    <h1 class="text-center badge badge-pill badge-success">On</h1>
    <a href="/" class="text-center badge badge-pill badge-secondary">Retornar ao Menu</a>
        <div class="container">
            <h1 class="text-center">Bate-Papo</h1>
            <div class="border  border-primary rounded">`
    for (let Mensagem of Usuario_Mensagem) {
      ConteudoErro += `
                <div class="border border-secondary rounded mx-5 my-5">
                    <h6 class="ml-5 mt-5 ">${Mensagem.apelido}</h6>
                    <p class=" pequeno ml-5">Enviado por ${Mensagem.nome} no Dia ${Mensagem.momento} às ${Mensagem.Hora}</p>
                    <p class="ml-5 mb-5">${Mensagem.mensagem}</p>
                </div>
                `;
    }
    ConteudoErro += `
            </div>`
    if (Usu != '' || Men != '') {
      ConteudoErro += `<div class="mt-5 border border-danger">`
    }
    else {
      ConteudoErro += `<div class="mt-5 border">`
    }
    ConteudoErro += `
                <div class="mx-5 my-5">
                    <form action="/postarMensagem" method="POST">
                        <label>Enviar Mensagem</label>
                        <label for="Usuario">Usuário</label>
                        <select class="form-control col-md-3 my-3" name="Usuario" id="Usuario">
                          <option value="">Selecione o Usuario</option>`;
    for (let Usuarios of ListadeUsuario) {
      ConteudoErro += `
                        
                            <option value="${Usuarios.nome}">${Usuarios.nome}</option>`;
    }
    ConteudoErro += `
                          </select>
                        <label for="mensagem">Mensagem:</label>
                        <input class="form-control col-md-7 my-3" type="text" name="Mensagem" id="Mensagem" value="${Men}">
                        <input type="submit" class="btn btn-success ml-1 my-3" value="Enviar Mensagem">`;
                        if (Usu != '' || Men != ''){
                          ConteudoErro += `<p class="text-danger">Usuario ou Mensagem nao podem estar em branco</p>`;
                        }
                        ConteudoErro +=`
                    </form>
                </div>
            </div>
        </div>
    </body>
    
    </html>
    `;
    resposta.end(ConteudoErro);
  }
  
}

function NovaMensagem(requisicao, resposta) {
  let conteudoPagina = `
  <!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bate-Papo</title>
    <link rel="icon" href="/Chat.png">
    <link rel="stylesheet" href="/batepapo.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
        integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
</head>

<body>
<h1 class="text-center badge badge-pill badge-primary">Bate-Papo</h1>
<h1 class="text-center badge badge-pill badge-success">On</h1>
<a href="/" class="text-center badge badge-pill badge-secondary">Retornar ao Menu</a>
    <div class="container">
        <h1 class="text-center">Bate-Papo</h1>
        <div class="border  border-primary rounded">`
  for (let Mensagem of Usuario_Mensagem) {
    conteudoPagina += `
            <div class="border border-secondary rounded mx-5 my-5">
                <h6 class="ml-5 mt-5 ">${Mensagem.apelido}</h6>
                <p class=" pequeno ml-5">Enviado por ${Mensagem.nome} no dia ${Mensagem.momento} às ${Mensagem.Hora} </p>
                <p class="ml-5 mb-5">${Mensagem.mensagem}</p>
            </div>
            `;
  }
  conteudoPagina += `
        </div>
        <div class="mt-5 border">
            <div class="mx-5 my-5">
                <form action="/postarMensagem" method="POST">
                    <label>Enviar Mensagem</label>
                    <label for="Usuario">Usuário</label>
                    <select class="form-control col-md-3 my-3" name="Usuario" id="Usuario">
                      <option value="">Selecione o Usuario</option>`;
  for (let Usuarios of ListadeUsuario) {
    conteudoPagina += `
                    
                        <option value="${Usuarios.nome}">${Usuarios.nome}</option>`;
  }
  conteudoPagina += `
                      </select>
                    <label for="mensagem">Mensagem:</label>
                    <input class="form-control col-md-7 my-3" type="text" name="Mensagem" id="Mensagem">
                    <input type="submit" class="btn btn-success ml-1 my-3" value="Enviar Mensagem">
                </form>
            </div>
        </div>
    </div>
</body>

</html>
  `;
  resposta.end(conteudoPagina);
}

function BuscaApe(nome) {
  let apelido = "";
  for (let busca of ListadeUsuario) {
    if (nome == busca.nome) {
      apelido = busca.apelido;
    }
  }
  console.log(apelido);
  return apelido;
}