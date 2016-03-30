#Harlan
## Implementação do JavaScript

### Sumário

Este documento é voltado para desenvolvedores que desejam carregar o Harlan dentro de seus sistemas ou otimizá-lo através da criação de módulos. Esse documento fornece um resumo do que é necessário para se trabalhar dentro deste sistema.

![](http://www.harlan.com.br/images/bipbop-logo-460.png) 

### O que é o Harlan?

_Acompanhe, pesquise e descubra de maneira simplificada por todas as informações disponíveis na API BIPBOP._

O Harlan é um sistema de governança cadastral aberto que permite que empresas desenvolvam seus modelos de negócio e aplicativos dentro de uma plataforma única e de maneira simplificada, utilizando as informações do [Marketplace](http://marketplace.bipbop.com.br/) e [BIPBOP](http://api.bipbop.com.br/) em uma interface construída com [NodeJS](https://nodejs.org/).

![](https://nodejs.org/images/logos/nodejs-green.png)

### Dependências

Para compilar o Harlan é necessário que você tenha instalado todas as dependências do Bower e do NodeJS. Além do Ruby e Compass para que os arquivos SASS sejam corretamente carregados.

### Gerando os arquivos

O Harlan utiliza a tecnologia Gulp para a construção do projeto, o Gulp é uma ferramenta muito simples e sua documentação pode ser encontrada neste [endereço](http://gulpjs.com/). 

#### Cookbook

    sudo npm install -G gulp
    npm install
    bower install
    gulp build
    cd Server/web/
    python -m SimpleHTTPServer

## Desenvolvendo

### Estrutura de Arquivos

	└── src
	    ├── external-js
	    ├── images
	    │   ├── android
	    │   │   ├── drawable-hdpi
	    │   │   ├── drawable-ldpi
	    │   │   ├── drawable-mdpi
	    │   │   ├── drawable-xhdpi
	    │   │   ├── drawable-xxhdpi
	    │   │   └── drawable-xxxhdpi
	    │   ├── ios
	    │   │   └── AppIcon.appiconset
	    │   └── watchkit
	    │       └── AppIcon.appiconset
	    ├── js
	    │   └── internals
	    │       ├── forms
	    │       ├── interface
	    │       ├── library
	    │       ├── modules
	    │       │   └── neoassist
	    │       ├── parsers
	    │       └── widgets
	    ├── scss
	    └── static-template

### Desmistificando o _src/js/controller.js_

Todo o desenvolvimento do Harlan é orientado para que você consiga fazer o seguinte através de poucas linhas de JavaScript e CSS:

1. Sobreescrever funcionalidades existentes.
2. Receber os eventos do sistema de modo simplificado.
3. Alterar toda a interface do sistema ou pontos específicos.

O controller é visível do user-space, que é onde os módulos externos a aplicação, sejam eles injetados no Harlan ou não, ou enxergam com o nome _harlan_, por exemplo:

    /* file: src/external-js/mymodule.js */
    harlan.registerCall("mymodule::action", function (args) {});
    harlan.call("mymodule::action");

Caso você esteja dentro do user-space da aplicação Harlan:

    /* file: src/js/internals/modules/mymodule.js */
    module.exports = function(controller) {
        controller.registerCall("mymodule::action", function (args) {});
        controller.call("mymodule::action");
    };
    
    /* Dentro de controller.js adicionar antes do return */
    modules.exports = function () {
        /* ... */
       require("./modules/mymodule.js");
       return this;
    }
    
#### Criando uma Call

A call é uma função que você deseja exportar para o sistema. Por exemplo, eu desejo exportar uma função que exibe um pop-up dando Hello World, abra o console JavaScript do Chrome e digite:

    /* Chrome JS Console - https://developer.chrome.com/devtools/docs/console */
    harlan.registerCall("mymodule::popup", function (args) {
        /* Vamos chamar o módulo modal, assim como esse existem módulos interessantes em
           src/js/modules */
        var modal = harlan.call("modal");
        modal.title("Hello World!");
        modal.subtitle("Como é fácil criar um módulo para o Harlan!")
        var form = modal.createForm();
        form.element().submit(function (e) {
            e.preventDefault();
            modal.close();
        });
        form.addSubmit("exit", "Sair");
    });

Agora na sequência digite o seguinte:

    harlan.call("mymodule::popup");

Não custa dizer que o Harlan já vem com as seguintes bibliotecas pŕe-instaladas e que você pode usar em seus módulos:

1. jQuery 2.x para que você possa manipular o DOM de maneira mais fácil e intuitiva.
2. [D3JS](http://d3js.org/) e [NV3D](http://nvd3.org/) para criação de gráficos ricos para o usuário.
3. jQuery.maskedinput para mascarar entradas de usuário.
4. Você pode utilizar módulos de geração de DOM Harlan que estão dentro de _src/js/internals/modules_.
5. Widgets de interface que estão dentro de _src/js/internals/widgets_

#### Interceptando um Evento

O controller permite disparar e receber eventos, todos os eventos necessáriamente são gravados no Console do seu navegador.

    /* Antes de autenticar digite no console */
    harlan.registerTrigger("authentication::authenticated", function (args, callback) {
        console.log("Eu recebi meu callback!");
        callback(); /* Você sempre deve chamar o callback após terminar suas operações */
    });

Você também pode gerar seus próprios triggers, como por exemplo:

    harlan.trigger("mymodule::finish", {key: "value"});

#### Executando ao Inicializar

Apenas módulos internos podem executar instruções logo após a construção do DOM.

    module.exports = function (controller) {
        controller.registerBootstrap("mymodule::bootstrap", function () {
            console.log("Ok! O bootstrap funciona.");
        });
    };

## Dúvidas?

Recomendamos consultar o [StackOverflow](http://stackoverflow.com/) primeiro, as perguntas costumam serem respondidas lá. Porém, você também pode usar outros canais se assim desejar.

### IRC

Para a discussão desse software acesse  #bipbop em irc.freenode.net.

### E-mail

[Suporte BIPBOP <suporte@bipbop.com.br>](mailto:suporte@bipbop.com.br) 
