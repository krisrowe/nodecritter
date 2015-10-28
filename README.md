About
============
Just provides some very crude but functional client code in Node.js to help get started consuming the Crittercism REST API.

Getting Setup
============
  1. Clone the repository
  2. Ensure you have [Node.js](http://nodejs.org/download/) installed.
  3. Install package depenencies by running the following from the command line within this directory: `npm install`

Running the script
==================
### Retrieve stats for all applications
#### Syntax
```
node index.js [client ID] [username] [password]
```

#### Example
```
node index.js WV3v7ZTaYmqtUOMNvO7oPhLi8RN9zFoo joe@tester.com abc123
```

### Retrieve stats for a specific application
#### Syntax
```
node index.js [client ID] [username] [password] [app name]
```

#### Example
```
node index.js WV3v7ZTaYmqtUOMNvO7oPhLi8RN9zFoo joe@tester.com abc123 WhizBang
```

### Retrieve stats for a specific version of an application
#### Syntax
```
node index.js [client ID] [username] [password] [app name] [app version]
```

#### Example
```
node index.js WV3v7ZTaYmqtUOMNvO7oPhLi8RN9zFoo joe@tester.com abc123 WhizBang "2.1 (2.1.12)"
```