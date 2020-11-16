###Boilerplate for an Express server

Pass an object to the constructor containing three values:
- `port:integer` - The port to run on
- `assets:string[]` - a list of directories within the client that should be served by the same names
- `clientName:string` - the name of the node module that is the client

The app assumes the client will have a `\stylesheets` directory that will contain the client's stylesheets.

The app assumes the initial HTML will be contained in the file `\index.html`.

The app assumes the initial JavaScript module that should run immediately after the HTML body is loaded.
