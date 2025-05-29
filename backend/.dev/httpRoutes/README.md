# REST Client vscode extension folder

This folder is for the vscode extension `humao.rest-client` which allows you to send HTTP requests and view responses directly within VS Code.

## Usage 

1. Install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) in VS Code.
2. Open any `.http` file in your project.
3. Once you prepared a request, click the Send Request link above the request (this will appear if the file's language mode is HTTP, by default .http files are like this), or use shortcut Ctrl+Alt+R(Cmd+Alt+R for macOS), or right-click in the editor and then select Send Request in the menu, or press F1 and then select/type Rest Client: Send Request, the response will be previewed in a separate webview panel of Visual Studio Code.

## Comments

Login and Register are in UserRoutes.  
But a login is at the start of each file for token fetching.