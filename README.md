# GeoGallery 

Este guia contém o passo a passo rápido para instalar, executar e utilizar o aplicativo **GeoGallery** no seu dispositivo.

---

##  Como Executar o Aplicativo (Passo a Passo)

Siga os comandos abaixo no terminal do seu computador para ligar o projeto localmente:

### 1. Pré-requisitos

Antes de começar, certifique-se de ter:
* O **Node.js** instalado no computador.
* O aplicativo **Expo Go** instalado no seu celular (disponível na Play Store do Android ou App Store do iPhone).

### 2. Abrir a pasta do projeto

Abra o Prompt de Comando (CMD) do Windows e entre no diretório onde os arquivos estão salvos:

cd Documents
cd app-galeria

### 3. GUIA DE USO DO APP

1. Aba da Galeria (Gerenciar Fotos e Banco de Dados)
Nesta tela você controla todos os seus registros salvos localmente no SQLite:

Tirar uma Nova Foto: 1. No topo da tela, digite um nome no campo "Qual o título do momento?...".
2. Toque no botão azul "Tirar Foto e Registrar Local".
3. Aceite as permissões de Câmera e GPS do celular.
4. Tire a foto e confirme. O aplicativo captura as coordenadas exatas do GPS e salva tudo (título, foto, localização e data) no banco de dados na hora.

Exibição de Coordenadas: Cada cartão na galeria exibe de forma automática o título, a data de captura e os dados numéricos de Latitude (Lat) e Longitude (Lon) obtidos no momento do registro.

Buscar por Título: Use a barra de pesquisa "Buscar foto por título...". A lista se filtra de forma automática e instantânea na tela enquanto você digita.

Editar Título: Toque no botão cinza "Editar Título" em qualquer foto. Uma janelinha vai abrir no centro da tela; basta digitar o novo nome e clicar em "Salvar" para atualizar o banco SQLite.

Excluir Foto: Toque no botão vermelho "Excluir" e confirme no aviso para apagar o registro definitivamente do celular.

2. Aba do Mapa (Visualização Espacial)
Esta aba transforma as coordenadas salvas no banco de dados em pontos visuais no mapa:

Marcadores (Pins): O mapa exibe alfinetes azuis nos locais geográficos exatos onde cada foto do seu aplicativo foi capturada.

Ver Detalhes e Miniatura: Toque em qualquer marcador azul. Um painel moderno vai subir na parte inferior da tela mostrando o título, a data, a foto em miniatura e as coordenadas completas de Latitude e Longitude daquele registro.

Fechar o Panel: Para esconder as informações e continuar navegando no mapa, basta tocar no botão "✕" do painel ou clicar em qualquer espaço em branco do próprio mapa.








