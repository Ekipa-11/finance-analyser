# REST Client vscode extension folder

This folder is for the vscode extension `humao.rest-client` which allows you to send HTTP requests and view responses directly within VS Code.

## Usage 

1. Install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) in VS Code.
2. Open any `.http` file in your project.
3. Once you prepared a request, click the Send Request link above the request (this will appear if the file's language mode is HTTP, by default .http files are like this), or use shortcut Ctrl+Alt+R(Cmd+Alt+R for macOS), or right-click in the editor and then select Send Request in the menu, or press F1 and then select/type Rest Client: Send Request, the response will be previewed in a separate webview panel of Visual Studio Code.

## Comments

Login and Register are in UserRoutes.  
But a login is at the start of each file for token fetching.

### Reports

[readyUserForReport.http](readyUserForReport.http) allows you to get a user ready for report generation.  
Then just run the [getReport.sh](getReport.sh) script to generate the report or run the curl command in the terminal:
```bash
curl -H "Authorization: Bearer ${api_token}" http://localhost:3000/api/export/ -o responseFiles/transactions.csv
```
where `${api_token}` is the authentication token.

The same applies to the csv export, just run the [getTransactions.sh](getTransactions.sh) script or run the curl command in the terminal:
```bash
curl -H "Authorization: Bearer ${api_token}" http://localhost:3000/api/export/ -o responseFiles/transactions.csv
```
where `${api_token}` is the authentication token.

The response files will be saved in the `responseFiles` folder.
