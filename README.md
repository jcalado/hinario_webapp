# Novo Hinário Adventista do Sétimo Dia - Multimédia

## Português 🇵🇹

### Como funciona

1. Abrir um "apresentador" no OBS/VMIX/Chrome/etc. Basta abrir a página inicial do projeto.
2. Definir um ID único para a sala. Controlador e Apresentador têm de estar na mesma sala.
3. Abrir a página de controlo em `/control`

Este repositório funciona em conjunto com um servidor de websockets, disponível em [jcalado/hinario_wss](https://github.com/jcalado/hinario_wss).
Para configurar o endereço do servidor, alterar as linhas `const socket = io("wss://hinario-wss.jcalado.com");`

## English 🇬🇧

### How to

1. Open a "presenter" in OBS/VMIX/Chrome/etc. Just open this react app root page.
2. Set a unique ID for the room. Control and Presenter have to be in the same room.
3. Open the control page at `/control`

This repository works alongside a websocket server, available at [jcalado/hinario_wss](https://github.com/jcalado/hinario_wss).
Change `const socket = io("wss://hinario-wss.jcalado.com");` accordingly.
