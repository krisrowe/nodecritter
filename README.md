About
============
Just provides some very crude but functional client code in Node.js to help get started consuming the Crittercism REST API. Extracts stats by date in CSV format, including daily active users, app loads, crashes, and more.

Example Output (CSV Format)
===========================
Date,dau,appLoads,crashes,crashPercent,affectedUsers,affectedUserPercent,rating,mau
10/1/15,24,272,2,5.88,7,112,0,2733606
10/2/15,40,33,0,0,0,0,0,1533190
10/3/15,3,54,0,0,0,0,0,2154166
10/4/15,15632,7210,528,17.08,270,11,0,2769219
10/5/15,412848,436448,5402,12.4,9500,5,0,2730924
10/6/15,234840,211355,878,16.64,1636,20,0,1510185

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